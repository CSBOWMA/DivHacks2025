import { useState, useEffect } from 'react';

export interface Transaction {
    id: string;
    account_id: string;
    type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
    amount: number;
    date: string;
    description: string;
    status: string;
}

export interface TransactionSummary {
    total_deposits: number;
    total_withdrawals: number;
    total_transfers_in: number;
    total_transfers_out: number;
    calculated_balance: number;
    actual_balance: number;
    discrepancy: number;
    has_discrepancy: boolean;
}

interface UseAccountTransactionsParams {
    accountId: string | null;
    autoFetch?: boolean;
}

interface UseAccountTransactionsReturn {
    transactions: Transaction[];
    summary: TransactionSummary | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useAccountTransactions({
                                           accountId,
                                           autoFetch = true,
                                       }: UseAccountTransactionsParams): UseAccountTransactionsReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        if (!accountId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:8000/api/accounts/${accountId}/transactions`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            setTransactions(data.transactions);
            setSummary(data.summary);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch && accountId) {
            fetchTransactions();
        }
    }, [accountId, autoFetch]);

    return {
        transactions,
        summary,
        loading,
        error,
        refetch: fetchTransactions,
    };
}