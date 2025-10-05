import { useEffect, useState } from 'react';
import { AccountForecastResponse, AggregateForecastResponse } from '@/types/forecast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, timeout = 30000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - forecasting is taking too long');
        }
        throw error;
    }
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

        const fetchForecast = async () => {
            setLoading(true);
            setError(null);

            console.log(`Fetching forecast for account ${accountId}, days: ${days}`);

            try {
                const url = `${API_BASE_URL}/forecasting/${accountId}/balance-forecast?days=${days}`;
                console.log('Request URL:', url);

                const response = await fetchWithTimeout(url, 30000); // 30 second timeout

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('Forecast received:', result);
                setData(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch forecast';
                console.error('Forecast error:', err);
                setError(errorMessage);
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

            console.log(`Fetching aggregate forecast, days: ${days}`);

            try {
                const url = `${API_BASE_URL}/forecasting/aggregate-forecast?days=${days}`;
                console.log('Request URL:', url);

                const response = await fetchWithTimeout(url, 30000); // 30 second timeout

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('Aggregate forecast received:', result);
                setData(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch forecast';
                console.error('Forecast error:', err);
                setError(errorMessage);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [days]);

    return { data, loading, error };
}