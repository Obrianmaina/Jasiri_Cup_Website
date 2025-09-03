// src/app/api/admin/blog/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";

// GET all blog posts (for admin - includes drafts and published)
export async function GET() {
  try {
    await connectDB();
    // Return ALL blog posts for admin (both draft and published)
    const blogs = await BlogPost.find({})
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .select('-blocks'); // Exclude blocks field for performance
    
    return NextResponse.json({ success: true, data: blogs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs for admin:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}

// CREATE new blog post
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Set publishedDate if status is published and no publishedDate exists
    if (body.status === 'published' && !body.publishedDate) {
      body.publishedDate = new Date();
    }
    
    const blog = await BlogPost.create(body);
    revalidateTag("blog-posts");
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 });
  }
}