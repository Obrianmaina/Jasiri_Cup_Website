// src/app/api/admin/blog/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";
import mongoose from 'mongoose';

/**
 * GET a single blog post by its _id (for admin viewing, without incrementing views).
 */
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // Await params to ensure it is resolved before using its properties
    const { id } = await params;
    
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid blog post ID" }, { status: 400 });
    }
    
    // Find the blog post by its _id (not slug) for admin routes
    const blog = await BlogPost.findById(id);
    
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog post for admin:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blog post" }, { status: 500 });
  }
}

/**
 * UPDATE a blog post by its _id.
 */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    // Await params to ensure it is resolved before use
    const { id } = await params;

    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid blog post ID" }, { status: 400 });
    }

    const body = await req.json();
    
    // Use findByIdAndUpdate to find by _id and update the post atomically
    const blog = await BlogPost.findByIdAndUpdate(id, body, { new: true });
    
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }
    
    revalidateTag("blog-posts");
    revalidateTag(`blog-post-${blog.slug}`);
    
    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json({ success: false, error: "Failed to update blog" }, { status: 500 });
  }
}

/**
 * DELETE a blog post by its _id.
 */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    // Await params to ensure it is resolved before use
    const { id } = await params;

    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid blog post ID" }, { status: 400 });
    }

    // Find and delete the blog post by its _id atomically
    const blog = await BlogPost.findByIdAndDelete(id);
    
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    }
    
    revalidateTag("blog-posts");
    revalidateTag(`blog-post-${blog.slug}`);
    
    return NextResponse.json({ success: true, message: "Blog deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ success: false, error: "Failed to delete blog" }, { status: 500 });
  }
}