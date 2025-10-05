'use client';

import { useAccountTransactionsMock } from '@/hooks/useAccountTransactionsMock';
import {sum} from "d3-array";

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    status: string;
    customer_id?: string;
    created_at: string;
}

interface AccountDetailViewProps {
    account: Account;
    onBack: () => void;
}

export default function AccountDetailView({ account, onBack }: AccountDetailViewProps) {
    const { transactions, summary, loading, error, refetch } = useAccountTransactionsMock({
        accountId: account.id,
        autoFetch: true,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTransactionColor = (type: string) => {
        const colors: Record<string, string> = {
            deposit: 'text-green-600',
            withdrawal: 'text-red-600',
            transfer_in: 'text-blue-600',
            transfer_out: 'text-orange-600',
        };
        return colors[type] || 'text-gray-600';
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return '↓';
            case 'withdrawal':
                return '↑';
            case 'transfer_in':
                return '→';
            case 'transfer_out':
                return '←';
            default:
                return '•';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{account.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {account.id} • {account.type}
                    </p>
                </div>
                <button
                    onClick={refetch}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Account Overview */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Current Balance Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <p className="text-blue-100 text-sm mb-2">Current Balance</p>
                    <p className="text-4xl font-bold mb-4">{formatCurrency(account.balance)}</p>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-100">Status: {account.status}</span>
                        <span className="text-blue-100">{account.currency}</span>
                    </div>
                </div>

                {/* Calculated Balance Card */}
                {summary && (
                    <div className={`rounded-xl p-6 shadow-lg ${
                        summary.has_discrepancy
                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                            : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                    }`}>
                        <p className={`text-sm mb-2 ${summary.has_discrepancy ? 'text-red-100' : 'text-green-100'}`}>
                            Calculated Balance
                        </p>
                        <p className="text-4xl font-bold mb-2">
                            {formatCurrency(summary.calculated_balance)}
                        </p>
                        {summary.has_discrepancy ? (
                            <div className="mt-3 p-3 bg-white/20 rounded-lg">
                                <p className="text-sm font-medium">⚠️ Discrepancy Detected</p>
                                <p className="text-2xl font-bold mt-1">
                                    {formatCurrency(Math.abs(summary.calculated_balance - account.balance))}
                                </p>
                            </div>
                        ) : (
                            <p className="text-green-100 text-sm">✓ Balance matches transactions</p>
                        )}
                    </div>
                )}
            </div>

            {/* Transaction Summary */}
            {summary && (
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Deposits</p>
                            <span className="text-2xl">↓</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary.total_deposits)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Withdrawals</p>
                            <span className="text-2xl">↑</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(summary.total_withdrawals)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Transfers In</p>
                            <span className="text-2xl">→</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(summary.total_transfers_in)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Transfers Out</p>
                            <span className="text-2xl">←</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">
                            {formatCurrency(summary.total_transfers_out)}
                        </p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading transactions...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-800">Error: {error}</p>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            {!loading && transactions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                        <p className="text-sm text-gray-600 mt-1">{transactions.length} transactions</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(transaction.date)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {transaction.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`flex items-center gap-2 text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                                                <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                                                {transaction.type.replace('_', ' ')}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                                                {transaction.type === 'deposit' || transaction.type === 'transfer_in' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                {transaction.status}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* No Transactions State */}
            {!loading && transactions.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No transactions found</p>
                    <p className="text-sm text-gray-400 mt-1">Transactions will appear here once available</p>
                </div>
            )}
        </div>
    );
}