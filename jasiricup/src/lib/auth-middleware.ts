// src/lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function checkAdminAuth(request: NextRequest) {
  // SECURITY FIX: CSRF Protection fail-closed logic
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    const cleanBase = (baseUrl || '').trim().replace(/\/$/, '');
    const cleanOrigin = (origin || '').trim().replace(/\/$/, '');
    
    if (!cleanOrigin || cleanOrigin !== cleanBase) {
      console.error(`CSRF Failure: Origin (${cleanOrigin}) does not match Base URL (${cleanBase})`);
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
      return { isAuthorized: true, session };
    }
  } catch (error) {
    console.error("Session verification failed:", error);
  }

  return {
    isAuthorized: false,
    response: NextResponse.json(
      { success: false, error: 'Authentication required or unauthorized user' },
      { status: 401 }
    )
  };
}