import { Panel } from 'reactflow';

export default function GraphLegend() {
    return (
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-100"></div>
                    <span>Start Node</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-green-600 bg-green-100"></div>
                    <span>End Node</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-600 bg-gray-100"></div>
                    <span>Intermediate Node</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div>
                    <p className="text-gray-600 mb-1">Node Size = Balance</p>
                    <p className="text-gray-600">Edge Width = Transaction Amount</p>
                </div>
            </div>
        </Panel>
    );
}