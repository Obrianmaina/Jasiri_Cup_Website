// src/app/admin/blog/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  author: string;
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  viewCount: number;
}

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/admin/blog');
      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog._id !== id));
      } else {
        alert('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog post');
    } finally {
      setDeleting(null);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (response.ok) {
        setBlogs(blogs.map(blog => 
          blog._id === id ? { ...blog, featured: !currentFeatured } : blog
        ));
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="px-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Manage your blog content</p>
        </div>
        <Link href="/admin/blog/create" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            Create New Post
          </Button>
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-base sm:text-lg">No blog posts found.</p>
          <Link href="/admin/blog/create" className="inline-block mt-4">
            <Button variant="primary">
              Create Your First Post
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card View - Visible on small screens */}
          <div className="block lg:hidden space-y-4">
            {blogs.map((blog) => (
              <div key={blog._id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">{blog.slug}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {blog.status}
                    </span>
                    {blog.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Author:</span><br />
                    {blog.author || 'Anonymous'}
                  </div>
                  <div>
                    <span className="font-medium">Views:</span><br />
                    {blog.viewCount || 0}
                  </div>
                  <div>
                    <span className="font-medium">Published:</span><br />
                    {blog.status === 'published' && blog.publishedDate
                      ? new Date(blog.publishedDate).toLocaleDateString()
                      : 'Not published'}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span><br />
                    {new Date(blog.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/blog/edit/${blog._id}`}
                    className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleFeatured(blog._id, blog.featured)}
                    className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {blog.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  {blog.status === 'published' && (
                    <Link
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(blog._id, blog.title)}
                    disabled={deleting === blog._id}
                    className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 disabled:opacity-50 transition-colors"
                  >
                    {deleting === blog._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View - Hidden on small screens */}
          <div className="hidden lg:block bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {blog.title}
                              {blog.featured && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{blog.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            blog.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {blog.author || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {blog.status === 'published' && blog.publishedDate
                          ? new Date(blog.publishedDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {blog.viewCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/blog/edit/${blog._id}`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleFeatured(blog._id, blog.featured)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {blog.featured ? 'Unfeature' : 'Feature'}
                        </button>
                        {blog.status === 'published' && (
                          <Link
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="text-green-600 hover:text-green-900"
                          >
                            View
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(blog._id, blog.title)}
                          disabled={deleting === blog._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleting === blog._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}