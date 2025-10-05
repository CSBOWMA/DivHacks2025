'use client';

import AccountsList from '@/components/AccountsList';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Financial Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage your financial accounts and analytics
                    </p>
                </div>

                <AccountsList />
            </div>
        </div>
    );
}