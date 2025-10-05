from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import sys
import os
import pandas as pd
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.database.db_init import get_db_connection

router = APIRouter(prefix="/forecasting", tags=["forecasting"])


@router.get("/{account_id}/balance-forecast")
def forecast_account_balance(
    account_id: str,
    days: int = Query(default=30, ge=1, le=365, description="Days to forecast into future")
):
    """
    Predict future account balance using Prophet ML model.

    Analyzes historical transaction patterns (deposits, withdrawals, transfers)
    to forecast the account balance for the next N days.

    Query parameters:
    - days: Number of days to forecast (default 30, max 365)
    """

    try:
        # Import Prophet here to avoid loading if not needed
        from prophet import Prophet
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="Prophet not installed. Run: pip install prophet"
        )

    try:
        with get_db_connection() as conn:
            cur = conn.cursor()

            # Get current balance
            cur.execute("SELECT balance FROM accounts WHERE id = %s", (account_id,))
            account_row = cur.fetchone()

            if not account_row:
                raise HTTPException(status_code=404, detail="Account not found")

            current_balance = float(account_row[0]) if account_row[0] else 0.0

            # Get daily net cash flow (deposits - withdrawals - transfers)
            query = """
            WITH daily_flows AS (
                SELECT
                    DATE(transaction_date) as date,
                    SUM(amount) as net_flow
                FROM deposits
                WHERE account_id = %s
                    AND status = 'completed'
                    AND transaction_date IS NOT NULL
                GROUP BY DATE(transaction_date)

                UNION ALL

                SELECT
                    DATE(transaction_date) as date,
                    -SUM(amount) as net_flow
                FROM withdrawals
                WHERE account_id = %s
                    AND status = 'completed'
                    AND transaction_date IS NOT NULL
                GROUP BY DATE(transaction_date)

                UNION ALL

                SELECT
                    DATE(transaction_date) as date,
                    -SUM(amount) as net_flow
                FROM transfers
                WHERE account_id = %s
                    AND status = 'completed'
                    AND transaction_date IS NOT NULL
                GROUP BY DATE(transaction_date)
            )
            SELECT
                date,
                SUM(net_flow) as daily_net
            FROM daily_flows
            GROUP BY date
            ORDER BY date ASC;
            """

            cur.execute(query, (account_id, account_id, account_id))
            rows = cur.fetchall()

            if len(rows) < 14:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient data for forecasting. Need at least 14 days, found {len(rows)}"
                )

            # Prepare data for Prophet
            df = pd.DataFrame(rows, columns=['ds', 'y'])

            # Calculate cumulative balance over time
            df['y'] = df['y'].cumsum() + current_balance

            # Train Prophet model
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=False,
                changepoint_prior_scale=0.05
            )
            model.fit(df)

            # Make future predictions
            future = model.make_future_dataframe(periods=days)
            forecast = model.predict(future)

            # Get only future predictions
            future_forecast = forecast[forecast['ds'] > df['ds'].max()].copy()

            # Format response
            predictions = []
            for _, row in future_forecast.iterrows():
                predictions.append({
                    "date": row['ds'].strftime('%Y-%m-%d'),
                    "predicted_balance": float(row['yhat']),
                    "lower_bound": float(row['yhat_lower']),
                    "upper_bound": float(row['yhat_upper'])
                })

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
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")


@router.get("/aggregate-forecast")
def forecast_total_deposits(
    days: int = Query(default=30, ge=1, le=365, description="Days to forecast")
):
    """
    Forecast total bank deposits across all accounts.

    Predicts aggregate daily deposit amounts for the entire bank.

    Query parameters:
    - days: Number of days to forecast (default 30, max 365)
    """

    try:
        from prophet import Prophet
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="Prophet not installed. Run: pip install prophet"
        )

    try:
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

            cur.execute(query)
            rows = cur.fetchall()

            if len(rows) < 14:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient data. Need at least 14 days, found {len(rows)}"
                )

            # Prepare data
            df = pd.DataFrame(rows, columns=['ds', 'y'])

            # Train model
            model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=True,
                changepoint_prior_scale=0.1
            )
            model.fit(df)

            # Forecast
            future = model.make_future_dataframe(periods=days)
            forecast = model.predict(future)

            # Get only future predictions
            future_forecast = forecast[forecast['ds'] > df['ds'].max()].copy()

            predictions = []
            for _, row in future_forecast.iterrows():
                predictions.append({
                    "date": row['ds'].strftime('%Y-%m-%d'),
                    "predicted_deposits": max(0, float(row['yhat'])),  # Don't predict negative
                    "lower_bound": max(0, float(row['yhat_lower'])),
                    "upper_bound": float(row['yhat_upper'])
                })

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
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")