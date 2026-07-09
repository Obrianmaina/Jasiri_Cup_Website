// src/app/api/admin/finances/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Transaction from "@/lib/models/Transaction";
import { verifyFinanceAccess } from "@/lib/finance-auth";

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params for Next.js 15 compatibility
  const { id } = await params;

  // 1. Strict Security Check
  const access = await verifyFinanceAccess(req);
  if (!access.authorized || !access.userEmail) return access.response!;

  try {
    const body = await req.json();
    
    if (body.action !== 'void') {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    if (!body.voidReason || !body.voidReason.trim()) {
      return NextResponse.json({ success: false, error: "A reason for voiding is required" }, { status: 400 });
    }

    await connectDB();
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status === 'voided') {
      return NextResponse.json({ success: false, error: "Transaction is already voided" }, { status: 400 });
    }

    // 2. Apply Soft Delete (Append-Only Immutable Logging)
    transaction.status = 'voided';
    transaction.voidReason = body.voidReason.trim();
    transaction.voidedBy = access.userEmail;

    await transaction.save();

    return NextResponse.json({ success: true, message: "Transaction voided successfully" });
  } catch (error: unknown) {
    console.error("Failed to void transaction:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}