import Link from 'next/link';
import { Types } from 'mongoose';
import { Button } from '@/components/ui/Button';
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
    <div className="px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-2 text-gray-600">Manage your blog content and publications.</p>
        </div>
        <Link href="/admin/blog/create" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all">
            + Create New Post
          </Button>
        </Link>
      </div>

      {serializedBlogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg mb-4">You haven&apos;t published any blog posts yet.</p>
          <Link href="/admin/blog/create">
            <Button variant="primary">Write Your First Post</Button>
          </Link>
        </div>
      ) : (
        <BlogListClient initialBlogs={serializedBlogs} />
      )}
    </div>
  );
}