'use client';

import { useState } from 'react';
import { useFullAccountGraphMock } from '@/hooks/useFullAccountGraphMock';
import AccountGraphVisualization from './AccountGraphVisualization';

export default function FullAccountNetworkView() {
    const [minTransactionAmount, setMinTransactionAmount] = useState<string>('');
    const [includeAllAccounts, setIncludeAllAccounts] = useState(true);

    const { data: graphData, loading, error, fetchFullGraph, reset } = useFullAccountGraphMock();

    const handleGenerateGraph = () => {
        fetchFullGraph({
            minTransactionAmount: minTransactionAmount ? parseFloat(minTransactionAmount) : 0,
            includeAllAccounts,
        });
    };

    const handleReset = () => {
        reset();
        setMinTransactionAmount('');
        setIncludeAllAccounts(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Full Account Network</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Visualize the complete transaction network across all accounts
                </p>
            </div>

            {/* Configuration Panel */}
            {!graphData && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Network View</h3>

                    {/* Info Banner */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm">
                                <p className="font-medium text-blue-900 mb-1">Network Overview</p>
                                <p className="text-blue-700">
                                    This view shows ALL accounts and their transaction relationships.
                                    Node size represents account balance, edge thickness represents transaction volume.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Min Transaction Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Transaction Amount
                            </label>
                            <input
                                type="number"
                                value={minTransactionAmount}
                                onChange={(e) => setMinTransactionAmount(e.target.value)}
                                placeholder="0 (show all)"
                                step="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Filter out transaction flows below this amount
                            </p>
                        </div>

                        {/* Include All Accounts Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Filtering
                            </label>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeAllAccounts}
                                        onChange={(e) => setIncludeAllAccounts(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-3">
                                        <span className="text-sm font-medium text-gray-900">Include All Accounts</span>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            Show isolated accounts with no transactions
                                        </p>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Preview */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">What you'll see:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">10-20</div>
                                <div className="text-xs text-gray-600 mt-1">Accounts</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">30-80</div>
                                <div className="text-xs text-gray-600 mt-1">Transactions</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">3-8</div>
                                <div className="text-xs text-gray-600 mt-1">Hub Accounts</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">0-5</div>
                                <div className="text-xs text-gray-600 mt-1">Cycles</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateGraph}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Generate Full Network
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">Network Features:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                                    <li>Automatically identifies hub accounts (highly connected)</li>
                                    <li>Detects circular transaction patterns (cycles)</li>
                                    <li>Visualizes transaction volume through edge width</li>
                                    <li>Click on any node or edge to view detailed information</li>
                                    <li>Pan and zoom to explore the network</li>
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
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Generating network graph...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take a moment for large networks</p>
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
                            <h3 className="text-lg font-semibold text-gray-900">Network Visualization</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Showing {graphData.summary.total_nodes} accounts with {graphData.summary.total_edges} transaction flows
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                            </button>
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
                    </div>

                    {/* Network Statistics Cards */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Total Accounts</span>
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {graphData.summary.total_nodes}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Transaction Flows</span>
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {graphData.summary.total_edges}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Total Flow Volume</span>
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                ${(graphData.summary.total_flow_amount / 1000000).toFixed(2)}M
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Cycles Detected</span>
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {graphData.summary.total_cycles}
                            </div>
                            {graphData.summary.total_cycles > 0 && (
                                <div className="text-xs text-orange-600 mt-1">
                                    ⚠️ Review required
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Graph Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '800px' }}>
                        <AccountGraphVisualization graphData={graphData} />
                    </div>

                    {/* Network Insights */}
                    {graphData.cycles.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Network Insights
                            </h4>
                            <p className="text-sm text-orange-800">
                                Detected {graphData.cycles.length} circular transaction pattern{graphData.cycles.length !== 1 ? 's' : ''} in the network.
                                Review these for potential compliance issues.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}