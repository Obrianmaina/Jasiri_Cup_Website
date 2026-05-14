import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function checkAdminAuth(request: NextRequest) {
  // 1. CSRF Protection for Mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    // If an origin is present, it MUST match your base URL
    if (origin && baseUrl && !origin.startsWith(baseUrl)) {
      return {
        isAuthorized: false,
        response: NextResponse.json(
          { success: false, error: 'CSRF validation failed' },
          { status: 403 }
        )
      };
    }
  }

  // 2. Robust Session Check
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const allowedEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
      
      if (allowedEmails.includes(session.user.email)) {
        return { isAuthorized: true, session };
      }
    }
  } catch (error) {
    console.error("Session verification failed:", error);
  }

  // 3. Fallback rejection
  return {
    isAuthorized: false,
    response: NextResponse.json(
      { success: false, error: 'Authentication required or unauthorized user' },
      { status: 401 }
    )
  };
}