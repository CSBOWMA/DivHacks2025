import { Panel } from 'reactflow';
import { GraphData } from '@/types/graph';

interface GraphSummaryPanelProps {
    graphData: GraphData;
    formatCurrency: (amount: number) => string;
}

export default function GraphSummaryPanel({ graphData, formatCurrency }: GraphSummaryPanelProps) {
    return (
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Nodes:</span>
                    <span className="font-semibold">{graphData.summary.total_nodes}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Edges:</span>
                    <span className="font-semibold">{graphData.summary.total_edges}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Paths Found:</span>
                    <span className="font-semibold">{graphData.summary.total_paths}</span>
                </div>
                {graphData.summary.total_cycles > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Cycles Found:</span>
                        <span className="font-semibold text-orange-600">
                            {graphData.summary.total_cycles}
                        </span>
                    </div>
                )}
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Flow:</span>
                    <span className="font-semibold text-green-600">
                        {formatCurrency(graphData.summary.total_flow_amount)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Avg Path Length:</span>
                    <span className="font-semibold">
                        {graphData.summary.average_path_length.toFixed(1)}
                    </span>
                </div>
            </div>
        </Panel>
    );
}