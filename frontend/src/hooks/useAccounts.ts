import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    status: string;
    created_at: string;
    customer_id?: string;
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

export function useAccounts({
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

            // Build query parameters
            const params = new URLSearchParams();

            const finalLimit = customParams?.limit ?? limit;
            const finalOffset = customParams?.offset ?? offset;
            const finalCustomerId = customParams?.customerId ?? customerId;
            const finalAccountType = customParams?.accountType ?? accountType;
            const finalMinBalance = customParams?.minBalance ?? minBalance;
            const finalMaxBalance = customParams?.maxBalance ?? maxBalance;

            params.append('limit', finalLimit.toString());
            params.append('offset', finalOffset.toString());

            if (finalCustomerId) params.append('customer_id', finalCustomerId);
            if (finalAccountType) params.append('account_type', finalAccountType);
            if (finalMinBalance !== undefined) params.append('min_balance', finalMinBalance.toString());
            if (finalMaxBalance !== undefined) params.append('max_balance', finalMaxBalance.toString());

            const endpoint = `${API_URL}/api/accounts?${params.toString()}`;

            console.log('Fetching accounts from:', endpoint);

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            return result;
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