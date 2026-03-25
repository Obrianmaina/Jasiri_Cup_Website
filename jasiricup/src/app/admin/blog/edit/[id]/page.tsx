// src/app/admin/blog/edit/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor } from '@/components/admin/BlogEditor';
import toast from 'react-hot-toast';

interface IBlogFormData {
  title: string;
  slug?: string;
  author?: string;
  heroImage?: string;
  content: string;
  blocks?: unknown[];
  metaDescription?: string;
  tags?: string[];
  status: 'draft' | 'published';
  featured?: boolean;
}

interface IBlogData extends IBlogFormData {
  _id: string;
  publishedDate?: string | Date | null;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blogData, setBlogData] = useState<IBlogData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/blog/${id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setBlogData(data.data);
        } else {
          setError(data.error || 'Blog post not found');
          setTimeout(() => {
            router.push('/admin/blog');
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog post');
        setTimeout(() => {
          router.push('/admin/blog');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  const handleSave = async (data: IBlogFormData) => {
    if (!id) {
      toast.error('Blog ID is missing');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading('Updating post...');
    
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(data.status === 'published' ? 'Post published successfully!' : 'Post updated successfully!', { id: loadingToast });
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update post', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update post', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  // Modern Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading post data...</p>
      </div>
    );
  }

  // Modern Error State
  if (error || !blogData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-500 mb-6">{error || 'Blog post not found.'}</p>
        <button
          onClick={() => router.push('/admin/blog')}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          Return to Blog List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Blog Post</h1>
        <p className="mt-2 text-sm text-gray-500">Update your blog post content and settings.</p>
      </div>

      <BlogEditor
        initialData={blogData}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}