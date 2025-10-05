import { Panel } from 'reactflow';

export default function GraphLegend() {
    return (
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
                {/* Node Types */}
                <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500 font-medium mb-2">Node Types</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-2 border-blue-600 bg-blue-100 flex items-center justify-center text-xs">
                                🎯
                            </div>
                            <span>Start Node</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-2 border-green-600 bg-green-100 flex items-center justify-center text-xs">
                                🏁
                            </div>
                            <span>End Node</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 bg-gray-100"></div>
                            <span>Regular Node</span>
                        </div>
                    </div>
                </div>

                {/* Account Types */}
                <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500 font-medium mb-2">Account Types</p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span>💳</span>
                            <span>Checking</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>🏦</span>
                            <span>Savings</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>💼</span>
                            <span>Business</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>📈</span>
                            <span>Investment</span>
                        </div>
                    </div>
                </div>

                {/* Visual Encoding */}
                <div>
                    <p className="text-gray-500 font-medium mb-2">Visual Encoding</p>
                    <div className="space-y-1">
                        <div className="text-gray-600">
                            <span className="font-medium">Node Size</span> = Balance
                        </div>
                        <div className="text-gray-600">
                            <span className="font-medium">Edge Width</span> = Transaction Volume
                        </div>
                        <div className="text-gray-600">
                            <span className="font-medium">Clusters</span> = Disconnected Groups
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
}