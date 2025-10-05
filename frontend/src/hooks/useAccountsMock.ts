import { useState, useEffect } from 'react';

export interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    status: string;
    created_at: string;
    customer_id: string;
}

export interface PaginationInfo {
    total_accounts: number;
    returned_accounts: number;
    limit: number;
    offset: number;
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    next_offset: number | null;
    previous_offset: number | null;
}

export interface AccountsSummary {
    total_balance: number;
    average_balance: number;
    account_types: Record<string, number>;
}

export interface AccountsResponse {
    accounts: Account[];
    pagination: PaginationInfo;
    summary: AccountsSummary;
    filters: {
        customer_id: string | null;
        account_type: string | null;
        min_balance: number | null;
        max_balance: number | null;
    };
}

interface UseAccountsParams {
    customerId?: string;
    accountType?: string;
    minBalance?: number;
    maxBalance?: number;
    limit?: number;
    offset?: number;
    autoFetch?: boolean;
}

// Generate mock accounts
const MOCK_ACCOUNTS: Account[] = [
    {
        id: "acc_001",
        customer_id: "cust_001",
        name: "Main Checking Account",
        type: "Checking",
        balance: 15420.50,
        currency: "USD",
        status: "active",
        created_at: "2023-01-15"
    },
    {
        id: "acc_002",
        customer_id: "cust_001",
        name: "Primary Savings",
        type: "Savings",
        balance: 50000.00,
        currency: "USD",
        status: "active",
        created_at: "2023-02-20"
    },
    {
        id: "acc_003",
        customer_id: "cust_002",
        name: "Business Checking",
        type: "Checking",
        balance: 8750.25,
        currency: "USD",
        status: "active",
        created_at: "2023-03-10"
    },
    {
        id: "acc_004",
        customer_id: "cust_001",
        name: "Rewards Credit Card",
        type: "Credit Card",
        balance: -2500.00,
        currency: "USD",
        status: "active",
        created_at: "2023-04-05"
    },
    {
        id: "acc_005",
        customer_id: "cust_003",
        name: "Emergency Fund",
        type: "Savings",
        balance: 25000.00,
        currency: "USD",
        status: "active",
        created_at: "2023-05-12"
    },
    {
        id: "acc_006",
        customer_id: "cust_002",
        name: "Retirement Savings",
        type: "Savings",
        balance: 350000.00,
        currency: "USD",
        status: "active",
        created_at: "2023-06-18"
    },
    {
        id: "acc_007",
        customer_id: "cust_003",
        name: "Travel Credit Card",
        type: "Credit Card",
        balance: -1250.00,
        currency: "USD",
        status: "active",
        created_at: "2023-07-22"
    },
    {
        id: "acc_008",
        customer_id: "cust_001",
        name: "Car Payment Account",
        type: "Checking",
        balance: 3200.00,
        currency: "USD",
        status: "active",
        created_at: "2023-08-30"
    },
    {
        id: "acc_009",
        customer_id: "cust_004",
        name: "Home Down Payment",
        type: "Savings",
        balance: 75000.00,
        currency: "USD",
        status: "active",
        created_at: "2023-09-14"
    },
    {
        id: "acc_010",
        customer_id: "cust_002",
        name: "Business Credit Card",
        type: "Credit Card",
        balance: -5400.00,
        currency: "USD",
        status: "active",
        created_at: "2023-10-08"
    },
    {
        id: "acc_011",
        customer_id: "cust_004",
        name: "Education Fund",
        type: "Savings",
        balance: 42000.00,
        currency: "USD",
        status: "active",
        created_at: "2023-11-01"
    },
    {
        id: "acc_012",
        customer_id: "cust_003",
        name: "Daily Checking",
        type: "Checking",
        balance: 8900.00,
        currency: "USD",
        status: "active",
        created_at: "2023-12-05"
    },
    {
        id: "acc_013",
        customer_id: "cust_001",
        name: "Vacation Savings",
        type: "Savings",
        balance: 5200.00,
        currency: "USD",
        status: "active",
        created_at: "2024-01-10"
    },
    {
        id: "acc_014",
        customer_id: "cust_004",
        name: "Premium Credit Card",
        type: "Credit Card",
        balance: -3100.00,
        currency: "USD",
        status: "active",
        created_at: "2024-02-15"
    },
    {
        id: "acc_015",
        customer_id: "cust_002",
        name: "College Fund",
        type: "Savings",
        balance: 32000.00,
        currency: "USD",
        status: "active",
        created_at: "2024-03-20"
    },
    {
        id: "acc_016",
        customer_id: "cust_003",
        name: "Business Savings",
        type: "Savings",
        balance: 125000.00,
        currency: "USD",
        status: "active",
        created_at: "2024-04-01"
    },
    {
        id: "acc_017",
        customer_id: "cust_001",
        name: "Cash Back Credit Card",
        type: "Credit Card",
        balance: -850.00,
        currency: "USD",
        status: "active",
        created_at: "2024-05-10"
    },
    {
        id: "acc_018",
        customer_id: "cust_004",
        name: "Joint Checking",
        type: "Checking",
        balance: 12300.00,
        currency: "USD",
        status: "active",
        created_at: "2024-06-15"
    },
];

