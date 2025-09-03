// src/app/api/blog/slug/[slug]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";

/**
 * GET a single published blog post by its slug (for public viewing)
 */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    
    const { slug } = params;
    console.log('API: Fetching blog post with slug:', slug);
    
    // Find the blog post by its slug and ensure it's published
    const blog = await BlogPost.findOne({ 
      slug: slug,
      status: 'published' // Only return published posts to public
    });
    
    if (!blog) {
      console.log('API: Blog post not found or not published:', slug);
      return NextResponse.json({ 
        success: false, 
        error: "Blog post not found" 
      }, { status: 404 });
    }

    console.log('API: Found blog post:', blog.title);

    // Optionally increment view count
    try {
      await BlogPost.findByIdAndUpdate(blog._id, { 
        $inc: { viewCount: 1 } 
      });
      console.log('API: Incremented view count for:', blog.title);
    } catch (viewError) {
      console.warn('API: Failed to increment view count:', viewError);
      // Don't fail the request if view count update fails
    }

    return NextResponse.json({ 
      success: true, 
      data: blog 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error("API: Error fetching blog post by slug:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch blog post" 
    }, { status: 500 });
  }
}