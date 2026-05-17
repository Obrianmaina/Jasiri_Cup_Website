import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import ContactMessage from "@/lib/models/ContactMessage";
import { checkAdminAuth } from "@/lib/auth-middleware";

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { status } = await req.json();
    
    const message = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("Failed to update message:", error);
    return NextResponse.json({ success: false, error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const deletedMessage = await ContactMessage.findByIdAndDelete(id);
    
    if (!deletedMessage) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json({ success: false, error: "Failed to delete message" }, { status: 500 });
  }
}