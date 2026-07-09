// src/app/api/admin/setup/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";
import speakeasy from "speakeasy";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: "Setup session expired. Please restart." }, { status: 400 });
    }

    const isValidToken = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!isValidToken) {
      return NextResponse.json({ success: false, error: "Invalid authentication code" }, { status: 400 });
    }

    // Lock the account
    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({ success: true, message: "Setup complete" });
  } catch (error) {
    console.error("Setup verify error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify 2FA" }, { status: 500 });
  }
}