// src/app/api/admin/2fa/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-middleware";
import speakeasy from "speakeasy";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  // Type guard to ensure the email is fully extracted from the session
  const userEmail = authCheck.session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ success: false, error: "User session email not found" }, { status: 401 });
  }

  try {
    await connectDB();
    const { token, secret } = await req.json();

    const isValidToken = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!isValidToken) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    // Save the secret and enable 2FA for the user in the database
    await User.findOneAndUpdate(
      { email: userEmail.toLowerCase() },
      { 
        twoFactorSecret: secret,
        twoFactorEnabled: true 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "2FA enabled successfully" });
  } catch (error) {
    console.error("2FA Verification Error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify 2FA" }, { status: 500 });
  }
}