// src/app/api/blog/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";

// GET all published blog posts (for public blog page and home page)
export async function GET() {
  try {
    await connectDB();
    
    // Return all published posts for public consumption
    const blogs = await BlogPost.find({ 
      status: 'published' 
    })
    .sort({ publishedDate: -1 }) // Sort by publishedDate, newest first
    .select('-blocks'); // Exclude blocks field for performance
    
    console.log(`API: Found ${blogs.length} published blog posts`);
    
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
    }, { 
      status: 500 
    });
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
    
    return NextResponse.json({ 
      success: true, 
      data: blog 
    }, { 
      status: 201 
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create blog" 
    }, { 
      status: 500 
    });
  }
}