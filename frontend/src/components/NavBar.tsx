'use client';

import { useAuth0 } from '@auth0/auth0-react';
import Link from 'next/link';

export default function NavBar() {
    const { user, isAuthenticated, isLoading, logout, loginWithRedirect } = useAuth0();

    const handleLogout = () => {
        logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    };

    const handleLogin = () => {
        loginWithRedirect({
            appState: { returnTo: '/dashboard' }
        });
    };

    if (isLoading) {
        return (
            <nav className="bg-gray-800 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold">
                        Financial Analytics
                    </Link>
                    <div className="text-sm">Loading...</div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold hover:text-blue-300 transition-colors">
                    Financial Analytics
                </Link>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="text-sm hover:text-blue-300 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="text-sm">
                                    {user?.picture && (
                                        <img
                                            src={user.picture}
                                            alt={user.name || 'User'}
                                            className="w-8 h-8 rounded-full inline-block mr-2"
                                        />
                                    )}
                                    <span className="hidden sm:inline">
                                        {user?.name || user?.email}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors text-sm font-medium"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}