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

export const createLayoutedElements = (graphData: GraphData) => {
    console.log('=== Creating Layouted Elements ===');

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: 'LR',
        align: 'UL',
        nodesep: 150,
        ranksep: 300,
        edgesep: 100,
        marginx: 100,
        marginy: 100,
    });

    // Create a map of node IDs for validation
    const nodeIdMap = new Map(graphData.nodes.map(n => [n.id, n]));
    console.log('Available nodes:', Array.from(nodeIdMap.keys()));

    // Create ReactFlow nodes
    const nodes: Node[] = graphData.nodes.map((node) => {
        const size = sizeScale(node.balance);

        // Add node to dagre graph
        dagreGraph.setNode(node.id, {
            width: size,
            height: size,
            label: node.id,
        });

        console.log(`Creating node: ${node.id} (${node.name})`);

        return {
            id: node.id,
            type: 'custom',
            position: { x: 0, y: 0 }, // Will be set by dagre
            data: {
                ...node,
                isStart: node.id === graphData.query.start_account_id,
                isEnd: node.id === graphData.query.end_account_id,
            },
        };
    });

    // Create ReactFlow edges with validation
    const edges: Edge[] = [];

    for (const edgeData of graphData.edges) {
        // Validate that source and target nodes exist
        if (!nodeIdMap.has(edgeData.source)) {
            console.error(`❌ Edge ${edgeData.id}: Source node "${edgeData.source}" not found!`);
            console.error('Available nodes:', Array.from(nodeIdMap.keys()));
            continue;
        }

        if (!nodeIdMap.has(edgeData.target)) {
            console.error(`❌ Edge ${edgeData.id}: Target node "${edgeData.target}" not found!`);
            console.error('Available nodes:', Array.from(nodeIdMap.keys()));
            continue;
        }

        // Add edge to dagre graph
        dagreGraph.setEdge(edgeData.source, edgeData.target);

        const strokeWidth = widthScale(edgeData.total_amount);

        const edge: Edge = {
            id: edgeData.id,
            source: edgeData.source,
            target: edgeData.target,
            type: 'smoothstep',
            animated: true,
            label: `$${(edgeData.total_amount / 1000).toFixed(1)}K`,
            labelStyle: {
                fontSize: 12,
                fontWeight: 600,
                fill: '#1f2937',
            },
            labelBgStyle: {
                fill: '#ffffff',
                fillOpacity: 0.95,
            },
            labelBgPadding: [8, 4] as [number, number],
            labelBgBorderRadius: 4,
            style: {
                strokeWidth: strokeWidth,
                stroke: '#6b7280',
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 25,
                height: 25,
                color: '#6b7280',
            },
            data: edgeData,
        };

        console.log(`✓ Creating edge: ${edge.id} (${edge.source} → ${edge.target})`);
        edges.push(edge);
    }

    console.log(`Created ${nodes.length} nodes and ${edges.length} edges`);

    if (edges.length === 0) {
        console.error('⚠️ WARNING: No edges were created!');
    }

    // Run dagre layout
    console.log('Running dagre layout...');
    dagre.layout(dagreGraph);

    // Apply calculated positions
    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        if (nodeWithPosition) {
            node.position = {
                x: nodeWithPosition.x - nodeWithPosition.width / 2,
                y: nodeWithPosition.y - nodeWithPosition.height / 2,
            };
            console.log(`Node ${node.id} positioned at (${node.position.x}, ${node.position.y})`);
        } else {
            console.error(`Failed to get position for node ${node.id}`);
        }
    });

    console.log('=== Layout Complete ===');
    return { nodes, edges };
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