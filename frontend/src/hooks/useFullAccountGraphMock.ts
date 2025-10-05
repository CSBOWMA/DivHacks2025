import { useState, useCallback } from 'react';
import { GraphData, GraphNode, GraphEdge } from '@/types/graph';

interface UseFullAccountGraphParams {
    minTransactionAmount?: number;
    includeAllAccounts?: boolean;
}

// Generate a comprehensive network of accounts
const generateFullGraphData = (
    minAmount: number = 0,
    includeAll: boolean = true
): GraphData => {
    console.log('=== Generating Full Account Network ===');

    // Generate 10-20 accounts
    const accountCount = Math.floor(Math.random() * 11) + 10; // 10-20 accounts
    const nodes: GraphNode[] = [];

    const accountTypes = ['Checking', 'Savings', 'Business', 'Investment', 'Credit Card'];

    for (let i = 0; i < accountCount; i++) {
        const accountId = `acc_${String(i + 1).padStart(3, '0')}`;
        const type = accountTypes[Math.floor(Math.random() * accountTypes.length)];

        nodes.push({
            id: accountId,
            name: `${type} Account ${i + 1}`,
            type,
            balance: 5000 + Math.random() * 95000,
            currency: 'USD',
            customer_id: `cust_${String(Math.floor(i / 3) + 1).padStart(3, '0')}`,
            transaction_count: Math.floor(Math.random() * 100) + 20,
            total_outgoing: 10000 + Math.random() * 50000,
            total_incoming: 12000 + Math.random() * 50000,
        });
    }

    console.log(`Generated ${nodes.length} accounts`);

    // Generate edges - create a realistic transaction network
    const edges: GraphEdge[] = [];
    const edgeSet = new Set<string>(); // Prevent duplicate edges

    // Strategy 1: Create a backbone - connect sequential accounts
    for (let i = 0; i < nodes.length - 1; i++) {
        const source = nodes[i].id;
        const target = nodes[i + 1].id;
        const edgeKey = `${source}-${target}`;

        if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push(createEdge(source, target, edges.length));
        }
    }

    // Strategy 2: Create hub accounts (highly connected)
    const hubCount = Math.floor(nodes.length * 0.2); // 20% are hubs
    const hubs = nodes.slice(0, hubCount);

    for (const hub of hubs) {
        // Each hub connects to 3-6 random accounts
        const connectionCount = Math.floor(Math.random() * 4) + 3;

        for (let i = 0; i < connectionCount; i++) {
            const randomTarget = nodes[Math.floor(Math.random() * nodes.length)];

            if (hub.id !== randomTarget.id) {
                const edgeKey = `${hub.id}-${randomTarget.id}`;
                const reverseKey = `${randomTarget.id}-${hub.id}`;

                if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseKey)) {
                    edgeSet.add(edgeKey);
                    edges.push(createEdge(hub.id, randomTarget.id, edges.length));
                }
            }
        }
    }

    // Strategy 3: Add some random connections for complexity
    const randomEdgeCount = Math.floor(nodes.length * 0.5);

    for (let i = 0; i < randomEdgeCount; i++) {
        const source = nodes[Math.floor(Math.random() * nodes.length)];
        const target = nodes[Math.floor(Math.random() * nodes.length)];

        if (source.id !== target.id) {
            const edgeKey = `${source.id}-${target.id}`;
            const reverseKey = `${target.id}-${source.id}`;

            if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseKey)) {
                edgeSet.add(edgeKey);
                edges.push(createEdge(source.id, target.id, edges.length));
            }
        }
    }

    // Strategy 4: Create some cycles (circular flows)
    const cycleCount = Math.floor(nodes.length * 0.1);

    for (let i = 0; i < cycleCount; i++) {
        const cycleLength = Math.floor(Math.random() * 3) + 3; // 3-5 nodes
        const cycleNodes: string[] = [];

        for (let j = 0; j < cycleLength; j++) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            if (!cycleNodes.includes(randomNode.id)) {
                cycleNodes.push(randomNode.id);
            }
        }

        // Connect cycle nodes
        for (let j = 0; j < cycleNodes.length; j++) {
            const source = cycleNodes[j];
            const target = cycleNodes[(j + 1) % cycleNodes.length];
            const edgeKey = `${source}-${target}`;

            if (!edgeSet.has(edgeKey)) {
                edgeSet.add(edgeKey);
                edges.push(createEdge(source, target, edges.length));
            }
        }
    }

    // Filter by minimum amount if specified
    const filteredEdges = minAmount > 0
        ? edges.filter(e => e.total_amount >= minAmount)
        : edges;

    console.log(`Generated ${edges.length} total edges, ${filteredEdges.length} after filtering`);

    // Detect cycles in the graph
    const cycles = detectCycles(nodes, filteredEdges);

    const graphData: GraphData = {
        query: {
            start_account_id: 'all',
            end_account_id: 'all',
            max_depth: 10,
            is_cycle: false,
        },
        nodes,
        edges: filteredEdges,
        paths: [], // Not applicable for full graph
        cycles,
        summary: {
            total_nodes: nodes.length,
            total_edges: filteredEdges.length,
            total_paths: 0,
            total_cycles: cycles.length,
            total_flow_amount: filteredEdges.reduce((sum, e) => sum + e.total_amount, 0),
            average_path_length: 0,
        },
    };

    console.log('=== Full Graph Generation Complete ===');
    console.log('Summary:', graphData.summary);

    return graphData;
};

