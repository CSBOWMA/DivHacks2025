import { useState, useCallback } from 'react';
import { GraphData } from '@/types/graph';

interface UseAccountGraphParams {
    startAccountId: string | null;
    endAccountId: string | null;
    maxDepth?: number;
    minTransactionAmount?: number;
}

export function useAccountGraph() {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGraph = useCallback(async ({
                                              startAccountId,
                                              endAccountId,
                                              maxDepth = 5,
                                              minTransactionAmount = 0,
                                          }: UseAccountGraphParams) => {
        if (!startAccountId || !endAccountId) {
            setError('Please select both start and end accounts');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                start_account_id: startAccountId,
                end_account_id: endAccountId,
                max_depth: maxDepth.toString(),
                ...(minTransactionAmount > 0 && { min_transaction_amount: minTransactionAmount.toString() }),
            });

            const response = await fetch(
                `http://localhost:8000/api/accounts/graph/paths?${params}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch graph data');
            }

            const graphData = await response.json();
            setData(graphData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
    }, []);

    return {
        data,
        loading,
        error,
        fetchGraph,
        reset,
    };
}