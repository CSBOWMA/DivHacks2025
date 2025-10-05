import { useState, useEffect } from 'react';
import { Transaction, TransactionSummary } from './useAccountTransactions';

interface UseAccountTransactionsParams {
    accountId: string | null;
    autoFetch?: boolean;
}

// Mock data generator
const generateMockTransactions = (accountId: string): Transaction[] => {
    const types: Array<'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out'> = [
        'deposit',
        'withdrawal',
        'transfer_in',
        'transfer_out',
    ];

    const descriptions: Record<string, string[]> = {
        deposit: ['Salary Deposit', 'Direct Deposit', 'Cash Deposit', 'Check Deposit'],
        withdrawal: ['ATM Withdrawal', 'POS Purchase', 'Online Payment', 'Check Payment'],
        transfer_in: ['Transfer from Savings', 'Transfer from External', 'P2P Transfer In'],
        transfer_out: ['Transfer to Savings', 'Transfer to External', 'P2P Transfer Out'],
    };

    const transactions: Transaction[] = [];
    const numTransactions = Math.floor(Math.random() * 20) + 15; // 15-35 transactions

    for (let i = 0; i < numTransactions; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        transactions.push({
            id: `txn_${accountId}_${i}`,
            account_id: accountId,
            type,
            amount: parseFloat((Math.random() * 2000 + 10).toFixed(2)),
            date: date.toISOString(),
            description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
            status: 'completed',
        });
    }

    // Sort by date descending
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const calculateSummary = (
    transactions: Transaction[],
    actualBalance: number
): TransactionSummary => {
    let total_deposits = 0;
    let total_withdrawals = 0;
    let total_transfers_in = 0;
    let total_transfers_out = 0;

    transactions.forEach((txn) => {
        switch (txn.type) {
            case 'deposit':
                total_deposits += txn.amount;
                break;
            case 'withdrawal':
                total_withdrawals += txn.amount;
                break;
            case 'transfer_in':
                total_transfers_in += txn.amount;
                break;
            case 'transfer_out':
                total_transfers_out += txn.amount;
                break;
        }
    });

    const calculated_balance =
        total_deposits + total_transfers_in - total_withdrawals - total_transfers_out;

    const discrepancy = actualBalance - calculated_balance;
    const has_discrepancy = Math.abs(discrepancy) > 0.01; // Allow for floating point errors

    return {
        total_deposits,
        total_withdrawals,
        total_transfers_in,
        total_transfers_out,
        calculated_balance,
        actual_balance: actualBalance,
        discrepancy,
        has_discrepancy,
    };
};

export function useAccountTransactionsMock({
                                               accountId,
                                               autoFetch = true,
                                           }: UseAccountTransactionsParams) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = () => {
        if (!accountId) return;

        setLoading(true);
        setError(null);

        // Simulate API delay
        setTimeout(() => {
            try {
                const mockTransactions = generateMockTransactions(accountId);
                // Get actual balance from account (you'll need to pass this or fetch it)
                const actualBalance = Math.random() * 50000 + 1000; // Mock actual balance
                const mockSummary = calculateSummary(mockTransactions, actualBalance);

                setTransactions(mockTransactions);
                setSummary(mockSummary);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch transactions');
                setLoading(false);
            }
        }, 800);
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