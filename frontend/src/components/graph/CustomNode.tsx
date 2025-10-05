import { Handle, Position } from 'reactflow';
import { memo } from 'react';

interface CustomNodeProps {
    data: any;
}

function CustomNodeComponent({ data }: CustomNodeProps) {
    const sizeScale = (balance: number) => {
        const minSize = 80;
        const maxSize = 180;
        const minBalance = 1000;
        const maxBalance = 100000;

        const normalized = Math.log(balance + 1) / Math.log(maxBalance);
        return minSize + (maxSize - minSize) * Math.min(Math.max(normalized, 0), 1);
    };

    const size = sizeScale(data.balance);
    const isStart = data.isStart;
    const isEnd = data.isEnd;
    const inCycle = data.inCycle;
    const clusterColor = data.clusterColor || { bg: '#f3f4f6', border: '#6b7280', text: '#1f2937' };

    // Determine border color
    let borderColor = clusterColor.border;
    if (isStart) borderColor = '#3b82f6';
    if (isEnd) borderColor = '#10b981';

    // Determine background with gradient
    const getBackgroundGradient = () => {
        if (isStart) return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
        if (isEnd) return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
        return `linear-gradient(135deg, ${clusterColor.bg} 0%, ${adjustColorBrightness(clusterColor.bg, -10)} 100%)`;
    };

    // Handle style - smaller and more subtle
    const handleStyle = {
        width: 10,
        height: 10,
        background: borderColor,
        border: '2px solid #ffffff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        opacity: 0.6,
    };

    return (
        <>
            {/* Handles on all 4 sides for natural routing */}
            {/* Top Handles */}
            <Handle
                type="target"
                position={Position.Top}
                id="target-top"
                style={{
                    ...handleStyle,
                    top: -5,
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
                isConnectable={true}
            />
            <Handle
                type="source"
                position={Position.Top}
                id="source-top"
                style={{
                    ...handleStyle,
                    top: -5,
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
                isConnectable={true}
            />

            {/* Right Handles */}
            <Handle
                type="target"
                position={Position.Right}
                id="target-right"
                style={{
                    ...handleStyle,
                    right: -5,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
                isConnectable={true}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="source-right"
                style={{
                    ...handleStyle,
                    right: -5,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
                isConnectable={true}
            />

            {/* Bottom Handles */}
            <Handle
                type="target"
                position={Position.Bottom}
                id="target-bottom"
                style={{
                    ...handleStyle,
                    bottom: -5,
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
                isConnectable={true}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="source-bottom"
                style={{
                    ...handleStyle,
                    bottom: -5,
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
                isConnectable={true}
            />

            {/* Left Handles */}
            <Handle
                type="target"
                position={Position.Left}
                id="target-left"
                style={{
                    ...handleStyle,
                    left: -5,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
                isConnectable={true}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="source-left"
                style={{
                    ...handleStyle,
                    left: -5,
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
                isConnectable={true}
            />

            {/* Node Body */}
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    border: `4px solid ${borderColor}`,
                    background: getBackgroundGradient(),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    cursor: 'pointer',
                    boxShadow: inCycle
                        ? '0 0 0 4px rgba(239, 68, 68, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)'
                        : '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                }}
                className="hover:shadow-2xl hover:scale-105"
            >
                {/* Cycle indicator */}
                {inCycle && (
                    <div
                        style={{
                            position: 'absolute',
                            top: -12,
                            left: -12,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#ef4444',
                            border: '3px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                            zIndex: 10,
                        }}
                    >
                        🔄
                    </div>
                )}

                {/* Badge for start/end */}
                {(isStart || isEnd) && (
                    <div
                        style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: isStart ? '#3b82f6' : '#10b981',
                            border: '3px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        }}
                    >
                        {isStart ? '🎯' : '🏁'}
                    </div>
                )}

                {/* Account Icon */}
                <div
                    style={{
                        fontSize: size > 120 ? '28px' : '20px',
                        marginBottom: '4px',
                    }}
                >
                    {data.type === 'Checking' && '💳'}
                    {data.type === 'Savings' && '🏦'}
                    {data.type === 'Business' && '💼'}
                    {data.type === 'Investment' && '📈'}
                    {data.type === 'Credit Card' && '💰'}
                </div>

                {/* Account Name */}
                <div
                    className="text-xs font-bold text-center truncate w-full px-2"
                    style={{
                        color: clusterColor.text,
                        fontSize: size > 120 ? '11px' : '10px',
                        lineHeight: 1.2,
                    }}
                >
                    {data.name}
                </div>

                {/* Balance */}
                <div
                    className="text-xs font-semibold mt-1"
                    style={{
                        color: clusterColor.text,
                        fontSize: size > 120 ? '13px' : '11px',
                    }}
                >
                    ${(data.balance / 1000).toFixed(1)}K
                </div>

                {/* Account Type */}
                {size > 100 && (
                    <div
                        className="text-xs mt-1 px-2 py-0.5 rounded"
                        style={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            color: clusterColor.text,
                            fontSize: '9px',
                            fontWeight: 500,
                        }}
                    >
                        {data.type}
                    </div>
                )}
            </div>
        </>
    );
}

// Helper function to adjust color brightness
function adjustColorBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

// Memoize to prevent unnecessary re-renders
export const CustomNode = memo(CustomNodeComponent);