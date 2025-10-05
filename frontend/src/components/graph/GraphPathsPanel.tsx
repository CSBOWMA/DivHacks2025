import { Panel } from 'reactflow';
import { GraphData } from '@/types/graph';

interface GraphPathsPanelProps {
    graphData: GraphData;
    highlightedPath: string | null;
    onHighlightPath: (pathId: string) => void;
    onClearHighlight: () => void;
    formatCurrency: (amount: number) => string;
}

export default function GraphPathsPanel({
                                            graphData,
                                            highlightedPath,
                                            onHighlightPath,
                                            onClearHighlight,
                                            formatCurrency,
                                        }: GraphPathsPanelProps) {
    if (graphData.paths.length === 0) return null;

    return (
        <Panel position="bottom-left" className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-md max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Paths</h3>
                {highlightedPath && (
                    <button
                        onClick={onClearHighlight}
                        className="text-xs text-blue-600 hover:text-blue-700"
                    >
                        Clear Highlight
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {graphData.paths.map((path, index) => (
                    <button
                        key={path.path_id}
                        onClick={() => onHighlightPath(path.path_id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                            highlightedPath === path.path_id
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900">
                                Path {index + 1}
                            </span>
                            <span className="text-xs font-semibold text-green-600">
                                {formatCurrency(path.total_amount)}
                            </span>
                        </div>
                        <div className="text-xs text-gray-600">
                            {path.path_length} hop{path.path_length !== 1 ? 's' : ''} • {path.nodes.length} nodes
                        </div>
                        {path.is_cycle && (
                            <div className="mt-1 text-xs text-orange-600 font-medium">
                                🔄 Cycle Detected
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </Panel>
    );
}