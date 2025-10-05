import { useState, useCallback } from 'react';
import { GraphData } from '@/types/graph';

interface UseFullAccountGraphParams {
    minTransactionAmount?: number;
    includeAllAccounts?: boolean;
}

export function useFullAccountGraph() {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFullGraph = useCallback(async ({
                                                  minTransactionAmount = 0,
                                                  includeAllAccounts = true,
                                              }: UseFullAccountGraphParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                ...(minTransactionAmount > 0 && { min_transaction_amount: minTransactionAmount.toString() }),
                include_all: includeAllAccounts.toString(),
            });

            const response = await fetch(
                `http://localhost:8000/api/accounts/graph/full?${params}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch full graph data');
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
        fetchFullGraph,
        reset,
    };
}