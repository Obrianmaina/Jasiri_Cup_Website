// src/lib/auth-options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import connectDB from "./dbConnect";
import User from "./models/User";
import { rateLimit } from "./rate-limit"; // Added rate limiting

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "2FA Token", type: "text" },
        isRecovery: { label: "Is Recovery", type: "text" }
      },
      async authorize(credentials, req) {
        // SECURITY FIX: Explicit type checks block NoSQL Injection objects
        if (typeof credentials?.email !== 'string' || typeof credentials?.password !== 'string') {
          throw new Error("Invalid credentials format");
        }

        // SECURITY FIX: Rate limit login/recovery attempts to prevent brute-forcing
        const ip = (req?.headers as Record<string, string> | undefined)?.['x-forwarded-for'] ?? 'unknown';
        const rl = await rateLimit(`login:${ip}:${credentials.email.toLowerCase()}`, { windowMs: 10 * 60_000, max: 8 });
        if (!rl.success) throw new Error("Too many attempts. Try again later.");

        await connectDB();
        const masterEmail = (process.env.MASTER_ADMIN_EMAIL || '').trim().toLowerCase();
        const isMaster = credentials.email.toLowerCase() === masterEmail;

        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        // 1. The Master Admin Backdoor Bypass
        if (credentials.isRecovery === 'true') {
          if (!isMaster) throw new Error("Only the Master Admin can use the recovery backdoor.");
          if (!user || !user.recoveryCode || !user.recoveryCodeExpires || user.recoveryCodeExpires < new Date()) {
            throw new Error("Invalid or expired recovery code.");
          }
          if (user.recoveryCode !== credentials.token) {
            throw new Error("Incorrect recovery code.");
          }

          // Clear the recovery code and disable 2FA to force them to reset it
          user.recoveryCode = undefined;
          user.recoveryCodeExpires = undefined;
          user.twoFactorEnabled = false;
          user.role = 'Master';
          await user.save();

          return { id: user._id.toString(), name: user.name || 'Master', email: user.email, role: 'Master' };
        }

        // 2. Normal Login Flow
        if (!user) {
          if (isMaster) throw new Error("Master account not initialized. Please click setup.");
          throw new Error("Email is not authorized for admin access.");
        }

        if (user.isRevoked) {
          throw new Error("Your access has been revoked by the Master Admin.");
        }

        if (!user.password) {
          throw new Error("Account not initialized. Please complete setup.");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) throw new Error("Invalid credentials");

        if (user.twoFactorEnabled) {
          if (!credentials.token || typeof credentials.token !== 'string' || credentials.token.trim() === '') {
            throw new Error("2FA_REQUIRED");
          }

          const isValidToken = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: credentials.token,
            window: 1
          });

          if (!isValidToken) throw new Error("Invalid 2FA code");
        } else {
           throw new Error("Account not fully secured. Please complete setup.");
        }

        // Ensure Master Admin always retains their specific role label
        if (isMaster && user.role !== 'Master') {
            user.role = 'Master';
            await user.save();
        }

        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          image: user.image, 
          role: user.role 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.picture = user.image; 
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture as string | null | undefined;
      }
      return session;
    }
  },
  pages: { signIn: '/admin/login' }
};