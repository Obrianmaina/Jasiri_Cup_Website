// src/app/admin/blog/page.tsx
import Link from 'next/link';
import { Types } from 'mongoose';
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import BlogListClient from "./BlogListClient";

// Ensure dynamic rendering to always show fresh data in admin panel
export const dynamic = 'force-dynamic';

// Shape of the raw lean document from MongoDB
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

  const blogs = await BlogPost.find({})
    .sort({ createdAt: -1 })
    .select('-blocks')
    .lean<IBlogLeanDoc[]>();

  // Convert MongoDB ObjectIds and Dates to strings for client components
  const serializedBlogs = blogs.map(blog => ({
    ...blog,
    _id: blog._id.toString(),
    createdAt: blog.createdAt?.toISOString(),
    updatedAt: blog.updatedAt?.toISOString(),
    publishedDate: blog.publishedDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-8 w-full">
      {/* Modern Header */}
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

      {/* Renders the list or the empty state we built earlier */}
      <BlogListClient initialBlogs={serializedBlogs} />
    </div>
  );
}