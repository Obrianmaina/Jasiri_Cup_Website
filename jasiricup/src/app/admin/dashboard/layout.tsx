// src/app/admin/dashboard/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard" className="text-xl font-bold text-purple-600">
                JasiriCup Admin
              </Link>
              
              <div className="flex space-x-4">
                <Link 
                  href="/admin/dashboard" 
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/blog" 
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Blog Posts
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                target="_blank"
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                View Site
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}