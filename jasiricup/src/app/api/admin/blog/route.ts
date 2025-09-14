// src/app/api/admin/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";
import { checkAdminAuth } from "@/lib/auth-middleware";

// GET all blog posts (for admin - includes drafts and published)
export async function GET(request: NextRequest) {
  const authCheck = checkAdminAuth(request);
  if (!authCheck.isAuthorized) {
    return authCheck.response;
  }

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
export async function POST(request: NextRequest) {
  const authCheck = checkAdminAuth(request);
  if (!authCheck.isAuthorized) {
    return authCheck.response;
  }

  try {
    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const sanitizedData = {
      ...body,
      title: body.title.trim().substring(0, 200),
      content: body.content.trim(),
      author: body.author?.trim().substring(0, 100) || 'Admin',
      metaDescription: body.metaDescription?.trim().substring(0, 200) || '',
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 10) : [],
      status: ['draft', 'published'].includes(body.status) ? body.status : 'draft',
      featured: Boolean(body.featured)
    };
    
    // Set publishedDate if status is published and no publishedDate exists
    if (sanitizedData.status === 'published' && !sanitizedData.publishedDate) {
      sanitizedData.publishedDate = new Date();
    }
    
    const blog = await BlogPost.create(sanitizedData);
    revalidateTag("blog-posts");
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 });
  }
}