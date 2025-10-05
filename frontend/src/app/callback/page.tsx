'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
    const { isLoading, error, isAuthenticated, user } = useAuth0();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (error) {
            console.error('Auth0 error:', error);
            return;
        }

        if (isAuthenticated) {
            console.log('Authentication successful! Redirecting to dashboard...');
            router.push('/dashboard');
        }
    }, [isLoading, error, isAuthenticated, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Authentication Failed
                    </h2>
                    <p className="text-red-600 mb-6">{error.message}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {isAuthenticated ? 'Success! Redirecting...' : 'Completing sign in...'}
                </h2>
                <p className="text-gray-600">
                    {isAuthenticated ? `Welcome ${user?.name || user?.email}` : 'Please wait'}
                </p>
            </div>
        </div>
    );
}