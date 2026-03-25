// src/app/admin/blog/BlogListClient.tsx
'use client';

import { useState } from 'react';
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
}

export default function BlogListClient({ initialBlogs }: { initialBlogs: IBlogListItem[] }) {
  const [blogs, setBlogs] = useState<IBlogListItem[]>(initialBlogs);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    setProcessingId(id);
    const loadingToast = toast.loading('Deleting post...');

    try {
      const response = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setBlogs(blogs.filter(blog => blog._id !== id));
        toast.success('Blog post deleted successfully', { id: loadingToast });
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete blog post', { id: loadingToast });
    } finally {
      setProcessingId(null);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (response.ok) {
        setBlogs(blogs.map(blog => blog._id === id ? { ...blog, featured: !currentFeatured } : blog));
        toast.success(currentFeatured ? 'Post removed from featured' : 'Post featured successfully!');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast.error('Failed to update featured status');
    } finally {
      setProcessingId(null);
    }
  };

  // Modern Empty State if no blogs exist
  if (blogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No blog posts yet</h3>
        <p className="text-gray-500 mb-6">Get started by writing your first blog post.</p>
        <Link 
          href="/admin/blog/create" 
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm"
        >
          Write New Post
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Post Details</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {blogs.map((blog) => (
              <tr key={blog._id} className="hover:bg-purple-50/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {blog.title}
                      </span>
                      {blog.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                          Featured
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 font-mono truncate max-w-[250px]">{blog.slug}</span>
                  </div>
                </td>
                
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg ${
                    blog.status === 'published' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                  </span>
                </td>
                
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                  {blog.status === 'published' && blog.publishedDate
                    ? new Date(blog.publishedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                        blog.featured 
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {blog.featured ? '★ Unfeature' : '☆ Feature'}
                    </button>
                    
                    <Link 
                      href={`/admin/blog/edit/${blog._id}`} 
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                    >
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
    </div>
  );
}