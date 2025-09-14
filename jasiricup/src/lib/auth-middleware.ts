// src/lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function withAdminAuth(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context: any) => {
    try {
      // Check for admin token in cookies
      const token = request.cookies.get('admin-token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token matches environment variable
      if (token !== process.env.ADMIN_SECRET_TOKEN) {
        return NextResponse.json(
          { success: false, error: 'Invalid authentication credentials' },
          { status: 401 }
        );
      }

      // Token is valid, proceed with the original handler
      return handler(request, context);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

// Alternative: Check admin auth and return boolean + response
export function checkAdminAuth(request: NextRequest): { isAuthorized: boolean; response?: NextResponse } {
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    };
  }

  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { success: false, error: 'Invalid authentication credentials' },
        { status: 401 }
      )
    };
  }

  return { isAuthorized: true };
}