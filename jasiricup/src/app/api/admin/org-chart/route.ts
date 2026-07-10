// src/app/api/admin/org-chart/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import OrgNode from "@/lib/models/OrgChart";
import { checkAdminAuth } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const nodes = await OrgNode.find({}).lean();
    return NextResponse.json({ success: true, data: nodes });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch org chart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  // FIXED: Strict typing for the session check
  const isMaster = (authCheck.session?.user as { role?: string })?.role === 'Master';
  
  if (!isMaster) {
    return NextResponse.json({ success: false, error: "Only Master Admins can edit" }, { status: 403 });
  }

  try {
    await connectDB();
    const { nodes } = await req.json(); 
    
    // Wipe and replace strategy for simple tree updates
    await OrgNode.deleteMany({});
    await OrgNode.insertMany(nodes);

    return NextResponse.json({ success: true, message: "Org Chart updated" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update org chart" }, { status: 500 });
  }
}