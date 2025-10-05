import { GraphEdge } from '@/types/graph';

interface EdgeDetailsSidebarProps {
    edge: GraphEdge;
    onClose: () => void;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

export default function EdgeDetailsSidebar({ edge, onClose, formatCurrency, formatDate }: EdgeDetailsSidebarProps) {
    return (
        <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-10">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Edge Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Flow Direction */}
                    <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-purple-900 mb-3">Flow Direction</h4>
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <div className="font-mono text-xs text-purple-700 mb-1">From</div>
                                <div className="font-semibold text-purple-900">{edge.source}</div>
                            </div>
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <div className="text-sm text-right">
                                <div className="font-mono text-xs text-purple-700 mb-1">To</div>
                                <div className="font-semibold text-purple-900">{edge.target}</div>
                            </div>
                        </div>
                    </div>

                    {/* Total Flow */}
                    <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-900 mb-3">Total Flow</h4>
                        <div className="text-3xl font-bold text-green-700 mb-2">
                            {formatCurrency(edge.total_amount)}
                        </div>
                        <div className="text-xs text-green-600">
                            Across {edge.transaction_count} transactions
                        </div>
                    </div>

                    {/* Transaction Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Average Amount:</span>
                                <span className="font-semibold">{formatCurrency(edge.average_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Min Amount:</span>
                                <span className="font-semibold text-blue-600">{formatCurrency(edge.min_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Max Amount:</span>
                                <span className="font-semibold text-red-600">{formatCurrency(edge.max_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3">Time Range</h4>
                        <div className="space-y-2">
                            <div className="text-sm">
                                <div className="text-blue-700 mb-1">First Transaction:</div>
                                <div className="font-semibold text-blue-900">
                                    {formatDate(edge.first_transaction_date)}
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="text-blue-700 mb-1">Last Transaction:</div>
                                <div className="font-semibold text-blue-900">
                                    {formatDate(edge.last_transaction_date)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Recent Transactions ({edge.transactions.length})
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {edge.transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(transaction.amount)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(transaction.date)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-700">{transaction.description}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-mono">{transaction.id}</div>
                                </div>
                            ))}
                        </div>
                        {edge.transaction_count > edge.transactions.length && (
                            <div className="mt-3 text-xs text-gray-500 text-center">
                                Showing {edge.transactions.length} of {edge.transaction_count} transactions
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}