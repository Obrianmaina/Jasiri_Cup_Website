import { withAuth } from "next-auth/middleware";

// This automatically protects the routes defined in the matcher below
export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  // Apply this protection to ALL admin and api/admin routes (except login)
  matcher: [
    '/admin/((?!login).*)', 
    '/api/admin/:path*'
  ]
};