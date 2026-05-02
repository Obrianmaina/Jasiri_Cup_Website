// src/app/admin/blog/page.tsx
import Link from 'next/link';
import { Types } from 'mongoose';
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import BlogListClient from "./BlogListClient";

export const dynamic = 'force-dynamic';

interface IBlogLeanDoc {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  publishedDate?: Date | null;
  featured: boolean;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function AdminBlogPage() {
  await connectDB();

  // Only fetch the first page of 20 for SSR; client handles pagination/search after that
  const blogs = await BlogPost.find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-blocks')
    .lean<IBlogLeanDoc[]>();

  const serializedBlogs = blogs.map(blog => ({
    ...blog,
    _id: blog._id.toString(),
    createdAt:     blog.createdAt?.toISOString(),
    updatedAt:     blog.updatedAt?.toISOString(),
    publishedDate: blog.publishedDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-8 w-6xl mx-auto px-4 sm:px-6 md:px-16 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Blog Posts</h1>
          <p className="mt-2 text-sm text-gray-500">Manage your blog content and publications.</p>
        </div>
        <Link
          href="/admin/blog/create"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          + Create New Post
        </Link>
      </div>

      <BlogListClient initialBlogs={serializedBlogs} />
    </div>
  );
}