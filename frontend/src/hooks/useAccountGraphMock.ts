import { useState, useCallback } from 'react';
import { GraphData, GraphNode, GraphEdge } from '@/types/graph';

interface UseAccountGraphMockParams {
    startAccountId: string | null;
    endAccountId: string | null;
    maxDepth?: number;
    minTransactionAmount?: number;
}

// Helper to ensure cycle data is present
const ensureCycleInData = (graphData: GraphData): GraphData => {
    // If it's a cycle query and no cycles detected, force create one
    if (graphData.query.is_cycle && graphData.cycles.length === 0) {
        const cycleNodes = graphData.nodes.slice(0, Math.min(4, graphData.nodes.length));
        const cycleNodeIds = cycleNodes.map(n => n.id);

        // Create edges to form a cycle
        const cycleEdges = [];
        for (let i = 0; i < cycleNodeIds.length; i++) {
            const source = cycleNodeIds[i];
            const target = cycleNodeIds[(i + 1) % cycleNodeIds.length];

            // Check if edge exists, if not create it
            let edge = graphData.edges.find(e => e.source === source && e.target === target);
            if (!edge) {
                const transactionCount = Math.floor(Math.random() * 10) + 5;
                const avgAmount = 1000 + Math.random() * 4000;
                const totalAmount = avgAmount * transactionCount;

                edge = {
                    id: `edge_cycle_${i}`,
                    source,
                    target,
                    total_amount: totalAmount,
                    transaction_count: transactionCount,
                    average_amount: avgAmount,
                    min_amount: 100 + Math.random() * 500,
                    max_amount: avgAmount * 2,
                    first_transaction_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                    last_transaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    transactions: Array.from({ length: Math.min(transactionCount, 5) }, (_, txIdx) => ({
                        id: `txn_cycle_${i}_${txIdx}`,
                        amount: avgAmount * (0.5 + Math.random()),
                        date: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString(),
                        description: 'Cycle Transfer',
                    })),
                };

                graphData.edges.push(edge);
                cycleEdges.push(edge.id);
            } else {
                cycleEdges.push(edge.id);
            }
        }

        // Add the cycle
        graphData.cycles.push({
            cycle_id: 'cycle_forced',
            nodes: [...cycleNodeIds, cycleNodeIds[0]],
            edges: cycleEdges,
            total_amount: cycleEdges.reduce((sum, edgeId) => {
                const edge = graphData.edges.find(e => e.id === edgeId);
                return sum + (edge?.total_amount || 0);
            }, 0),
            cycle_length: cycleNodeIds.length,
            net_flow: Math.random() * 1000 - 500,
            is_suspicious: Math.random() > 0.5,
            suspicious_reason: 'Circular transaction pattern detected',
        });

        graphData.summary.total_cycles = 1;
    }

    return graphData;
};

