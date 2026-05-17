// src/app/api/admin/report-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import ReportLog from '@/lib/models/ReportLog';
import { checkAdminAuth } from '@/lib/auth-middleware';

export async function POST(req: NextRequest) {
  // Ensure only authorized admins can log reports
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const body = await req.json();
    
    // Create the log entry in MongoDB
    const log = await ReportLog.create(body);
    
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    console.error('Failed to create report log:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error: Could not save log' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    // Fetch recent logs, newest first
    const logs = await ReportLog.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('Failed to fetch report logs:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}