import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function checkAdminAuth(request: NextRequest) {
  // 1. Check for NextAuth Google Session (New way)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (allowedEmails.includes(session.user.email)) {
      return { isAuthorized: true };
    }
  }

  // 2. Fallback: Check for legacy Admin Token (Old way)
  const token = request.cookies.get('admin-token')?.value;
  if (token && token === process.env.ADMIN_SECRET_TOKEN) {
    return { isAuthorized: true };
  }

  // 3. If both fail, return 401 Unauthorized
  return {
    isAuthorized: false,
    response: NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  };
}