import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function checkAdminAuth(request: NextRequest) {
  // 1. Check for NextAuth Google Session
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    if (allowedEmails.includes(session.user.email)) {
      return { isAuthorized: true };
    }
  }

  // 2. If no valid session or email is not on the allowed list, return 401
  return {
    isAuthorized: false,
    response: NextResponse.json(
      { success: false, error: 'Authentication required or unauthorized user' },
      { status: 401 }
    )
  };
}