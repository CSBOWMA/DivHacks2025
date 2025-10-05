import dagre from 'dagre';
import { Node, Edge, MarkerType } from 'reactflow';
import { GraphData } from '@/types/graph';

export const sizeScale = (balance: number): number => {
    const minSize = 80;
    const maxSize = 180;
    const normalized = Math.log(balance + 1) / Math.log(100000);
    return minSize + (maxSize - minSize) * Math.min(Math.max(normalized, 0), 1);
};

export const widthScale = (amount: number): number => {
    const minWidth = 3;
    const maxWidth = 12;
    const minAmount = 1000;
    const maxAmount = 50000;

    const normalized = (amount - minAmount) / (maxAmount - minAmount);
    return minWidth + (maxWidth - minWidth) * Math.min(Math.max(normalized, 0), 1);
};

// Find connected components using DFS
export const findConnectedComponents = (nodes: any[], edges: any[]): Map<string, number> => {
    const nodeToComponent = new Map<string, number>();
    const adjList = new Map<string, Set<string>>();

    // Build adjacency list (undirected graph)
    nodes.forEach(node => {
        adjList.set(node.id, new Set());
    });

    edges.forEach(edge => {
        adjList.get(edge.source)?.add(edge.target);
        adjList.get(edge.target)?.add(edge.source);
    });

    let componentId = 0;
    const visited = new Set<string>();

    // DFS to find connected components
    const dfs = (nodeId: string, compId: number) => {
        visited.add(nodeId);
        nodeToComponent.set(nodeId, compId);

        const neighbors = adjList.get(nodeId) || new Set();
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                dfs(neighbor, compId);
            }
        }
    };

    // Find all components
    for (const node of nodes) {
        if (!visited.has(node.id)) {
            dfs(node.id, componentId);
            componentId++;
        }
    }

    return nodeToComponent;
};

// Get cluster colors
const clusterColors = [
    { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },  // Blue
    { bg: '#F0FDF4', border: '#10B981', text: '#065F46' },  // Green
    { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },  // Amber
    { bg: '#FCE7F3', border: '#EC4899', text: '#9F1239' },  // Pink
    { bg: '#EDE9FE', border: '#8B5CF6', text: '#5B21B6' },  // Purple
    { bg: '#DBEAFE', border: '#06B6D4', text: '#164E63' },  // Cyan
    { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },  // Red
    { bg: '#E0E7FF', border: '#6366F1', text: '#3730A3' },  // Indigo
];

export const getClusterColor = (componentId: number) => {
    return clusterColors[componentId % clusterColors.length];
};

