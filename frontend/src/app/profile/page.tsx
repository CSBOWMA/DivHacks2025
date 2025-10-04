'use client';

import { useEffect, useState } from 'react';

interface User {
  sub: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  [key: string]: any;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by looking at localStorage
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('access_token');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/';
    }

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to your profile!
          </h2>

          {user.picture && (
            <img
              src={user.picture}
              alt="Profile"
              className="w-20 h-20 rounded-full mx-auto mb-4"
            />
          )}

          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Name:</span>
              <span className="text-gray-900">{user.name || user.nickname || 'N/A'}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Email:</span>
              <span className="text-gray-900">{user.email || 'N/A'}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600">User ID:</span>
              <span className="text-gray-900 text-sm">{user.sub}</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
