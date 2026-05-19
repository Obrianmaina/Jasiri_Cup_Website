// src/app/api/admin/faqs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import FAQ from "@/lib/models/FAQ";
import { revalidateTag } from "next/cache";
import mongoose from "mongoose";
import { checkAdminAuth } from "@/lib/auth-middleware";

/**
 * GET a single FAQ by its _id (for editing or detailed view in admin dashboard).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid FAQ ID" }, { status: 400 });
    }
    
    const faq = await FAQ.findById(id);
    if (!faq) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: faq }, { status: 200 });
  } catch (error) {
    console.error("Error fetching FAQ for admin:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch FAQ" }, { status: 500 });
  }
}

/**
 * UPDATE an FAQ by its _id.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid FAQ ID" }, { status: 400 });
    }

    const body = await req.json();
    
    const faq = await FAQ.findByIdAndUpdate(id, body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!faq) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }
    
    // Purges cache on the public site so updates are instant
    revalidateTag("faqs");
    
    return NextResponse.json({ success: true, data: faq }, { status: 200 });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json({ success: false, error: "Failed to update FAQ" }, { status: 500 });
  }
}

/**
 * DELETE an FAQ by its _id.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid FAQ ID" }, { status: 400 });
    }

    const faq = await FAQ.findByIdAndDelete(id);
    
    if (!faq) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }
    
    // Purges cache on public site to immediately drop the deleted item
    revalidateTag("faqs");
    
    return NextResponse.json({ success: true, message: "FAQ deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json({ success: false, error: "Failed to delete FAQ" }, { status: 500 });
  }
}