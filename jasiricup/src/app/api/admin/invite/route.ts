// src/app/api/admin/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-middleware";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";
import crypto from 'crypto';
import { Resend } from 'resend';
import { generateBrandedEmail } from "@/lib/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    const { email, name, role } = await req.json();
    if (!email || !name) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    await connectDB();

    // Generate a secure 64-character hex token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Upsert the user so we can invite brand new emails or resend to existing ones
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        name, 
        role: role || 'Admin',
        setupToken: token,
        setupTokenExpires: expires
      },
      { upsert: true, new: true }
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const setupLink = `${baseUrl}/admin/setup?token=${token}&email=${encodeURIComponent(email)}`;

    const htmlContent = `
      <p>Hi ${name},</p>
      <p>You have been invited to join the JasiriCup Admin Portal.</p>
      <p>Please click the secure link below to set up your password and initialize your account. This link will expire in 24 hours.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${setupLink}" style="background-color: #7856BF; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
          Set Up My Account
        </a>
      </div>
      <p>If you did not expect this invitation, please ignore this email.</p>
    `;

    await resend.emails.send({
      from: 'JasiriCup Admin <notifications@hello.jasiricup.com>',
      to: email,
      subject: 'Welcome to the JasiriCup Admin Portal',
      html: generateBrandedEmail('Account Setup', htmlContent),
    });

    return NextResponse.json({ success: true, message: "Invite sent successfully" });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ success: false, error: "Failed to send invite" }, { status: 500 });
  }
}