export const createLayoutedElements = (graphData: GraphData) => {
    console.log('=== Creating Layouted Elements with Clustering ===');

    const nodeIdMap = new Map(graphData.nodes.map(n => [n.id, n]));
    console.log('Available nodes:', Array.from(nodeIdMap.keys()));

    // Find connected components
    const nodeToComponent = findConnectedComponents(graphData.nodes, graphData.edges);

    // Group nodes by component
    const componentGroups = new Map<number, string[]>();
    nodeToComponent.forEach((componentId, nodeId) => {
        if (!componentGroups.has(componentId)) {
            componentGroups.set(componentId, []);
        }
        componentGroups.get(componentId)!.push(nodeId);
    });

    console.log(`Found ${componentGroups.size} connected components`);
    componentGroups.forEach((nodes, id) => {
        console.log(`Component ${id}: ${nodes.length} nodes`);
    });

    // Create separate dagre graphs for each component
    const componentLayouts = new Map<number, { x: number, y: number, width: number, height: number }>();
    const allNodes: Node[] = [];

    let currentX = 0;
    const componentSpacing = 300; // Space between clusters

    // Layout each component separately
    componentGroups.forEach((componentNodeIds, componentId) => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({
            rankdir: 'LR',
            align: 'UL',
            nodesep: 120,
            ranksep: 200,
            edgesep: 80,
            marginx: 80,
            marginy: 80,
        });

        const componentNodes = componentNodeIds.map(id => nodeIdMap.get(id)!);
        const clusterColor = getClusterColor(componentId);

        // Add nodes for this component
        componentNodes.forEach((node) => {
            const size = sizeScale(node.balance);
            dagreGraph.setNode(node.id, {
                width: size,
                height: size,
            });

            const reactFlowNode: Node = {
                id: node.id,
                type: 'custom',
                position: { x: 0, y: 0 },
                data: {
                    ...node,
                    isStart: node.id === graphData.query.start_account_id,
                    isEnd: node.id === graphData.query.end_account_id,
                    componentId,
                    clusterColor,
                },
            };

            allNodes.push(reactFlowNode);
        });

        // Add edges for this component
        const componentEdges = graphData.edges.filter(
            e => componentNodeIds.includes(e.source) && componentNodeIds.includes(e.target)
        );

        componentEdges.forEach(edge => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        // Layout this component
        dagre.layout(dagreGraph);

        // Calculate bounding box
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        componentNodeIds.forEach((nodeId) => {
            const nodeWithPosition = dagreGraph.node(nodeId);
            if (nodeWithPosition) {
                minX = Math.min(minX, nodeWithPosition.x - nodeWithPosition.width / 2);
                maxX = Math.max(maxX, nodeWithPosition.x + nodeWithPosition.width / 2);
                minY = Math.min(minY, nodeWithPosition.y - nodeWithPosition.height / 2);
                maxY = Math.max(maxY, nodeWithPosition.y + nodeWithPosition.height / 2);
            }
        });

        const componentWidth = maxX - minX;
        const componentHeight = maxY - minY;

        // Apply positions with offset for this component
        allNodes.forEach((node) => {
            if (componentNodeIds.includes(node.id)) {
                const nodeWithPosition = dagreGraph.node(node.id);
                if (nodeWithPosition) {
                    node.position = {
                        x: currentX + (nodeWithPosition.x - minX),
                        y: nodeWithPosition.y - minY,
                    };
                }
            }
        });

        // Store component layout info
        componentLayouts.set(componentId, {
            x: currentX,
            y: 0,
            width: componentWidth,
            height: componentHeight,
        });

        // Move to next component position
        currentX += componentWidth + componentSpacing;
    });

    // Create edges with improved styling
    const edges: Edge[] = [];

    for (const edgeData of graphData.edges) {
        if (!nodeIdMap.has(edgeData.source)) {
            console.error(`❌ Edge ${edgeData.id}: Source node "${edgeData.source}" not found!`);
            continue;
        }

        if (!nodeIdMap.has(edgeData.target)) {
            console.error(`❌ Edge ${edgeData.id}: Target node "${edgeData.target}" not found!`);
            continue;
        }

        const strokeWidth = widthScale(edgeData.total_amount);
        const sourceComponent = nodeToComponent.get(edgeData.source);
        const componentColor = sourceComponent !== undefined ? getClusterColor(sourceComponent) : clusterColors[0];

        const edge: Edge = {
            id: edgeData.id,
            source: edgeData.source,
            target: edgeData.target,
            type: 'default', // Changed from smoothstep to default for better curved edges
            animated: true,
            label: `$${(edgeData.total_amount / 1000).toFixed(1)}K`,
            labelStyle: {
                fontSize: 11,
                fontWeight: 600,
                fill: '#1f2937',
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            labelBgStyle: {
                fill: '#ffffff',
                fillOpacity: 0.95,
                rx: 4,
                ry: 4,
            },
            labelBgPadding: [6, 8] as [number, number],
            style: {
                strokeWidth: strokeWidth,
                stroke: componentColor.border,
                strokeLinecap: 'round',
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: componentColor.border,
            },
            data: edgeData,
        };

        edges.push(edge);
    }

    console.log(`Created ${allNodes.length} nodes and ${edges.length} edges`);
    console.log('=== Layout Complete ===');

    return {
        nodes: allNodes,
        edges,
        componentLayouts,
        componentCount: componentGroups.size,
    };
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};