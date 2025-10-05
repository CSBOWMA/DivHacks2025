import { FC } from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

const CustomEdge: FC<EdgeProps> = ({
                                       id,
                                       sourceX,
                                       sourceY,
                                       targetX,
                                       targetY,
                                       sourcePosition,
                                       targetPosition,
                                       style = {},
                                       markerEnd,
                                       label,
                                       labelStyle,
                                       data,
                                   }) => {
    // Use smooth step path for more natural routing
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 20, // Smooth corners
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                }}
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <div
                            style={{
                                background: '#ffffff',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                border: '1px solid rgba(0,0,0,0.04)',
                                fontSize: '10px',
                                fontWeight: 600,
                                color: '#374151',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {label}
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default CustomEdge;