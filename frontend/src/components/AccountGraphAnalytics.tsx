'use client';

import { useState, useEffect } from 'react';
import { useAccountGraphMock } from '@/hooks/useAccountGraphMock';
import { useFullAccountGraphMock } from '@/hooks/useFullAccountGraphMock';
import { useAccountsMock } from '@/hooks/useAccountsMock';
import AccountGraphVisualization from './AccountGraphVisualization';

type AnalysisMode = 'path' | 'cycle' | 'full-network';

export default function AccountGraphAnalytics() {
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('path');

    // Path/Cycle analysis state
    const [startAccountId, setStartAccountId] = useState<string>('');
    const [endAccountId, setEndAccountId] = useState<string>('');
    const [maxDepth, setMaxDepth] = useState(5);
    const [minTransactionAmount, setMinTransactionAmount] = useState<string>('');

    // Full network state
    const [includeAllAccounts, setIncludeAllAccounts] = useState(true);

    // Fetch available accounts for dropdowns
    const { data: accountsData } = useAccountsMock({
        limit: 100,
        offset: 0,
        autoFetch: true,
    });

    // Hooks for different analysis types
    const pathAnalysis = useAccountGraphMock();
    const networkAnalysis = useFullAccountGraphMock();

    // Determine which data to use based on mode
    const currentData = analysisMode === 'full-network' ? networkAnalysis.data : pathAnalysis.data;
    const currentLoading = analysisMode === 'full-network' ? networkAnalysis.loading : pathAnalysis.loading;
    const currentError = analysisMode === 'full-network' ? networkAnalysis.error : pathAnalysis.error;

    useEffect(() => {
        if (analysisMode === 'cycle' && startAccountId) {
            setEndAccountId(startAccountId);
        }
    }, [analysisMode, startAccountId]);

    const handleGenerateGraph = () => {
        if (analysisMode === 'full-network') {
            networkAnalysis.fetchFullGraph({
                minTransactionAmount: minTransactionAmount ? parseFloat(minTransactionAmount) : 0,
                includeAllAccounts,
            });
        } else {
            if (!startAccountId || !endAccountId) {
                alert('Please select both start and end accounts');
                return;
            }

            pathAnalysis.fetchGraph({
                startAccountId,
                endAccountId,
                maxDepth,
                minTransactionAmount: minTransactionAmount ? parseFloat(minTransactionAmount) : undefined,
            });
        }
    };

    const handleReset = () => {
        if (analysisMode === 'full-network') {
            networkAnalysis.reset();
        } else {
            pathAnalysis.reset();
        }
        setStartAccountId('');
        setEndAccountId('');
        setMaxDepth(5);
        setMinTransactionAmount('');
        setIncludeAllAccounts(true);
    };

    const handleModeChange = (mode: AnalysisMode) => {
        // Reset data when changing modes
        pathAnalysis.reset();
        networkAnalysis.reset();
        setAnalysisMode(mode);
        setStartAccountId('');
        setEndAccountId('');
        setMinTransactionAmount('');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Graph Analytics</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Visualize and analyze transaction flows and account relationships
                </p>
            </div>

            {/* Analysis Mode Selector */}
            {!currentData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => handleModeChange('path')}
                                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                                    analysisMode === 'path'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xl">🔀</span>
                                    <div className="text-left">
                                        <div>Path Analysis</div>
                                        <div className="text-xs font-normal text-gray-500">Find routes between accounts</div>
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleModeChange('cycle')}
                                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                                    analysisMode === 'cycle'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xl">🔄</span>
                                    <div className="text-left">
                                        <div>Cycle Detection</div>
                                        <div className="text-xs font-normal text-gray-500">Find circular flows</div>
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleModeChange('full-network')}
                                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                                    analysisMode === 'full-network'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xl">🌐</span>
                                    <div className="text-left">
                                        <div>Full Network</div>
                                        <div className="text-xs font-normal text-gray-500">View entire system</div>
                                    </div>
                                </div>
                            </button>
                        </nav>
                    </div>

                    {/* Configuration Panel */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {analysisMode === 'path' && 'Configure Path Analysis'}
                            {analysisMode === 'cycle' && 'Configure Cycle Detection'}
                            {analysisMode === 'full-network' && 'Configure Network View'}
                        </h3>

                        {/* Mode-specific info banner */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm">
                                    {analysisMode === 'path' && (
                                        <>
                                            <p className="font-medium text-blue-900 mb-1">Path Analysis</p>
                                            <p className="text-blue-700">
                                                Find all possible transaction paths between two accounts. Great for tracing money flow.
                                            </p>
                                        </>
                                    )}
                                    {analysisMode === 'cycle' && (
                                        <>
                                            <p className="font-medium text-blue-900 mb-1">Cycle Detection</p>
                                            <p className="text-blue-700">
                                                Identify circular transaction patterns that start and end at the same account. Useful for detecting suspicious activity.
                                            </p>
                                        </>
                                    )}
                                    {analysisMode === 'full-network' && (
                                        <>
                                            <p className="font-medium text-blue-900 mb-1">Full Network Analysis</p>
                                            <p className="text-blue-700">
                                                Visualize all accounts and their relationships. Automatically identifies hubs and detects cycles across the entire network.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Path & Cycle Mode Configuration */}
                        {(analysisMode === 'path' || analysisMode === 'cycle') && (
                            <>
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    {/* Start Account */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {analysisMode === 'cycle' ? 'Account *' : 'Start Account *'}
                                        </label>
                                        <select
                                            value={startAccountId}
                                            onChange={(e) => setStartAccountId(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select {analysisMode === 'cycle' ? 'an account' : 'start account'}...</option>
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
                                            {analysisMode === 'cycle' && (
                                                <span className="ml-2 text-xs text-blue-600">(Auto-set for cycles)</span>
                                            )}
                                        </label>
                                        <select
                                            value={endAccountId}
                                            onChange={(e) => setEndAccountId(e.target.value)}
                                            disabled={analysisMode === 'cycle'}
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
                            </>
                        )}

                        {/* Full Network Mode Configuration */}
                        {analysisMode === 'full-network' && (
                            <>
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

                                {/* Network Statistics Preview */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Expected Network Size:</h4>
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
                            </>
                        )}

                        {/* Action Button */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerateGraph}
                                disabled={
                                    (analysisMode !== 'full-network' && (!startAccountId || !endAccountId)) ||
                                    currentLoading
                                }
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                {currentLoading ? 'Generating...' : 'Generate Graph'}
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-gray-700">
                                    <p className="font-medium mb-1">Graph Features:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                                        <li>Node size represents account balance</li>
                                        <li>Edge width represents transaction volume</li>
                                        <li>Click on any node or edge to view detailed information</li>
                                        <li>Use controls to pan, zoom, and fit the view</li>
                                        {analysisMode === 'full-network' && <li>Hub accounts and cycles are automatically detected</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {currentLoading && (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {analysisMode === 'full-network' ? 'Generating network graph...' : 'Generating graph...'}
                        </p>
                    </div>
                </div>
            )}
            {/* Error State */}
            {currentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-800">Error: {currentError}</p>
                    </div>
                </div>
            )}

            {/* Graph Visualization */}
            {currentData && !currentLoading && (
                <div className="space-y-4">
                    {/* Header with Mode Badge */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {analysisMode === 'path' && 'Path Analysis'}
                                {analysisMode === 'cycle' && 'Cycle Detection'}
                                {analysisMode === 'full-network' && 'Network Visualization'}
                            </h3>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {analysisMode === 'path' && '🔀 Path Mode'}
                                {analysisMode === 'cycle' && '🔄 Cycle Mode'}
                                {analysisMode === 'full-network' && '🌐 Network Mode'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {analysisMode === 'full-network' && (
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print
                                </button>
                            )}
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

                    {/* Analysis-specific description */}
                    <div className="text-sm text-gray-600">
                        {analysisMode === 'path' && (
                            <p>
                                Showing paths from <span className="font-semibold text-blue-600">{currentData.query.start_account_id}</span> to{' '}
                                <span className="font-semibold text-green-600">{currentData.query.end_account_id}</span>
                            </p>
                        )}
                        {analysisMode === 'cycle' && (
                            <p>
                                Showing cycles starting and ending at{' '}
                                <span className="font-semibold text-blue-600">{currentData.query.start_account_id}</span>
                            </p>
                        )}
                        {analysisMode === 'full-network' && (
                            <p>
                                Showing {currentData.summary.total_nodes} accounts with {currentData.summary.total_edges} transaction flows
                            </p>
                        )}
                    </div>

                    {/* Summary Statistics Cards */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                    {analysisMode === 'full-network' ? 'Total Accounts' : 'Nodes'}
                                </span>
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {currentData.summary.total_nodes}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                    {analysisMode === 'full-network' ? 'Transaction Flows' : 'Edges'}
                                </span>
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {currentData.summary.total_edges}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                    {analysisMode === 'full-network' ? 'Total Flow Volume' : 'Total Flow'}
                                </span>
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                ${(currentData.summary.total_flow_amount / (analysisMode === 'full-network' ? 1000000 : 1000)).toFixed(2)}
                                {analysisMode === 'full-network' ? 'M' : 'K'}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                    {analysisMode === 'path' ? 'Paths Found' : 'Cycles Detected'}
                                </span>
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {analysisMode === 'path' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    )}
                                </svg>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {analysisMode === 'path' ? currentData.summary.total_paths : currentData.summary.total_cycles}
                            </div>
                            {currentData.summary.total_cycles > 0 && analysisMode !== 'path' && (
                                <div className="text-xs text-orange-600 mt-1">
                                    ⚠️ Review required
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Graph Container */}
                    <div
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        style={{ height: analysisMode === 'full-network' ? '800px' : '700px' }}
                    >
                        <AccountGraphVisualization graphData={currentData} />
                    </div>

                    {/* Mode-specific Insights */}
                    {analysisMode === 'cycle' && currentData.cycles.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Cycle Analysis
                            </h4>
                            <p className="text-sm text-orange-800">
                                Detected {currentData.cycles.length} circular transaction pattern{currentData.cycles.length !== 1 ? 's' : ''}.
                                {currentData.cycles.some(c => c.is_suspicious) && (
                                    <span className="font-semibold"> {currentData.cycles.filter(c => c.is_suspicious).length} marked as suspicious.</span>
                                )}
                            </p>
                        </div>
                    )}

                    {analysisMode === 'path' && currentData.paths.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                No Paths Found
                            </h4>
                            <p className="text-sm text-yellow-800">
                                No transaction paths found between the selected accounts. They may not be connected, or the path exceeds the maximum depth.
                            </p>
                        </div>
                    )}

                    {analysisMode === 'full-network' && currentData.cycles.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Network Insights
                            </h4>
                            <p className="text-sm text-orange-800">
                                Detected {currentData.cycles.length} circular transaction pattern{currentData.cycles.length !== 1 ? 's' : ''} in the network.
                                Review these for potential compliance issues.
                            </p>
                        </div>
                    )}

                    {/* Analysis Summary */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Analysis Summary</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Analysis Type:</span>
                                <span className="ml-2 font-semibold text-gray-900">
                                    {analysisMode === 'path' && 'Path Discovery'}
                                    {analysisMode === 'cycle' && 'Cycle Detection'}
                                    {analysisMode === 'full-network' && 'Full Network Analysis'}
                                </span>
                            </div>
                            {analysisMode !== 'full-network' && (
                                <>
                                    <div>
                                        <span className="text-gray-600">Max Depth:</span>
                                        <span className="ml-2 font-semibold text-gray-900">{maxDepth} hops</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Start Account:</span>
                                        <span className="ml-2 font-mono text-xs text-gray-900">{startAccountId}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">End Account:</span>
                                        <span className="ml-2 font-mono text-xs text-gray-900">{endAccountId}</span>
                                    </div>
                                </>
                            )}
                            {minTransactionAmount && (
                                <div>
                                    <span className="text-gray-600">Min Transaction:</span>
                                    <span className="ml-2 font-semibold text-gray-900">
                                        ${parseFloat(minTransactionAmount).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-600">Timestamp:</span>
                                <span className="ml-2 font-semibold text-gray-900">
                                    {new Date().toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}