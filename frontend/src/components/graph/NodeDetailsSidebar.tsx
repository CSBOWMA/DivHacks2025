import { GraphNode } from '@/types/graph';

interface NodeDetailsSidebarProps {
    node: GraphNode;
    onClose: () => void;
    formatCurrency: (amount: number) => string;
}

export default function NodeDetailsSidebar({ node, onClose, formatCurrency }: NodeDetailsSidebarProps) {
    return (
        <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-10">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Node Details</h3>
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
                    {/* Account Info */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                            {node.name}
                        </h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-blue-700">Account ID:</span>
                                <span className="font-mono text-blue-900">{node.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-700">Type:</span>
                                <span className="font-medium text-blue-900">{node.type}</span>
                            </div>
                            {node.customer_id && (
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Customer:</span>
                                    <span className="font-mono text-blue-900">{node.customer_id}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-900 mb-3">Balance</h4>
                        <div className="text-3xl font-bold text-green-700 mb-1">
                            {formatCurrency(node.balance)}
                        </div>
                        <div className="text-xs text-green-600">{node.currency}</div>
                    </div>

                    {/* Transaction Stats */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Transaction Activity</h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Total Transactions:</span>
                                    <span className="font-semibold">{node.transaction_count}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Total Incoming:</span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(node.total_incoming)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Total Outgoing:</span>
                                    <span className="font-semibold text-red-600">
                                        {formatCurrency(node.total_outgoing)}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Net Flow:</span>
                                    <span className={`font-semibold ${
                                        node.total_incoming - node.total_outgoing >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}>
                                        {formatCurrency(node.total_incoming - node.total_outgoing)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}