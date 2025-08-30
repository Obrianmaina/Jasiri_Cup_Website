// src/app/api/blog/route.ts - Updated to only show published posts
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";

// GET all published blog posts (for public consumption)
export async function GET() {
  try {
    await connectDB();
    // Only return published blog posts for the public
    const blogs = await BlogPost.find({ status: 'published' })
      .sort({ publishedDate: -1 })
      .select('-blocks'); // Exclude blocks field for performance
    
    return NextResponse.json({ success: true, data: blogs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}

// CREATE new blog post (keep existing functionality)
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const blog = await BlogPost.create(body);
    revalidateTag("blog-posts");
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 });
  }
}