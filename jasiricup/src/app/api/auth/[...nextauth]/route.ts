// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

const handler = NextAuth(authOptions);

// Next.js App Router ONLY allows HTTP method exports here
export { handler as GET, handler as POST };