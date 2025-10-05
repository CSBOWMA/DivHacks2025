'use client';

export type AnalyticsTool = 'accounts' | 'transactions' | 'insights' | 'reports' | 'forecast';

interface AnalyticsToolSwitcherProps {
    currentTool: AnalyticsTool;
    onToolChange: (tool: AnalyticsTool) => void;
}

const tools: { id: AnalyticsTool; label: string; icon: string; disabled?: boolean }[] = [
    { id: 'accounts', label: 'Accounts', icon: '💳' },
    { id: 'transactions', label: 'Transactions', icon: '💸', disabled: true },
    { id: 'insights', label: 'Graph Analytics', icon: '📊' },
    { id: 'forecast', label: 'Forecast', icon: '🔮' },
    { id: 'reports', label: 'Reports', icon: '📈', disabled: true },
];

export default function AnalyticsToolSwitcher({ currentTool, onToolChange }: AnalyticsToolSwitcherProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-3">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => !tool.disabled && onToolChange(tool.id)}
                        disabled={tool.disabled}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                            transition-all duration-200
                            ${currentTool === tool.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : tool.disabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                        }
                        `}
                    >
                        <span className="text-xl">{tool.icon}</span>
                        <span>{tool.label}</span>
                        {tool.disabled && (
                            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                                Coming Soon
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}