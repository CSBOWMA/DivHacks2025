export interface GraphNode {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    customer_id?: string;
    transaction_count: number;
    total_outgoing: number;
    total_incoming: number;
}

export interface GraphTransaction {
    id: string;
    amount: number;
    date: string;
    description: string;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    total_amount: number;
    transaction_count: number;
    average_amount: number;
    min_amount: number;
    max_amount: number;
    first_transaction_date: string;
    last_transaction_date: string;
    transactions: GraphTransaction[];
}

export interface GraphPath {
    path_id: string;
    nodes: string[];
    edges: string[];
    total_amount: number;
    path_length: number;
    is_cycle: boolean;
}

export interface GraphCycle {
    cycle_id: string;
    nodes: string[];
    edges: string[];
    total_amount: number;
    cycle_length: number;
    net_flow: number;
    is_suspicious: boolean;
    suspicious_reason?: string;
}

export interface GraphData {
    query: {
        start_account_id: string;
        end_account_id: string;
        max_depth: number;
        is_cycle: boolean;
    };
    nodes: GraphNode[];
    edges: GraphEdge[];
    paths: GraphPath[];
    cycles: GraphCycle[];
    summary: {
        total_nodes: number;
        total_edges: number;
        total_paths: number;
        total_cycles: number;
        total_flow_amount: number;
        average_path_length: number;
    };
}