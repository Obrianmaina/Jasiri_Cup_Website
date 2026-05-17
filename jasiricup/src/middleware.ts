import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";

// 1. Initialize NextAuth middleware
const authMiddleware = withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

// 2. Add NextFetchEvent to your middleware signature
export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Generate a random nonce for this specific request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Build a strict CSP that uses the nonce
  // ADDED: media-src directive to whitelist Cloudinary videos
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: blob: https://res.cloudinary.com;
    media-src 'self' https://res.cloudinary.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Attach nonce and CSP to the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // Determine if this route needs Admin Authentication
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') || pathname.startsWith('/api/admin');

  let response: NextResponse | undefined;

  if (isAdminRoute) {
    // RUN NEXTAUTH PROTECTION PROPERLY TYPED
    const authResult = await authMiddleware(request as NextRequestWithAuth, event);
    
    // If auth is successful, it returns nothing/undefined, so we create a new response
    if (!authResult) {
      response = NextResponse.next({ request: { headers: requestHeaders } });
    } else {
      // If auth fails and it redirects, we still want to attach our headers
      response = authResult as NextResponse;
      response.headers.set('x-nonce', nonce);
      response.headers.set('Content-Security-Policy', cspHeader);
    }
  } else {
    // Normal public route
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Set the CSP on the final response going to the browser
  if (response) {
    response.headers.set('Content-Security-Policy', cspHeader);
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to everything EXCEPT static files, images, and the favicon
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};