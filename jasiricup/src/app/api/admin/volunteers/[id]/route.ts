// src/app/api/admin/volunteers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Volunteer from "@/lib/models/Volunteer";
import { checkAdminAuth } from "@/lib/auth-middleware";

// Flexible type to handle Next.js 14 (sync) and Next.js 15 (async) params
type ParamsContext = { params: Promise<{ id: string }> | { id: string } };

export async function PUT(req: NextRequest, context: ParamsContext) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const { status } = await req.json();
    
    const application = await Volunteer.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error("Failed to update volunteer status:", error);
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: ParamsContext) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    
    const deletedApplication = await Volunteer.findByIdAndDelete(id);
    
    if (!deletedApplication) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete volunteer application:", error);
    return NextResponse.json({ success: false, error: "Failed to delete application" }, { status: 500 });
  }
}