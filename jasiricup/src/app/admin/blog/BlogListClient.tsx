// src/app/admin/blog/BlogListClient.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface IBlogListItem {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedDate?: string | Date | null;
  featured: boolean;
  viewCount: number;
  createdAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BlogListClient({ initialBlogs }: { initialBlogs: IBlogListItem[] }) {
  const [blogs, setBlogs] = useState<IBlogListItem[]>(initialBlogs);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Core filter states that drive the database fetch
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // UI state for the search bar (allows typing without immediate fetching)
  const [searchInput, setSearchInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isFirstRender = useRef(true);

  // Fetch function relies purely on current state
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        search: search,
        status: statusFilter,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });

      // Added cache prevention to guarantee fresh data
      const res = await fetch(`/api/admin/blog?${params}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBlogs(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  // Single source of truth for triggering data fetches
  useEffect(() => {
    if (isFirstRender.current) { 
      isFirstRender.current = false; 
      return; 
    }
    fetchBlogs();
  }, [fetchBlogs]);

  // UI Handlers
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setProcessingId(id);
    const tid = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.filter(b => b._id !== id));
      toast.success('Deleted', { id: tid });
    } catch {
      toast.error('Delete failed', { id: tid });
    } finally {
      setProcessingId(null);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !current }),
      });
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.map(b => b._id === id ? { ...b, featured: !current } : b));
      toast.success(current ? 'Removed from featured' : 'Featured!');
    } catch {
      toast.error('Update failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (blogs.length === 0 && !search && !statusFilter) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No blog posts yet</h3>
        <p className="text-gray-500 mb-6">Get started by writing your first blog post.</p>
        <Link href="/admin/blog/create" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm">
          Write New Post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title, author, tag..."
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        )}
        
        {!loading && blogs.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No posts match your filters.</div>
        )}
        
        {!loading && blogs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  {['Post Details', 'Status', 'Date', 'Views', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {blogs.map(blog => (
                  <tr key={blog._id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{blog.title}</span>
                          {blog.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">Featured</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 font-mono truncate max-w-[250px]">{blog.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg ${blog.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {blog.status === 'published' && blog.publishedDate
                        ? new Date(blog.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Not Published'}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">👁️</span>
                        <span className="font-medium">{blog.viewCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFeatured(blog._id, blog.featured)}
                          disabled={processingId === blog._id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${blog.featured ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                          {blog.featured ? '⭐ Unfeature' : '⭐ Feature'}
                        </button>
                        <Link href={`/admin/blog/edit/${blog._id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id, blog.title)}
                          disabled={processingId === blog._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{pagination.total} post{pagination.total !== 1 ? 's' : ''} total</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={!pagination.hasPrev || loading}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 font-medium text-gray-700">{page} / {pagination.totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!pagination.hasNext || loading}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}