// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface BlogStats {
  total: number;
  published: number;
  drafts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<BlogStats>({ total: 0, published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/blog');
        const data = await response.json();
        
        if (data.success) {
          const blogs = data.data;
          setStats({
            total: blogs.length,
            published: blogs.filter((blog: any) => blog.status === 'published').length,
            drafts: blogs.filter((blog: any) => blog.status === 'draft').length,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your JasiriCup website content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.published}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📄</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Drafts</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.drafts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-medium text-gray-900">Blog Posts</h3>
                <p className="text-sm text-gray-500">Create, edit, and manage your blog content</p>
              </div>
              <div className="flex space-x-2">
                <Link href="/admin/blog/create">
                  <Button variant="primary" size="small">
                    New Post
                  </Button>
                </Link>
                <Link href="/admin/blog">
                  <Button variant="secondary" size="small">
                    Manage Posts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}