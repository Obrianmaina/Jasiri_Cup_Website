// src/app/api/admin/site-content/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import SiteContent from "@/lib/models/SiteContent";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  const authCheck = checkAdminAuth(request);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    const query = page ? { page } : {};
    const content = await SiteContent.find(query).sort({ page: 1, section: 1 });
    
    return NextResponse.json({ success: true, data: content }, { status: 200 });
  } catch (error) {
    console.error("Error fetching site content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = checkAdminAuth(request);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const body = await request.json();
    const { page, section, content } = body;

    if (!page || !section || !content) {
      return NextResponse.json(
        { success: false, error: "page, section, and content are required" },
        { status: 400 }
      );
    }

    const updated = await SiteContent.findOneAndUpdate(
      { page, section },
      { content },
      { new: true, upsert: true }
    );

    revalidateTag(`site-content-${page}`);
    
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating site content:", error);
    return NextResponse.json({ success: false, error: "Failed to update content" }, { status: 500 });
  }
}