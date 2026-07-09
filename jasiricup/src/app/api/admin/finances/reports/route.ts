// src/app/api/admin/finances/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import ReportLog from "@/lib/models/ReportLog";
import User from "@/lib/models/User";
import { checkAdminAuth } from "@/lib/auth-middleware";

// *** HELPER FUNCTION: Verify Master or Finance Role ***
async function verifyFinanceAccess(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return { authorized: false, response: authCheck.response! };

  const userEmail = authCheck.session?.user?.email?.toLowerCase();
  if (!userEmail) {
    return { authorized: false, response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }

  await connectDB();
  const dbUser = await User.findOne({ email: userEmail }).lean() as { role?: string } | null;
  const officialMasterEmail = (process.env.MASTER_ADMIN_EMAIL || '').trim().toLowerCase();
  
  const isMaster = dbUser?.role === 'Master' || userEmail === officialMasterEmail;
  const isFinance = dbUser?.role === 'Finance';

  if (!isMaster && !isFinance) {
    return { 
      authorized: false, 
      response: NextResponse.json({ success: false, error: "Access Denied: Finance privileges required." }, { status: 403 }) 
    };
  }

  return { authorized: true, userEmail }; // Returning the email so we can use it when saving the log
}

export async function GET(req: NextRequest) {
  // 1. Run the strict Finance/Master check
  const access = await verifyFinanceAccess(req);
  if (!access.authorized) return access.response;

  try {
    await connectDB();
    const reports = await ReportLog.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: reports });
  } catch (error: unknown) {
    console.error("Failed to fetch report logs:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch historical reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. Run the strict Finance/Master check
  const access = await verifyFinanceAccess(req);
  if (!access.authorized) return access.response;

  try {
    await connectDB();
    const body = await req.json();
    
    // 2. Save the report to the database, explicitly locking the generatedByEmail to the current secure session
    const newReport = await ReportLog.create({
      ...body,
      generatedByEmail: access.userEmail 
    });
    
    return NextResponse.json({ success: true, data: newReport }, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to save report log:", error);
    return NextResponse.json({ success: false, error: "Failed to save report log" }, { status: 500 });
  }
}