// src/app/api/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";

// GET all published blog posts (for public blog page and home page)
export async function GET() {
  try {
    await connectDB();
    
    const blogs = await BlogPost.find({ 
      status: 'published' 
    })
    .sort({ publishedDate: -1 })
    .select('-blocks');
    
    return NextResponse.json({ 
      success: true, 
      data: blogs 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch blogs" 
    }, { status: 500 });
  }
}

// Disable public POST - all blog creation goes through /api/admin/blog
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}