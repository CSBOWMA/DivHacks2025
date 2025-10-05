'use client';

import { useState, useEffect } from 'react';
import { useAccountGraphMock } from '@/hooks/useAccountGraphMock';
import { useAccountsMock } from '@/hooks/useAccountsMock';
import AccountGraphVisualization from './AccountGraphVisualization';

export default function AccountGraphAnalytics() {
    const [startAccountId, setStartAccountId] = useState<string>('');
    const [endAccountId, setEndAccountId] = useState<string>('');
    const [maxDepth, setMaxDepth] = useState(5);
    const [minTransactionAmount, setMinTransactionAmount] = useState<string>('');
    const [isCycleMode, setIsCycleMode] = useState(false);

    // Fetch available accounts for dropdowns
    const { data: accountsData } = useAccountsMock({
        limit: 100,
        offset: 0,
        autoFetch: true,
    });

    const { data: graphData, loading, error, fetchGraph, reset } = useAccountGraphMock();

    useEffect(() => {
        if (isCycleMode && startAccountId) {
            setEndAccountId(startAccountId);
        }
    }, [isCycleMode, startAccountId]);

    const handleGenerateGraph = () => {
        if (!startAccountId || !endAccountId) {
            alert('Please select both start and end accounts');
            return;
        }

        fetchGraph({
            startAccountId,
            endAccountId,
            maxDepth,
            minTransactionAmount: minTransactionAmount ? parseFloat(minTransactionAmount) : undefined,
        });
    };

    const handleReset = () => {
        reset();
        setStartAccountId('');
        setEndAccountId('');
        setMaxDepth(5);
        setMinTransactionAmount('');
        setIsCycleMode(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Graph Analytics</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Visualize money flows and transaction paths between accounts
                </p>
            </div>

            {/* Configuration Panel */}
            {!graphData && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Graph</h3>

                    {/* Cycle Mode Toggle */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isCycleMode}
                                onChange={(e) => setIsCycleMode(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Cycle Detection Mode</span>
                                <p className="text-xs text-gray-600 mt-1">
                                    Find circular transaction paths starting and ending at the same account
                                </p>
                            </span>
                        </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Start Account */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Account *
                            </label>
                            <select
                                value={startAccountId}
                                onChange={(e) => setStartAccountId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select start account...</option>
                                {accountsData?.accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name} ({account.id}) - ${account.balance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* End Account */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Account *
                                {isCycleMode && (
                                    <span className="ml-2 text-xs text-blue-600">(Same as start for cycles)</span>
                                )}
                            </label>
                            <select
                                value={endAccountId}
                                onChange={(e) => setEndAccountId(e.target.value)}
                                disabled={isCycleMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Select end account...</option>
                                {accountsData?.accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name} ({account.id}) - ${account.balance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Max Depth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Path Depth
                            </label>
                            <input
                                type="number"
                                value={maxDepth}
                                onChange={(e) => setMaxDepth(parseInt(e.target.value) || 5)}
                                min="1"
                                max="10"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Maximum number of hops to explore (1-10)
                            </p>
                        </div>

                        {/* Min Transaction Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Transaction Amount
                            </label>
                            <input
                                type="number"
                                value={minTransactionAmount}
                                onChange={(e) => setMinTransactionAmount(e.target.value)}
                                placeholder="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Filter out transactions below this amount
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateGraph}
                            disabled={!startAccountId || !endAccountId}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Generate Graph
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">How it works:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                                    <li>Select a start and end account to find all transaction paths</li>
                                    <li>Node size represents account balance</li>
                                    <li>Edge width represents total transaction amount</li>
                                    <li>Click nodes or edges to view detailed information</li>
                                    <li>Enable cycle mode to find circular transaction patterns</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Generating graph...</p>
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

            {/* Graph Visualization */}
            {graphData && !loading && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Graph Visualization</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {graphData.query.is_cycle ? 'Cycle Analysis' : 'Path Analysis'}: {graphData.query.start_account_id} → {graphData.query.end_account_id}
                            </p>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            New Analysis
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '700px' }}>
                        <AccountGraphVisualization graphData={graphData} />
                    </div>
                </div>
            )}
        </div>
    );
}