// Helper function to create an edge
function createEdge(source: string, target: string, index: number): GraphEdge {
    const transactionCount = Math.floor(Math.random() * 20) + 5;
    const avgTransactionAmount = 500 + Math.random() * 5000;
    const totalAmount = avgTransactionAmount * transactionCount;

    return {
        id: `edge_${index}_${source}_to_${target}`,
        source,
        target,
        total_amount: totalAmount,
        transaction_count: transactionCount,
        average_amount: avgTransactionAmount,
        min_amount: 100 + Math.random() * 500,
        max_amount: avgTransactionAmount * 2,
        first_transaction_date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        last_transaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        transactions: Array.from({ length: Math.min(transactionCount, 5) }, (_, txIdx) => ({
            id: `txn_${index}_${txIdx}`,
            amount: avgTransactionAmount * (0.5 + Math.random()),
            date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
            description: [
                'Wire Transfer',
                'ACH Transfer',
                'Direct Transfer',
                'Payment Processing',
                'Funds Transfer',
                'Internal Transfer',
                'External Transfer'
            ][Math.floor(Math.random() * 7)],
        })),
    };
}

// Simple cycle detection using DFS
function detectCycles(nodes: GraphNode[], edges: GraphEdge[]) {
    const cycles = [];
    const adjList = new Map<string, string[]>();

    // Build adjacency list
    for (const edge of edges) {
        if (!adjList.has(edge.source)) {
            adjList.set(edge.source, []);
        }
        adjList.get(edge.source)!.push(edge.target);
    }

    // Find a few cycles (limit to 5 for performance)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    let cycleCount = 0;

    function dfs(node: string, path: string[]): boolean {
        if (cycleCount >= 5) return false;

        visited.add(node);
        recursionStack.add(node);
        path.push(node);

        const neighbors = adjList.get(node) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor, [...path])) return true;
            } else if (recursionStack.has(neighbor)) {
                // Found a cycle
                const cycleStart = path.indexOf(neighbor);
                const cycleNodes = path.slice(cycleStart);
                cycleNodes.push(neighbor); // Complete the cycle

                // Get edges in cycle
                const cycleEdges = [];
                for (let i = 0; i < cycleNodes.length - 1; i++) {
                    const edge = edges.find(e => e.source === cycleNodes[i] && e.target === cycleNodes[i + 1]);
                    if (edge) cycleEdges.push(edge.id);
                }

                const totalAmount = cycleEdges.reduce((sum, edgeId) => {
                    const edge = edges.find(e => e.id === edgeId);
                    return sum + (edge?.total_amount || 0);
                }, 0);

                cycles.push({
                    cycle_id: `cycle_${cycleCount + 1}`,
                    nodes: cycleNodes,
                    edges: cycleEdges,
                    total_amount: totalAmount,
                    cycle_length: cycleNodes.length - 1,
                    net_flow: Math.random() * 2000 - 1000,
                    is_suspicious: Math.random() > 0.7,
                    suspicious_reason: Math.random() > 0.7 ? 'Circular transaction pattern detected' : undefined,
                });

                cycleCount++;
                return true;
            }
        }

        recursionStack.delete(node);
        return false;
    }

    // Try to find cycles starting from each node
    for (const node of nodes) {
        if (!visited.has(node.id) && cycleCount < 5) {
            dfs(node.id, []);
        }
    }

    return cycles;
}

export function useFullAccountGraphMock() {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFullGraph = useCallback(async ({
                                                  minTransactionAmount = 0,
                                                  includeAllAccounts = true,
                                              }: UseFullAccountGraphParams = {}) => {
        console.log('=== Fetch Full Graph Called ===');
        console.log('Min Amount:', minTransactionAmount);
        console.log('Include All:', includeAllAccounts);

        setLoading(true);
        setError(null);
        setData(null);

        // Simulate API delay
        setTimeout(() => {
            try {
                const mockData = generateFullGraphData(minTransactionAmount, includeAllAccounts);
                setData(mockData);
                setLoading(false);
                console.log('Full graph data set successfully');
            } catch (err) {
                console.error('Error generating full graph:', err);
                setError('Failed to generate full graph data');
                setLoading(false);
            }
        }, 1500); // Longer delay to simulate larger data load
    }, []);

    const reset = useCallback(() => {
        console.log('Resetting full graph data');
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        data,
        loading,
        error,
        fetchFullGraph,
        reset,
    };
}