// src/app/admin/blog/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor } from '@/components/admin/BlogEditor';

export default function CreateBlogPage() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(data.status === 'published' ? 'Blog post published successfully!' : 'Blog post saved as draft!');
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 px-16">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
        <p className="mt-2 text-gray-600">Write and publish a new blog post</p>
      </div>

      <BlogEditor onSave={handleSave} saving={saving} />
    </div>
  );
}