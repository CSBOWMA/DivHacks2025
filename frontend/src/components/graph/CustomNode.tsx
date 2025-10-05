import { Handle, Position } from 'reactflow';

export function CustomNode({ data }: { data: any }) {
    const sizeScale = (balance: number) => {
        const minSize = 60;
        const maxSize = 150;
        const minBalance = 1000;
        const maxBalance = 100000;

        const normalized = Math.log(balance + 1) / Math.log(maxBalance);
        return minSize + (maxSize - minSize) * Math.min(Math.max(normalized, 0), 1);
    };

    const size = sizeScale(data.balance);
    const isStart = data.isStart;
    const isEnd = data.isEnd;

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                border: `4px solid ${isStart ? '#3b82f6' : isEnd ? '#10b981' : '#6b7280'}`,
                background: isStart ? '#dbeafe' : isEnd ? '#d1fae5' : '#f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                position: 'relative',
            }}
            className="hover:shadow-lg"
        >
            {/* Input Handle (Target) - Left side */}
            <Handle
                type="target"
                position={Position.Left}
                style={{
                    width: 12,
                    height: 12,
                    background: '#6b7280',
                    border: '2px solid #ffffff',
                    left: -6,
                }}
            />

            <div className="text-xs font-bold text-gray-900 text-center truncate w-full px-1">
                {data.name}
            </div>
            <div className="text-xs text-gray-600 mt-1">
                ${(data.balance / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
                {data.type}
            </div>

            {/* Output Handle (Source) - Right side */}
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    width: 12,
                    height: 12,
                    background: '#6b7280',
                    border: '2px solid #ffffff',
                    right: -6,
                }}
            />
        </div>
    );
}