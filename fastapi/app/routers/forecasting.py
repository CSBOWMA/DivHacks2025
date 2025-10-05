from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
import sys
import os
import logging
from typing import Optional
from datetime import datetime, date

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.database.db_init import get_db_connection

router = APIRouter(prefix="/forecasting", tags=["forecasting"])

# Check Prophet availability at module load
PROPHET_AVAILABLE = False
try:
    from prophet import Prophet
    import pandas as pd
    import numpy as np
    import warnings
    warnings.filterwarnings('ignore')
    PROPHET_AVAILABLE = True
    logger.info("Prophet loaded successfully")
except ImportError as e:
    logger.error(f"Failed to import Prophet: {e}")
except Exception as e:
    logger.error(f"Unexpected error loading Prophet: {e}")


@router.get("/health")
async def forecasting_health():
    """Check if forecasting service is ready"""
    return {
        "status": "ok" if PROPHET_AVAILABLE else "prophet_unavailable",
        "prophet_available": PROPHET_AVAILABLE,
        "message": "Forecasting service is ready" if PROPHET_AVAILABLE else "Prophet not available"
    }


@router.get("/{account_id}/balance-forecast")
async def forecast_account_balance(
    account_id: str,
    days: int = Query(default=30, ge=1, le=365, description="Days to forecast into future")
):
    """
    Predict future account balance using Prophet ML model.
    """

    if not PROPHET_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Prophet forecasting service is not available. Please install: pip install prophet"
        )

    logger.info(f"[START] Forecasting for account {account_id}, days: {days}")

    # Import here to avoid crashes if not available
    from prophet import Prophet
    import pandas as pd
    import numpy as np

    try:
        # Get database connection and fetch data
        logger.info("Connecting to database...")
        with get_db_connection() as conn:
            cur = conn.cursor()

            # Get current balance
            logger.info(f"Fetching balance for account {account_id}")
            cur.execute("SELECT balance FROM accounts WHERE id = %s", (account_id,))
            account_row = cur.fetchone()

            if not account_row:
                logger.warning(f"Account {account_id} not found")
                raise HTTPException(status_code=404, detail="Account not found")

            current_balance = float(account_row[0]) if account_row[0] is not None else 0.0
            logger.info(f"Current balance: {current_balance}")

            # Get daily net cash flow
            query = """
            WITH daily_flows AS (
                SELECT
                    DATE(transaction_date) as date,
                    SUM(amount) as net_flow
                FROM deposits
                WHERE account_id = %s
                    AND status = 'executed'
                    AND transaction_date IS NOT NULL
                    AND amount IS NOT NULL
                GROUP BY DATE(transaction_date)

                UNION ALL

                SELECT
                    DATE(transaction_date) as date,
                    -SUM(amount) as net_flow
                FROM withdrawals
                WHERE account_id = %s
                    AND status = 'executed'
                    AND transaction_date IS NOT NULL
                    AND amount IS NOT NULL
                GROUP BY DATE(transaction_date)

                UNION ALL

                SELECT
                    DATE(transaction_date) as date,
                    -SUM(amount) as net_flow
                FROM transfers
                WHERE account_id = %s
                    AND status = 'executed'
                    AND transaction_date IS NOT NULL
                    AND amount IS NOT NULL
                GROUP BY DATE(transaction_date)
            )
            SELECT
                date,
                SUM(net_flow) as daily_net
            FROM daily_flows
            GROUP BY date
            ORDER BY date ASC;
            """

            logger.info("Executing transaction history query...")
            cur.execute(query, (account_id, account_id, account_id))
            rows = cur.fetchall()
            logger.info(f"Found {len(rows)} historical data points")

            cur.close()
        # Connection automatically closed after exiting 'with' block
        logger.info("Database connection closed")

        if len(rows) < 14:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient data for forecasting. Need at least 14 days, found {len(rows)}"
            )

        # Prepare data for Prophet
        logger.info("Preparing data for Prophet...")
        df = pd.DataFrame(rows, columns=['ds', 'y'])

        # Handle NaN values
        df = df.dropna()
        if len(df) < 14:
            raise HTTPException(
                status_code=400,
                detail="Insufficient clean data after removing invalid values"
            )

        # Convert ds to datetime FIRST - this is critical
        df['ds'] = pd.to_datetime(df['ds'])

        # Calculate cumulative balance over time
        df['y'] = df['y'].astype(float).cumsum() + current_balance

        logger.info(f"Training Prophet model with {len(df)} data points...")
        logger.info(f"Date range: {df['ds'].min()} to {df['ds'].max()}")
        logger.info(f"Data types - ds: {df['ds'].dtype}, y: {df['y'].dtype}")

        # Train Prophet model with error handling
        try:
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=False,
                changepoint_prior_scale=0.05,
                interval_width=0.95
            )

            # Suppress Prophet's verbose output
            import logging as prophet_logging
            prophet_logging.getLogger('prophet').setLevel(prophet_logging.WARNING)

            model.fit(df)
            logger.info("Model trained successfully")
        except Exception as e:
            logger.error(f"Prophet training failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Model training failed: {str(e)}"
            )

        # Make future predictions
        logger.info(f"Generating {days} day forecast...")
        try:
            future = model.make_future_dataframe(periods=days)
            forecast = model.predict(future)
            logger.info("Forecast generated successfully")
            logger.info(f"Forecast date range: {forecast['ds'].min()} to {forecast['ds'].max()}")
        except Exception as e:
            logger.error(f"Forecast generation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Forecast generation failed: {str(e)}"
            )

        # Get only future predictions - ensure datetime comparison
        last_historical_date = pd.Timestamp(df['ds'].max())
        logger.info(f"Filtering predictions after: {last_historical_date}")

        future_forecast = forecast[forecast['ds'] > last_historical_date].copy()
        logger.info(f"Future predictions: {len(future_forecast)} days")

        # Format response
        predictions = []
        for _, row in future_forecast.iterrows():
            predictions.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "predicted_balance": float(row['yhat']),
                "lower_bound": float(row['yhat_lower']),
                "upper_bound": float(row['yhat_upper'])
            })

        logger.info(f"[SUCCESS] Forecast completed with {len(predictions)} predictions")

        return {
            "account_id": account_id,
            "current_balance": current_balance,
            "forecast_days": days,
            "historical_data_points": len(df),
            "predictions": predictions,
            "model_info": {
                "algorithm": "Facebook Prophet",
                "features": ["daily_seasonality", "weekly_seasonality"],
                "training_period": f"{df['ds'].min().strftime('%Y-%m-%d')} to {df['ds'].max().strftime('%Y-%m-%d')}"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Forecasting failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Forecasting error: {str(e)}"
        )


@router.get("/aggregate-forecast")
async def forecast_total_deposits(
    days: int = Query(default=30, ge=1, le=365, description="Days to forecast")
):
    """
    Forecast total bank deposits across all accounts.
    """

    if not PROPHET_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Prophet forecasting service is not available"
        )

    logger.info(f"[START] Aggregate forecast for {days} days")

    from prophet import Prophet
    import pandas as pd

    try:
        logger.info("Connecting to database...")
        with get_db_connection() as conn:
            cur = conn.cursor()

            # Get daily total deposits across all accounts
            query = """
            SELECT
                DATE(transaction_date) as date,
                SUM(amount) as total_deposits
            FROM deposits
            WHERE status = 'executed'
                AND transaction_date IS NOT NULL
                AND amount IS NOT NULL
            GROUP BY DATE(transaction_date)
            ORDER BY date ASC;
            """

            logger.info("Executing aggregate query...")
            cur.execute(query)
            rows = cur.fetchall()
            logger.info(f"Found {len(rows)} historical data points")

            cur.close()
        # Connection automatically closed
        logger.info("Database connection closed")

        if len(rows) < 14:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient data. Need at least 14 days, found {len(rows)}"
            )

        # Prepare data
        logger.info("Preparing data for Prophet...")
        df = pd.DataFrame(rows, columns=['ds', 'y'])
        df = df.dropna()

        # Convert to datetime FIRST
        df['ds'] = pd.to_datetime(df['ds'])
        df['y'] = df['y'].astype(float)

        logger.info(f"Date range: {df['ds'].min()} to {df['ds'].max()}")
        logger.info(f"Data types - ds: {df['ds'].dtype}, y: {df['y'].dtype}")

        # Train model
        logger.info("Training Prophet model...")
        try:
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=True,
                changepoint_prior_scale=0.1,
                interval_width=0.95
            )

            import logging as prophet_logging
            prophet_logging.getLogger('prophet').setLevel(prophet_logging.WARNING)

            model.fit(df)
            logger.info("Model trained successfully")
        except Exception as e:
            logger.error(f"Prophet training failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Model training failed: {str(e)}"
            )

        # Forecast
        logger.info(f"Generating {days} day forecast...")
        try:
            future = model.make_future_dataframe(periods=days)
            forecast = model.predict(future)
            logger.info("Forecast generated successfully")
            logger.info(f"Forecast date range: {forecast['ds'].min()} to {forecast['ds'].max()}")
        except Exception as e:
            logger.error(f"Forecast generation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Forecast generation failed: {str(e)}"
            )

        # Get only future predictions - ensure datetime comparison
        last_historical_date = pd.Timestamp(df['ds'].max())
        logger.info(f"Filtering predictions after: {last_historical_date}")

        future_forecast = forecast[forecast['ds'] > last_historical_date].copy()
        logger.info(f"Future predictions: {len(future_forecast)} days")

        predictions = []
        for _, row in future_forecast.iterrows():
            predictions.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "predicted_deposits": max(0, float(row['yhat'])),
                "lower_bound": max(0, float(row['yhat_lower'])),
                "upper_bound": float(row['yhat_upper'])
            })

        logger.info(f"[SUCCESS] Forecast completed with {len(predictions)} predictions")

        return {
            "forecast_type": "aggregate_deposits",
            "forecast_days": days,
            "historical_data_points": len(df),
            "predictions": predictions,
            "summary": {
                "avg_predicted_daily_deposits": sum(p['predicted_deposits'] for p in predictions) / len(predictions),
                "total_predicted_deposits": sum(p['predicted_deposits'] for p in predictions)
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR] Forecasting failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Forecasting error: {str(e)}"
        )