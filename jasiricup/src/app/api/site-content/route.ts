import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import SiteContent from "@/lib/models/SiteContent";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { revalidateTag } from "next/cache";

export async function PUT(request: NextRequest) {
  const authCheck = await checkAdminAuth(request);

  if (!authCheck || !authCheck.isAuthorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

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

    try {
      revalidateTag(`site-content-${page}`);
    } catch (err) {
      console.warn("Revalidation failed:", err);
    }

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    console.error("Error updating site content:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}