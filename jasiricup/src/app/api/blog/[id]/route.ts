import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";

/**
 * GET a single blog post by its slug.
 *
 * This handler now queries by the 'slug' field instead of the MongoDB '_id'
 * to match the URL structure used in your front-end components.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    // Find the blog post by its slug, which is passed as `params.id`
    const blog = await BlogPost.findOne({ slug: params.id });
    if (!blog) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: blog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blog" }, { status: 500 });
  }
}

/**
 * UPDATE a blog post by its slug.
 *
 * This handler also queries by the 'slug' field and revalidates both the
 * general blog list tag and the specific blog post's tag.
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    // Use findOneAndUpdate to find by _id and update the post
    const blog = await BlogPost.findOneAndUpdate({ _id: params.id }, body, { new: true });
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
 * DELETE a blog post by its slug.
 *
 * This handler queries by the 'slug' field and revalidates the necessary tags.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    // Find and delete the blog post by its _id
    const blog = await BlogPost.findOneAndDelete({ _id: params.id });
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