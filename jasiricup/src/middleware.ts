// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Check if user has admin token in cookies
    const adminToken = request.cookies.get('admin-token')?.value;
    
    if (!adminToken || adminToken !== process.env.ADMIN_SECRET_TOKEN) {
      // Redirect to login if no valid token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};