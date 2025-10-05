'use client';

import { useState } from 'react';
import AccountsList from '@/components/AccountsList';
import AnalyticsToolSwitcher, { AnalyticsTool } from '@/components/AnalyticsToolSwitcher';
import AccountGraphAnalytics from '@/components/AccountGraphAnalytics';

export default function DashboardPage() {
    const [currentTool, setCurrentTool] = useState<AnalyticsTool>('accounts');

    const renderToolContent = () => {
        switch (currentTool) {
            case 'accounts':
                return <AccountsList />;
            case 'transactions':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <p className="text-gray-500">Transactions view coming soon...</p>
                    </div>
                );
            case 'insights':
                return <AccountGraphAnalytics />;
            case 'reports':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <p className="text-gray-500">Reports view coming soon...</p>
                    </div>
                );
            default:
                return <AccountsList />;
        }
    };

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

                <AnalyticsToolSwitcher
                    currentTool={currentTool}
                    onToolChange={setCurrentTool}
                />

                <div className="mt-6">
                    {renderToolContent()}
                </div>
            </div>
        </div>
    );
}