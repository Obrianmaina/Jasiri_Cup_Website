// src/app/admin/blog/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor } from "@/components/admin/BlogEditor";
import toast from 'react-hot-toast';

// Define the expected shape of the data coming from BlogEditor
interface BlogPostData {
  _id?: string;
  title: string;
  slug: string;
  author: string;
  heroImage: string;
  content: string;
  metaDescription: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
}

export default function CreateBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: BlogPostData) => {
    setSaving(true);
    const loadingToast = toast.loading('Saving post...');

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      toast.success('Post created successfully!', { id: loadingToast });
      router.push('/admin/blog'); 
      router.refresh();
    } catch (error) {
      toast.error('Failed to create post', { id: loadingToast });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Post</h1>
        <p className="mt-2 text-sm text-gray-500">
          Fill in the details below to draft or publish a new blog post.
        </p>
      </div>
      <BlogEditor onSave={handleSave} saving={saving} />
    </div>
  );
}