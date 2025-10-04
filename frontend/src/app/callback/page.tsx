'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CallbackPage() {
    const { isLoading, error, isAuthenticated, user } = useAuth0();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Log URL parameters
        const urlParams = {
            error: searchParams.get('error'),
            error_description: searchParams.get('error_description'),
            code: searchParams.get('code'),
            state: searchParams.get('state'),
        };

        console.log('Callback URL params:', urlParams);
        console.log('Auth0 state:', {
            isLoading,
            isAuthenticated,
            hasError: !!error,
            errorMessage: error?.message,
            user: user?.email,
        });

        // Check for URL errors first
        if (urlParams.error) {
            console.error('URL Error:', urlParams.error_description);
            return;
        }

        // Wait for Auth0 to finish processing
        if (isLoading) {
            console.log('Auth0 still loading...');
            return;
        }

        // Handle Auth0 SDK errors
        if (error) {
            console.error('Auth0 SDK Error:', error);
            return;
        }

        // Success - redirect to dashboard
        if (isAuthenticated && user) {
            console.log('Authentication successful! Redirecting...');
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);
        }
    }, [mounted, isLoading, error, isAuthenticated, user, router, searchParams]);

    // Show URL error
    const urlError = searchParams.get('error');
    const urlErrorDescription = searchParams.get('error_description');

    if (urlError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
                <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Authentication Failed
                        </h2>
                        <p className="text-red-600 mb-4">
                            {urlError}: {urlErrorDescription || 'Unknown error'}
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Configuration Checklist:</h3>
                        <ul className="text-sm text-yellow-800 space-y-2">
                            <li>✓ Application Type: <strong>Single Page Application</strong></li>
                            <li>✓ Allowed Callback URLs: <code className="bg-yellow-100 px-1">http://localhost:3000/callback</code></li>
                            <li>✓ Grant Types: <strong>Authorization Code + Implicit</strong> enabled</li>
                            <li>✓ Environment variables are correct (no typos)</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                localStorage.clear();
                                router.push('/login');
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                        >
                            Clear Cache & Try Again
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show Auth0 SDK error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
                <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Authentication Error
                        </h2>
                        <p className="text-red-600 mb-4">{error.message}</p>
                    </div>

                    <div className="bg-gray-50 rounded p-4 mb-6">
                        <h3 className="font-semibold mb-2">Debug Info:</h3>
                        <pre className="text-xs overflow-auto bg-gray-100 p-3 rounded">
{JSON.stringify({
    error: error.message,
    name: error.name,
    timestamp: new Date().toISOString()
}, null, 2)}
                        </pre>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.clear();
                            router.push('/login');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                    >
                        Clear Cache & Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
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