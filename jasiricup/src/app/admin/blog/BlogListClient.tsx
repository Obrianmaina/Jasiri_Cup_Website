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

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Published</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Views</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog._id} className="hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    {blog.title}
                    {blog.featured && (
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{blog.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {blog.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {blog.status === 'published' && blog.publishedDate
                    ? new Date(blog.publishedDate).toLocaleDateString()
                    : 'Not Published'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                  {blog.viewCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link href={`/admin/blog/edit/${blog._id}`} className="text-purple-600 hover:text-purple-900 transition-colors">
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleFeatured(blog._id, blog.featured)}
                    disabled={processingId === blog._id}
                    className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50"
                  >
                    {blog.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id, blog.title)}
                    disabled={processingId === blog._id}
                    className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}