function generateMockResponse(
    limit: number,
    offset: number,
    customerId?: string,
    accountType?: string,
    minBalance?: number,
    maxBalance?: number
): AccountsResponse {
    // Filter accounts
    let filtered = MOCK_ACCOUNTS;

    if (customerId) {
        filtered = filtered.filter(acc => acc.customer_id === customerId);
    }

    if (accountType) {
        filtered = filtered.filter(acc => acc.type === accountType);
    }

    if (minBalance !== undefined) {
        filtered = filtered.filter(acc => acc.balance >= minBalance);
    }

    if (maxBalance !== undefined) {
        filtered = filtered.filter(acc => acc.balance <= maxBalance);
    }

    // Calculate pagination
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    // Calculate summary
    const totalBalance = filtered.reduce((sum, acc) => sum + acc.balance, 0);
    const accountTypes: Record<string, number> = {};
    filtered.forEach(acc => {
        accountTypes[acc.type] = (accountTypes[acc.type] || 0) + 1;
    });

    return {
        accounts: paginated,
        pagination: {
            total_accounts: total,
            returned_accounts: paginated.length,
            limit,
            offset,
            current_page: currentPage,
            total_pages: totalPages,
            has_next: (offset + limit) < total,
            has_previous: offset > 0,
            next_offset: (offset + limit) < total ? offset + limit : null,
            previous_offset: offset > 0 ? Math.max(0, offset - limit) : null,
        },
        summary: {
            total_balance: totalBalance,
            average_balance: total > 0 ? totalBalance / total : 0,
            account_types: accountTypes,
        },
        filters: {
            customer_id: customerId || null,
            account_type: accountType || null,
            min_balance: minBalance ?? null,
            max_balance: maxBalance ?? null,
        },
    };
}

export function useAccountsMock({
                                    customerId,
                                    accountType,
                                    minBalance,
                                    maxBalance,
                                    limit = 10,
                                    offset = 0,
                                    autoFetch = true,
                                }: UseAccountsParams = {}) {
    const [data, setData] = useState<AccountsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = async (customParams?: Partial<UseAccountsParams>) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                limit: customParams?.limit ?? limit,
                offset: customParams?.offset ?? offset,
                customerId: customParams?.customerId ?? customerId,
                accountType: customParams?.accountType ?? accountType,
                minBalance: customParams?.minBalance ?? minBalance,
                maxBalance: customParams?.maxBalance ?? maxBalance,
            };

            console.log('Fetching mock accounts with params:', params);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockResponse = generateMockResponse(
                params.limit,
                params.offset,
                params.customerId,
                params.accountType,
                params.minBalance,
                params.maxBalance
            );

            setData(mockResponse);
            return mockResponse;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounts';
            setError(errorMessage);
            console.error('Error fetching accounts:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch) {
            fetchAccounts();
        }
    }, [customerId, accountType, minBalance, maxBalance, limit, offset, autoFetch]);

    return {
        data,
        loading,
        error,
        refetch: fetchAccounts
    };
}