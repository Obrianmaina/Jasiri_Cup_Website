// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import { checkAdminAuth } from "@/lib/auth-middleware";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const { id } = await params;
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}