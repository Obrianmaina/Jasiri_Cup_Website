// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes (excluding login)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Check if user has admin token in cookies
    const adminToken = request.cookies.get('admin-token')?.value;
    
    if (!adminToken || adminToken !== process.env.ADMIN_SECRET_TOKEN) {
      console.log(`Admin access denied for path: ${request.nextUrl.pathname}`);
      console.log(`Token present: ${!!adminToken}`);
      console.log(`Token valid: ${adminToken === process.env.ADMIN_SECRET_TOKEN}`);
      
      // Redirect to login if no valid token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    console.log(`Admin access granted for path: ${request.nextUrl.pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};