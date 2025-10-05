import { Panel } from 'reactflow';
import { GraphData } from '@/types/graph';

interface GraphCyclesPanelProps {
    graphData: GraphData;
    formatCurrency: (amount: number) => string;
}

export default function GraphCyclesPanel({ graphData, formatCurrency }: GraphCyclesPanelProps) {
    if (graphData.cycles.length === 0) return null;

    return (
        <Panel position="bottom-right" className="bg-orange-50 rounded-lg shadow-lg p-4 border border-orange-200 max-w-md">
            <h3 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>Cycles Detected</span>
            </h3>
            <div className="space-y-2">
                {graphData.cycles.map((cycle, index) => (
                    <div
                        key={cycle.cycle_id}
                        className={`p-3 rounded-lg border ${
                            cycle.is_suspicious
                                ? 'bg-red-50 border-red-300'
                                : 'bg-white border-orange-200'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900">
                                Cycle {index + 1}
                            </span>
                            {cycle.is_suspicious && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                    Suspicious
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                            {cycle.cycle_length} nodes • {formatCurrency(cycle.total_amount)}
                        </div>
                        <div className="text-xs text-gray-600">
                            Net Flow: {formatCurrency(cycle.net_flow)}
                        </div>
                        {cycle.suspicious_reason && (
                            <div className="mt-2 text-xs text-red-700 italic">
                                {cycle.suspicious_reason}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Panel>
    );
}