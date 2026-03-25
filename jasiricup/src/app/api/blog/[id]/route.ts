import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";
import mongoose from 'mongoose';
import { checkAdminAuth } from "@/lib/auth-middleware";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response;

  try {
    await connectDB();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid blog post ID" }, { status: 400 });
    }
    
    const blog = await BlogPost.findById(id);
    if (!blog) return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blog post" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response;

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid blog post ID" }, { status: 400 });
    }

    const body = await req.json();
    const blog = await BlogPost.findByIdAndUpdate(id, body, { new: true });
    
    if (!blog) return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    
    revalidateTag("blog-posts");
    revalidateTag(`blog-post-${blog.slug}`);
    
    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json({ success: false, error: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response;

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid blog post ID" }, { status: 400 });
    }

    const blog = await BlogPost.findByIdAndDelete(id);
    
    if (!blog) return NextResponse.json({ success: false, error: "Blog post not found" }, { status: 404 });
    
    revalidateTag("blog-posts");
    revalidateTag(`blog-post-${blog.slug}`);
    
    return NextResponse.json({ success: true, message: "Blog deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ success: false, error: "Failed to delete blog" }, { status: 500 });
  }
}