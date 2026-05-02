import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";

export async function GET() {
  try {
    await connectDB();
    const blogs = await BlogPost.find({ status: 'published' })
      .sort({ publishedDate: -1 })
      .select('-blocks');
      
    return NextResponse.json({ success: true, data: blogs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}