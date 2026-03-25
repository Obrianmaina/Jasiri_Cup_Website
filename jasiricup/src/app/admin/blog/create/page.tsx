import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { notFound } from "next/navigation";
import mongoose, { Types } from "mongoose";
import EditBlogClient from "../edit/[id]/EditBlogClient";

// Shape of the raw lean document from MongoDB
interface IBlogLeanDoc {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  author?: string;
  heroImage?: string;
  content: string;
  metaDescription?: string;
  tags?: string[];
  status: 'draft' | 'published';
  publishedDate?: Date | null;
  featured?: boolean;
  viewCount?: number;
  lastModifiedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();
  const blogData = await BlogPost.findById(id).lean<IBlogLeanDoc>();

  if (!blogData) {
    notFound();
  }

  const serializedData = {
    ...blogData,
    _id: blogData._id.toString(),
    createdAt: blogData.createdAt?.toISOString(),
    updatedAt: blogData.updatedAt?.toISOString(),
    publishedDate: blogData.publishedDate?.toISOString() ?? null,
  };

  return (
    <div className="space-y-6 px-8 max-w-5xl mx-auto">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="mt-2 text-gray-500">Update the contents of your existing post.</p>
      </div>
      <EditBlogClient initialData={serializedData} blogId={id} />
    </div>
  );
}