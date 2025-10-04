'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name || user?.email}!
                </h1>
                <p className="text-gray-600">
                    Here's your financial analytics dashboard
                </p>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Profile Information
                </h2>
                <div className="flex items-center gap-4">
                    {user?.picture && (
                        <img
                            src={user.picture}
                            alt={user.name || 'User'}
                            className="w-16 h-16 rounded-full"
                        />
                    )}
                    <div>
                        <p className="font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Total Revenue</h3>
                        <span className="text-green-600 text-sm font-medium">+12.5%</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">$2.4M</p>
                    <p className="text-sm text-gray-500 mt-1">vs last month</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Active Users</h3>
                        <span className="text-blue-600 text-sm font-medium">+8.2%</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">12,458</p>
                    <p className="text-sm text-gray-500 mt-1">vs last month</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Conversion Rate</h3>
                        <span className="text-purple-600 text-sm font-medium">+3.1%</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">24.8%</p>
                    <p className="text-sm text-gray-500 mt-1">vs last month</p>
                </div>
            </div>
        </div>
    );
}