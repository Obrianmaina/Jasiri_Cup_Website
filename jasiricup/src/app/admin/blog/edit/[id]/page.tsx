// src/app/admin/blog/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor } from '@/components/admin/BlogEditor';

interface EditBlogPageProps {
  params: {
    id: string;
  };
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blogData, setBlogData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/admin/blog/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setBlogData(data.data);
        } else {
          alert('Blog post not found');
          router.push('/admin/blog');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        alert('Failed to load blog post');
        router.push('/admin/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params.id, router]);

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/blog/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Blog post not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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