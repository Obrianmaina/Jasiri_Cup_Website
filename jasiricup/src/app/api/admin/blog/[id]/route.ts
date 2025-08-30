import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";

/**
 * GET a single blog post by its slug (for admin viewing, without incrementing views).
 */
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // Await params to ensure it is resolved before using its properties
    const { id } = await params;
    
    // Find the blog post by its slug
    const blog = await BlogPost.findOne({ slug: id });
    
    if (!blog) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog post for admin:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blog post" }, { status: 500 });
  }
}

/**
 * UPDATE a blog post by its ID.
 */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    // Await params to ensure it is resolved before use
    const { id } = await params;

    const body = await req.json();
    
    // Use findOneAndUpdate to find by _id and update the post atomically
    const blog = await BlogPost.findOneAndUpdate({ _id: id }, body, { new: true });
    
    if (!blog) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
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
 * DELETE a blog post by its ID.
 */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    // Await params to ensure it is resolved before use
    const { id } = await params;

    // Find and delete the blog post by its _id atomically
    const blog = await BlogPost.findOneAndDelete({ _id: id });
    
    if (!blog) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    
    revalidateTag("blog-posts");
    revalidateTag(`blog-post-${blog.slug}`);
    
    return NextResponse.json({ success: true, message: "Blog deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ success: false, error: "Failed to delete blog" }, { status: 500 });
  }
}
