// src/app/api/admin/recovery/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { Resend } from 'resend';
import { generateBrandedEmail } from "@/lib/email-template";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // 1. Extract the IP address securely from headers (Fixes the TS req.ip error)
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown-ip';
    
    // 2. Apply Rate Limiting: Max 3 requests per 1 hour (3,600,000 ms) per IP
    const rateLimitResult = await rateLimit(`recovery:${ip}`, { 
      windowMs: 60 * 60 * 1000, 
      max: 3 
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "Too many recovery requests. Please try again in an hour." }, 
        { status: 429 }
      );
    }

    const { email } = await req.json();
    const masterEmail = (process.env.MASTER_ADMIN_EMAIL || '').trim().toLowerCase();

    // Prevent attackers from knowing if an email is master or not
    if (!email || email.toLowerCase() !== masterEmail) {
      return NextResponse.json({ success: true, message: "If authorized, a recovery code was sent." });
    }

    await connectDB();
    let user = await User.findOne({ email: masterEmail });

    if (!user) {
       user = new User({ email: masterEmail, name: 'Master Admin', role: 'Master' });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.recoveryCode = otp;
    user.recoveryCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const htmlContent = `
      <p>Hello Master Admin,</p>
      <p>A backdoor recovery request was triggered for your JasiriCup Admin Portal.</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0;">
        <h2 style="margin: 0; color: #7856BF; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
      </div>
      <p>Enter this code on the login screen to bypass your password and 2FA. This code expires in 15 minutes.</p>
      <p>If you did not request this, please secure your account immediately.</p>
    `;

    await resend.emails.send({
      from: 'JasiriCup Security <notifications@hello.jasiricup.com>',
      to: masterEmail,
      subject: 'Master Admin Recovery Code',
      html: generateBrandedEmail('Security Alert', htmlContent),
    });

    return NextResponse.json({ success: true, message: "Recovery code sent successfully." });
  } catch (error) {
    console.error("Recovery Error:", error);
    return NextResponse.json({ success: false, error: "Failed to process recovery" }, { status: 500 });
  }
}