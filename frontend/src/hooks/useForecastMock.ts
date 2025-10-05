import { useEffect, useState } from 'react';
import { AccountForecastResponse, AggregateForecastResponse } from '@/types/forecast';

function generateMockAccountForecast(accountId: string, days: number): AccountForecastResponse {
    const currentBalance = 50000 + Math.random() * 50000;
    const predictions = [];

    for (let i = 1; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const trend = i * 100; // Slight upward trend
        const noise = (Math.random() - 0.5) * 5000;
        const predicted = currentBalance + trend + noise;

        predictions.push({
            date: date.toISOString().split('T')[0],
            predicted_balance: predicted,
            lower_bound: predicted - 10000,
            upper_bound: predicted + 10000,
        });
    }

    return {
        account_id: accountId,
        current_balance: currentBalance,
        forecast_days: days,
        historical_data_points: 90,
        predictions,
        model_info: {
            algorithm: "Facebook Prophet",
            features: ["daily_seasonality", "weekly_seasonality"],
            training_period: "2024-01-01 to 2024-03-31"
        }
    };
}

function generateMockAggregateForecast(days: number): AggregateForecastResponse {
    const predictions = [];
    let totalDeposits = 0;

    for (let i = 1; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const baseAmount = 100000;
        const weeklyPattern = Math.sin((i % 7) * Math.PI / 7) * 20000;
        const noise = (Math.random() - 0.5) * 15000;
        const predicted = Math.max(0, baseAmount + weeklyPattern + noise);

        totalDeposits += predicted;

        predictions.push({
            date: date.toISOString().split('T')[0],
            predicted_deposits: predicted,
            lower_bound: Math.max(0, predicted - 30000),
            upper_bound: predicted + 30000,
        });
    }

    return {
        forecast_type: "aggregate_deposits",
        forecast_days: days,
        historical_data_points: 180,
        predictions,
        summary: {
            avg_predicted_daily_deposits: totalDeposits / days,
            total_predicted_deposits: totalDeposits
        }
    };
}

export function useAccountForecast(accountId: string | null, days: number = 30) {
    const [data, setData] = useState<AccountForecastResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accountId) {
            setData(null);
            return;
        }

        setLoading(true);
        // Simulate API delay
        const timer = setTimeout(() => {
            setData(generateMockAccountForecast(accountId, days));
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [accountId, days]);

    return { data, loading, error };
}

export function useAggregateForecast(days: number = 30) {
    const [data, setData] = useState<AggregateForecastResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        // Simulate API delay
        const timer = setTimeout(() => {
            setData(generateMockAggregateForecast(days));
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [days]);

    return { data, loading, error };
}