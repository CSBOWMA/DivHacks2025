export interface ForecastPrediction {
    date: string;
    predicted_balance?: number;
    predicted_deposits?: number;
    lower_bound: number;
    upper_bound: number;
}

export interface AccountForecastResponse {
    account_id: string;
    current_balance: number;
    forecast_days: number;
    historical_data_points: number;
    predictions: ForecastPrediction[];
    model_info: {
        algorithm: string;
        features: string[];
        training_period: string;
    };
}

export interface AggregateForecastResponse {
    forecast_type: string;
    forecast_days: number;
    historical_data_points: number;
    predictions: ForecastPrediction[];
    summary: {
        avg_predicted_daily_deposits: number;
        total_predicted_deposits: number;
    };
}