'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {Panel} from "reactflow";
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphData, GraphNode as GraphNodeType, GraphEdge as GraphEdgeType } from '@/types/graph';
import { CustomNode } from './graph/CustomNode';
import GraphLegend from './graph/GraphLegend';
import GraphSummaryPanel from './graph/GraphSummaryPanel';
import GraphPathsPanel from './graph/GraphPathsPanel';
import GraphCyclesPanel from './graph/GraphCyclesPanel';
import NodeDetailsSidebar from './graph/NodeDetailsSidebar';
import EdgeDetailsSidebar from './graph/EdgeDetailsSidebar';
import { createLayoutedElements, formatCurrency, formatDate } from '@/lib/graphUtils';

interface AccountGraphVisualizationProps {
    graphData: GraphData;
}

const nodeTypes = {
    custom: CustomNode,
};

function GraphVisualizationContent({ graphData }: AccountGraphVisualizationProps) {
    const [selectedNode, setSelectedNode] = useState<GraphNodeType | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<GraphEdgeType | null>(null);
    const [highlightedPath, setHighlightedPath] = useState<string | null>(null);

    // Create layouted elements
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        console.log('=== Graph Data Debug ===');
        console.log('Nodes:', graphData.nodes.map(n => ({ id: n.id, name: n.name })));
        console.log('Edges:', graphData.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            amount: e.total_amount
        })));

        const result = createLayoutedElements(graphData);

        console.log('Created Nodes:', result.nodes.length);
        console.log('Created Edges:', result.edges.length);
        console.log('Edge Details:', result.edges);

        return result;
    }, [graphData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Log whenever edges state changes
    useEffect(() => {
        console.log('Edges state updated:', edges);
    }, [edges]);

    // Update nodes and edges when graphData changes
    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = createLayoutedElements(graphData);
        console.log('Setting new nodes and edges');
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

        // Highlight edges in the path - FIXED
        setEdges((eds) =>
            eds.map((edge) => {
                const isInPath = path.edges.includes(edge.id);
                const baseWidth = edge.style?.strokeWidth as number || 2;

                return {
                    ...edge,
                    animated: isInPath,
                    style: {
                        ...edge.style,
                        stroke: isInPath ? '#3b82f6' : '#6b7280',
                        strokeWidth: isInPath ? baseWidth * 1.5 : baseWidth,
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20,
                        color: isInPath ? '#3b82f6' : '#6b7280',
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

    return (
        <div className="w-full h-full relative bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                    includeHiddenNodes: false,
                }}
                minZoom={0.1}
                maxZoom={4}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    style: { strokeWidth: 2, stroke: '#6b7280' },
                }}
                attributionPosition="bottom-right"
            >
                <Background color="#e5e7eb" gap={16} />
                <Controls />
                <Panel position="bottom-center" className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                    <div className="text-xs space-y-1">
                        <div className="font-semibold">Debug Info:</div>
                        <div>Nodes: {nodes.length} | Edges: {edges.length}</div>
                        <div>
                            Node IDs: {nodes.map(n => n.id).join(', ')}
                        </div>
                        <div>
                            Edges: {edges.map(e => `${e.source}→${e.target}`).join(', ')}
                        </div>
                    </div>
                </Panel>

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