'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {useAuth0} from "@auth0/auth0-react";
import Link from 'next/link';

export default function Home() {
    const { isAuthenticated, isLoading } = useAuth0();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Will redirect to dashboard
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6 shadow-lg">
                    <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>

                {/* Heading */}
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                    Cutting-Edge Financial
                    <span className="block text-blue-600">Analytics Tool</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Transform your financial data into actionable insights with
                    advanced analytics and real-time reporting.
                </p>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Real-Time Data</h3>
                        <p className="text-sm text-gray-600">
                            Access live financial metrics and analytics
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Secure & Compliant</h3>
                        <p className="text-sm text-gray-600">
                            Enterprise-grade security and compliance
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-6 h-6 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Smart Insights</h3>
                        <p className="text-sm text-gray-600">
                            AI-powered analytics and forecasting
                        </p>
                    </div>
                </div>

                {/* CTA Button */}
                <Link
                    href="/login"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    Get Started
                    <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                    </svg>
                </Link>

                {/* Footer Note */}
                <p className="text-sm text-gray-500 mt-8">
                    Trusted by leading financial institutions worldwide
                </p>
            </div>
        </div>
    );
}