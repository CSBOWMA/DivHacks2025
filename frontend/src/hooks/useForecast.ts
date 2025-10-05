import { useEffect, useState } from 'react';
import { AccountForecastResponse, AggregateForecastResponse } from '@/types/forecast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useAccountForecast(accountId: string | null, days: number = 30) {
    const [data, setData] = useState<AccountForecastResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accountId) {
            setData(null);
            return;
        }

        const fetchForecast = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/forecasting/${accountId}/balance-forecast?days=${days}`
                );

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [accountId, days]);

    return { data, loading, error };
}

export function useAggregateForecast(days: number = 30) {
    const [data, setData] = useState<AggregateForecastResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForecast = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/forecasting/aggregate-forecast?days=${days}`
                );

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [days]);

    return { data, loading, error };
}