// src/lib/auth-options.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // 1. Get the allowed emails from our environment variable
      const allowedEmails = process.env.ADMIN_EMAILS?.split(',') || [];
      
      // 2. Check if the person logging in is on the list
      if (user.email && allowedEmails.includes(user.email)) {
        return true; // Access Granted!
      }
      
      // Access Denied! (They logged into Google, but aren't an approved admin)
      return '/admin/login?error=AccessDenied'; 
    }
  },
  pages: {
    signIn: '/admin/login',
  }
};