const generateMockGraphData = (
    startId: string,
    endId: string,
    isCycle: boolean
): GraphData => {
    console.log('=== Starting Mock Data Generation ===');
    console.log('Start ID:', startId);
    console.log('End ID:', endId);
    console.log('Is Cycle:', isCycle);

    // Generate nodes first
    const nodes: GraphNode[] = [];

    // Start node
    nodes.push({
        id: startId,
        name: `Main Account ${startId.slice(-3)}`,
        type: 'Checking',
        balance: 25000 + Math.random() * 30000,
        currency: 'USD',
        customer_id: 'cust_001',
        transaction_count: Math.floor(Math.random() * 50) + 30,
        total_outgoing: 35000 + Math.random() * 20000,
        total_incoming: 40000 + Math.random() * 20000,
    });

    // Generate 2-3 intermediate nodes
    const intermediateCount = isCycle ? 3 : Math.floor(Math.random() * 2) + 2; // 2-3 nodes

    for (let i = 0; i < intermediateCount; i++) {
        const intermediateId = `acc_intermediate_${i + 1}`;
        nodes.push({
            id: intermediateId,
            name: `Transfer Account ${i + 1}`,
            type: ['Checking', 'Savings', 'Business', 'Investment'][Math.floor(Math.random() * 4)],
            balance: 10000 + Math.random() * 40000,
            currency: 'USD',
            customer_id: `cust_${String(i + 2).padStart(3, '0')}`,
            transaction_count: Math.floor(Math.random() * 40) + 15,
            total_outgoing: 15000 + Math.random() * 15000,
            total_incoming: 18000 + Math.random() * 15000,
        });
    }

    // Add end node (if not a cycle)
    if (!isCycle && endId !== startId) {
        nodes.push({
            id: endId,
            name: `Destination Account ${endId.slice(-3)}`,
            type: 'Savings',
            balance: 30000 + Math.random() * 25000,
            currency: 'USD',
            customer_id: 'cust_999',
            transaction_count: Math.floor(Math.random() * 35) + 20,
            total_outgoing: 20000 + Math.random() * 10000,
            total_incoming: 35000 + Math.random() * 15000,
        });
    }

    console.log('Generated Nodes:', nodes.map(n => ({ id: n.id, name: n.name })));

    // Generate edges connecting consecutive nodes
    const edges: GraphEdge[] = [];

    for (let i = 0; i < nodes.length - 1; i++) {
        const sourceNode = nodes[i];
        const targetNode = nodes[i + 1];

        const transactionCount = Math.floor(Math.random() * 12) + 8; // 8-20 transactions
        const avgTransactionAmount = 1000 + Math.random() * 4000;
        const totalAmount = avgTransactionAmount * transactionCount;

        const minAmount = 100 + Math.random() * 500;
        const maxAmount = avgTransactionAmount * (1.5 + Math.random());

        const edge: GraphEdge = {
            id: `edge_${i}`,
            source: sourceNode.id,
            target: targetNode.id,
            total_amount: totalAmount,
            transaction_count: transactionCount,
            average_amount: avgTransactionAmount,
            min_amount: minAmount,
            max_amount: maxAmount,
            first_transaction_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            last_transaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            transactions: Array.from({ length: Math.min(transactionCount, 5) }, (_, txIdx) => {
                const txAmount = avgTransactionAmount * (0.5 + Math.random());
                const daysAgo = Math.floor(Math.random() * 60);

                return {
                    id: `txn_${i}_${txIdx}`,
                    amount: txAmount,
                    date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
                    description: [
                        'Wire Transfer',
                        'ACH Transfer',
                        'Direct Transfer',
                        'Payment Processing',
                        'Funds Transfer'
                    ][Math.floor(Math.random() * 5)],
                };
            }),
        };

        console.log(`Edge ${i}: ${edge.source} -> ${edge.target} ($${edge.total_amount.toFixed(2)})`);
        edges.push(edge);
    }

    // If cycle, add edge from last node back to start
    if (isCycle) {
        const lastNode = nodes[nodes.length - 1];
        const transactionCount = Math.floor(Math.random() * 10) + 5;
        const avgTransactionAmount = 1500 + Math.random() * 3000;
        const totalAmount = avgTransactionAmount * transactionCount;

        const cycleEdge: GraphEdge = {
            id: `edge_cycle`,
            source: lastNode.id,
            target: startId,
            total_amount: totalAmount,
            transaction_count: transactionCount,
            average_amount: avgTransactionAmount,
            min_amount: 200 + Math.random() * 500,
            max_amount: avgTransactionAmount * 2,
            first_transaction_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            last_transaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            transactions: Array.from({ length: Math.min(transactionCount, 5) }, (_, txIdx) => ({
                id: `txn_cycle_${txIdx}`,
                amount: avgTransactionAmount * (0.5 + Math.random()),
                date: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Return Transfer',
            })),
        };

        console.log(`Cycle Edge: ${cycleEdge.source} -> ${cycleEdge.target} ($${cycleEdge.total_amount.toFixed(2)})`);
        edges.push(cycleEdge);
    }

    console.log('Total Nodes:', nodes.length);
    console.log('Total Edges:', edges.length);
    console.log('Node IDs:', nodes.map(n => n.id));
    console.log('Edge Connections:', edges.map(e => `${e.source} -> ${e.target}`));

    // Validate edges
    const nodeIdSet = new Set(nodes.map(n => n.id));
    const invalidEdges = edges.filter(e => !nodeIdSet.has(e.source) || !nodeIdSet.has(e.target));
    if (invalidEdges.length > 0) {
        console.error('Invalid edges found:', invalidEdges);
    }

    // Create path
    const pathNodes = nodes.map(n => n.id);
    if (isCycle) {
        pathNodes.push(startId); // Complete the cycle
    }

    const paths = [{
        path_id: 'path_001',
        nodes: pathNodes,
        edges: edges.map(e => e.id),
        total_amount: edges.reduce((sum, e) => sum + e.total_amount, 0),
        path_length: edges.length,
        is_cycle: isCycle,
    }];

    // Create cycles array if applicable
    const cycles = isCycle ? [{
        cycle_id: 'cycle_001',
        nodes: pathNodes,
        edges: edges.map(e => e.id),
        total_amount: edges.reduce((sum, e) => sum + e.total_amount, 0),
        cycle_length: nodes.length,
        net_flow: Math.random() * 2000 - 1000, // Can be positive or negative
        is_suspicious: Math.random() > 0.6,
        suspicious_reason: Math.random() > 0.6 ? 'Circular transaction pattern with minimal net flow' : undefined,
    }] : [];

    const graphData: GraphData = {
        query: {
            start_account_id: startId,
            end_account_id: endId,
            max_depth: 5,
            is_cycle: isCycle,
        },
        nodes,
        edges,
        paths,
        cycles,
        summary: {
            total_nodes: nodes.length,
            total_edges: edges.length,
            total_paths: paths.length,
            total_cycles: cycles.length,
            total_flow_amount: edges.reduce((sum, e) => sum + e.total_amount, 0),
            average_path_length: edges.length,
        },
    };

    console.log('=== Mock Data Generation Complete ===');
    console.log('Summary:', graphData.summary);

    return graphData;
};

export function useAccountGraphMock() {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGraph = useCallback(async ({
                                              startAccountId,
                                              endAccountId,
                                          }: UseAccountGraphMockParams) => {
        console.log('=== Fetch Graph Called ===');
        console.log('Start:', startAccountId);
        console.log('End:', endAccountId);

        if (!startAccountId || !endAccountId) {
            setError('Please select both start and end accounts');
            console.error('Missing account IDs');
            return;
        }

        setLoading(true);
        setError(null);
        setData(null); // Clear old data

        // Simulate API delay
        setTimeout(() => {
            try {
                // Determine if it's a cycle
                const isCycle = startAccountId === endAccountId;
                console.log('Generating mock data, isCycle:', isCycle);

                // Generate the mock data
                const mockData = generateMockGraphData(
                    startAccountId,
                    endAccountId,
                    isCycle
                );

                // Ensure cycle data is present if needed
                const enhancedData = ensureCycleInData(mockData);

                setData(enhancedData);
                setLoading(false);
                console.log('Mock data set successfully');
            } catch (err) {
                console.error('Error generating mock data:', err);
                setError('Failed to generate graph data');
                setLoading(false);
            }
        }, 800);
    }, []);

    const reset = useCallback(() => {
        console.log('Resetting graph data');
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        data,
        loading,
        error,
        fetchGraph,
        reset,
    };
}