'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    MarkerType,
    Panel,
    ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphData, GraphNode as GraphNodeType, GraphEdge as GraphEdgeType } from '@/types/graph';
import { CustomNode } from './graph/CustomNode';
import CustomEdge from './graph/CustomEdge';
import GraphLegend from './graph/GraphLegend';
import GraphSummaryPanel from './graph/GraphSummaryPanel';
import GraphPathsPanel from './graph/GraphPathsPanel';
import GraphCyclesPanel from './graph/GraphCyclesPanel';
import NodeDetailsSidebar from './graph/NodeDetailsSidebar';
import EdgeDetailsSidebar from './graph/EdgeDetailsSidebar';
import { createLayoutedElements, formatCurrency, formatDate, getClusterColor } from '@/lib/graphUtils';

interface AccountGraphVisualizationProps {
    graphData: GraphData;
}

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    custom: CustomEdge,
};

function GraphVisualizationContent({ graphData }: AccountGraphVisualizationProps) {
    const [selectedNode, setSelectedNode] = useState<GraphNodeType | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<GraphEdgeType | null>(null);
    const [highlightedPath, setHighlightedPath] = useState<string | null>(null);

    // Create layouted elements with clustering
    const { nodes: initialNodes, edges: initialEdges, componentLayouts, componentCount } = useMemo(() => {
        console.log('Creating graph layout with data:', graphData);
        const result = createLayoutedElements(graphData);
        console.log('Created nodes:', result.nodes.length);
        console.log('Created edges:', result.edges.length);
        console.log('Components:', result.componentCount);
        return result;
    }, [graphData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes and edges when graphData changes
    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = createLayoutedElements(graphData);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [graphData, setNodes, setEdges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        console.log('Node clicked:', node.id);
        const nodeData = graphData.nodes.find((n) => n.id === node.id);
        setSelectedNode(nodeData || null);
        setSelectedEdge(null);
    }, [graphData.nodes]);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        console.log('Edge clicked:', edge.id);
        const edgeData = graphData.edges.find((e) => e.id === edge.id);
        setSelectedEdge(edgeData || null);
        setSelectedNode(null);
    }, [graphData.edges]);

    const highlightPath = useCallback((pathId: string) => {
        const path = graphData.paths.find((p) => p.path_id === pathId);
        if (!path) return;

        setHighlightedPath(pathId);

        // Highlight edges in the path
        setEdges((eds) =>
            eds.map((edge) => {
                const isInPath = path.edges.includes(edge.id);
                const baseWidth = edge.style?.strokeWidth as number || 2;

                return {
                    ...edge,
                    animated: isInPath,
                    style: {
                        ...edge.style,
                        stroke: isInPath ? '#3b82f6' : edge.style?.stroke,
                        strokeWidth: isInPath ? baseWidth * 1.5 : baseWidth,
                        opacity: isInPath ? 1 : 0.3,
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 12,
                        height: 12,
                        color: isInPath ? '#3b82f6' : (edge.style?.stroke as string || '#6b7280'),
                    },
                };
            })
        );

        // Highlight nodes in the path
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                style: {
                    ...node.style,
                    opacity: path.nodes.includes(node.id) ? 1 : 0.3,
                },
            }))
        );
    }, [graphData.paths, setEdges, setNodes]);

    const clearHighlight = useCallback(() => {
        setHighlightedPath(null);
        setEdges(initialEdges);
        setNodes(initialNodes);
    }, [initialEdges, initialNodes, setEdges, setNodes]);

    // Create cluster backgrounds
    const clusterBackgrounds = useMemo(() => {
        if (componentCount <= 1) return null;

        return Array.from(componentLayouts?.entries() || []).map(([componentId, layout]) => {
            const color = getClusterColor(componentId);
            return (
                <div
                    key={`cluster-${componentId}`}
                    style={{
                        position: 'absolute',
                        left: layout.x - 40,
                        top: layout.y - 40,
                        width: layout.width + 80,
                        height: layout.height + 80,
                        background: color.bg,
                        border: `2px dashed ${color.border}`,
                        borderRadius: '16px',
                        opacity: 0.4,
                        pointerEvents: 'none',
                        zIndex: -1,
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            background: color.border,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            opacity: 0.9,
                        }}
                    >
                        Cluster {componentId + 1}
                    </div>
                </div>
            );
        });
    }, [componentLayouts, componentCount]);

    return (
        <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Cluster backgrounds */}
            {clusterBackgrounds && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                    {clusterBackgrounds}
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                    includeHiddenNodes: false,
                }}
                minZoom={0.1}
                maxZoom={4}
                connectionMode={ConnectionMode.Loose} // Allow flexible connections
                defaultEdgeOptions={{
                    type: 'custom',
                    animated: true,
                }}
                proOptions={{ hideAttribution: true }}
                connectionLineStyle={{
                    stroke: '#3b82f6',
                    strokeWidth: 2,
                }}
            >
                <Background
                    color="#d1d5db"
                    gap={20}
                    size={1}
                    style={{ opacity: 0.4 }}
                />
                <Controls
                    showInteractive={false}
                    style={{
                        button: {
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                        }
                    }}
                />

                <GraphLegend />
                <GraphSummaryPanel graphData={graphData} formatCurrency={formatCurrency} />
                <GraphPathsPanel
                    graphData={graphData}
                    highlightedPath={highlightedPath}
                    onHighlightPath={highlightPath}
                    onClearHighlight={clearHighlight}
                    formatCurrency={formatCurrency}
                />
                <GraphCyclesPanel graphData={graphData} formatCurrency={formatCurrency} />

                {/* Component Count Badge */}
                {componentCount > 1 && (
                    <Panel position="top-center" className="bg-orange-50 border border-orange-300 rounded-lg px-4 py-2 shadow-lg">
                        <div className="flex items-center gap-2 text-sm">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="font-semibold text-orange-900">
                                {componentCount} Disconnected Clusters
                            </span>
                        </div>
                    </Panel>
                )}
                {/* Debug Panel */}
                <Panel position="bottom-center" className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                    <div className="text-xs space-y-1">
                        <div className="font-semibold text-gray-700">Debug Info:</div>
                        <div className="text-gray-600">
                            Nodes: {nodes.length} | Edges: {edges.length} | Clusters: {componentCount}
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Node Details Sidebar */}
            {selectedNode && (
                <NodeDetailsSidebar
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    formatCurrency={formatCurrency}
                />
            )}

            {/* Edge Details Sidebar */}
            {selectedEdge && (
                <EdgeDetailsSidebar
                    edge={selectedEdge}
                    onClose={() => setSelectedEdge(null)}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
}

export default function AccountGraphVisualization({ graphData }: AccountGraphVisualizationProps) {
    return (
        <ReactFlowProvider>
            <GraphVisualizationContent graphData={graphData} />
        </ReactFlowProvider>
    );
}