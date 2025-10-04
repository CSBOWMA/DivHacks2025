const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
    token?: string | null;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { token, headers, ...restOptions } = options;

        const config: RequestInit = {
            ...restOptions,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...headers,
            },
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                // Clear token and redirect to login
                localStorage.removeItem('session_token');
                window.location.href = '/login';
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            // Handle empty responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return {} as T;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get<T>(endpoint: string, token?: string | null): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', token });
    }

    async post<T>(
        endpoint: string,
        data?: any,
        token?: string | null
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    async put<T>(
        endpoint: string,
        data?: any,
        token?: string | null
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        });
    }

    async delete<T>(endpoint: string, token?: string | null): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', token });
    }

    async patch<T>(
        endpoint: string,
        data?: any,
        token?: string | null
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            token,
        });
    }
}

export const apiClient = new ApiClient(API_URL);