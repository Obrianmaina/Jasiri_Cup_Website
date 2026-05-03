// src/app/admin/blog/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor } from "@/components/admin/BlogEditor";
import toast from 'react-hot-toast';
import Link from 'next/link';

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
    <div className="space-y-8 w-1/2 mx-auto px-4 sm:px-6 md:px-16 py-8 transition-colors duration-300">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 transition-colors duration-300">
        <Link href="/admin/blog" className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4 transition-colors">
          &larr; Back to Blog Posts
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Create New Post</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
          Fill in the details below to draft or publish a new blog post.
        </p>
      </div>
      <BlogEditor onSave={handleSave} saving={saving} />
    </div>
  );
}