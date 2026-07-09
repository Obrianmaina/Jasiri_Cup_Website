// src/lib/finance-auth.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { checkAdminAuth } from "@/lib/auth-middleware";

export async function verifyFinanceAccess(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) {
    return { authorized: false, response: authCheck.response! };
  }

  const userEmail = authCheck.session?.user?.email?.toLowerCase();
  if (!userEmail) {
    return { 
      authorized: false, 
      response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) 
    };
  }

  await connectDB();
  const dbUser = await User.findOne({ email: userEmail }).lean() as { role?: string } | null;
  const officialMasterEmail = (process.env.MASTER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL || '').trim().toLowerCase();
  
  const isMaster = dbUser?.role === 'Master' || userEmail === officialMasterEmail;
  const isFinance = dbUser?.role === 'Finance';

  if (!isMaster && !isFinance) {
    return { 
      authorized: false, 
      response: NextResponse.json({ success: false, error: "Access Denied: Finance privileges required." }, { status: 403 }) 
    };
  }

  // We explicitly return the userEmail here so the API routes know exactly who is modifying the ledger
  return { authorized: true, userEmail };
}