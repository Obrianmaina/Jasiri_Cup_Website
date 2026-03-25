'use client';

import { useState } from 'react';
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

interface IInitialData extends IBlogFormData {
  _id: string;
  publishedDate?: string | Date | null;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditBlogClient({ initialData, blogId }: { initialData: IInitialData, blogId: string }) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (data: IBlogFormData) => {
    setSaving(true);
    const loadingToast = toast.loading('Updating post...');

    try {
      const response = await fetch(`/api/admin/blog/${blogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(data.status === 'published' ? 'Post published!' : 'Post updated!', { id: loadingToast });
        router.push('/admin/blog');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update blog post';
      toast.error(message, { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return <BlogEditor initialData={initialData} onSave={handleSave} saving={saving} />;
}