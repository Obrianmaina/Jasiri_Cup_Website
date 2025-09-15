// src/app/admin/blog/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { use } from 'react';

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  // Use React.use() to unwrap the params Promise
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blogData, setBlogData] = useState(null);
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

  const handleSave = async (data: any) => {
    if (!id) {
      alert('Blog ID is missing');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(data.status === 'published' ? 'Blog post published successfully!' : 'Blog post updated successfully!');
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update blog post');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md mx-auto">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <p className="text-gray-500 text-sm">Redirecting to blog list...</p>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Blog post not found.</p>
        <button 
          onClick={() => router.push('/admin/blog')}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Back to Blog List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
        <p className="mt-2 text-gray-600">Update your blog post content</p>
      </div>

      <BlogEditor 
        initialData={blogData} 
        onSave={handleSave} 
        saving={saving} 
      />
    </div>
  );
}