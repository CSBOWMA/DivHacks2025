'use client';

import { useState } from 'react';
// Toggle between these two imports
import { useAccountsMock } from '@/hooks/useAccountsMock'; // Real API
// import { useAccountsMock as useAccounts } from '@/hooks/useAccountsMock'; // Mock data

export default function AccountsList() {
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [customerId, setCustomerId] = useState('');
    const [accountType, setAccountType] = useState('');
    const [minBalance, setMinBalance] = useState<string>('');
    const [maxBalance, setMaxBalance] = useState<string>('');

    const { data, loading, error, refetch } = useAccountsMock({
        customerId: customerId || undefined,
        accountType: accountType || undefined,
        minBalance: minBalance ? parseFloat(minBalance) : undefined,
        maxBalance: maxBalance ? parseFloat(maxBalance) : undefined,
        limit,
        offset,
        autoFetch: true,
    });

    const handleNextPage = () => {
        if (data?.pagination.has_next) {
            setOffset(data.pagination.next_offset!);
        }
    };

    const handlePreviousPage = () => {
        if (data?.pagination.has_previous) {
            setOffset(data.pagination.previous_offset!);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setOffset(0);
    };

    const handleApplyFilters = () => {
        setOffset(0);
        refetch({
            customerId: customerId || undefined,
            accountType: accountType || undefined,
            minBalance: minBalance ? parseFloat(minBalance) : undefined,
            maxBalance: maxBalance ? parseFloat(maxBalance) : undefined,
            offset: 0,
        });
    };

    const handleClearFilters = () => {
        setCustomerId('');
        setAccountType('');
        setMinBalance('');
        setMaxBalance('');
        setOffset(0);
        refetch({
            customerId: undefined,
            accountType: undefined,
            minBalance: undefined,
            maxBalance: undefined,
            offset: 0,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getAccountTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Checking': 'bg-blue-100 text-blue-800',
            'Savings': 'bg-green-100 text-green-800',
            'Credit Card': 'bg-purple-100 text-purple-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Accounts</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        View and filter all your financial accounts
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Clear All
                    </button>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                    {/* Customer ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer ID
                        </label>
                        <input
                            type="text"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            placeholder="cust_001"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Account Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type
                        </label>
                        <select
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Types</option>
                            <option value="Checking">Checking</option>
                            <option value="Savings">Savings</option>
                            <option value="Credit Card">Credit Card</option>
                        </select>
                    </div>

                    {/* Min Balance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Balance
                        </label>
                        <input
                            type="number"
                            value={minBalance}
                            onChange={(e) => setMinBalance(e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Max Balance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Balance
                        </label>
                        <input
                            type="number"
                            value={maxBalance}
                            onChange={(e) => setMaxBalance(e.target.value)}
                            placeholder="100000"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Results Per Page */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Per Page
                        </label>
                        <select
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleApplyFilters}
                    className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Apply Filters
                </button>
            </div>

            {/* Summary Cards */}
            {data && (
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Accounts</p>
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {data.pagination.total_accounts}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {data.pagination.returned_accounts} displayed
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Total Balance</p>
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {formatCurrency(data.summary.total_balance)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Across all accounts
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-600">Average Balance</p>
                            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">
                            {formatCurrency(data.summary.average_balance)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Per account
                        </p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading accounts...</p>
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

            {/* Accounts Table */}
            {data && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Account
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {data.accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="mt-2 text-gray-500">No accounts found</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Try adjusting your filters
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                data.accounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {account.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {account.id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {account.customer_id || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getAccountTypeColor(account.type)}`}>
                                                    {account.type}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                    {account.status}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className={`font-semibold ${account.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                                {formatCurrency(account.balance)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {account.currency}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(account.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{offset + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(offset + limit, data.pagination.total_accounts)}
                                </span>{' '}
                                of <span className="font-medium">{data.pagination.total_accounts}</span> accounts
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-700">
                                    Page <span className="font-medium">{data.pagination.current_page}</span> of{' '}
                                    <span className="font-medium">{data.pagination.total_pages}</span>
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={!data.pagination.has_previous}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!data.pagination.has_next}
                                        className="px-4 py-2 bg-blue-600 border border-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        Next
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}