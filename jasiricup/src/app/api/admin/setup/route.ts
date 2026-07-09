// src/app/api/admin/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const { email, password, token } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    await connectDB();

    const masterEmail = (process.env.MASTER_ADMIN_EMAIL || '').trim().toLowerCase();
    const isMaster = email.toLowerCase() === masterEmail;

    // Check if the user exists in the database
    let user = await User.findOne({ email: email.toLowerCase() });

    /// 1. Authorization Check
if (!isMaster) {
  if (!user) {
    return NextResponse.json({ success: false, error: "Email is not authorized for admin access." }, { status: 403 });
  }
  
  // Verify the setup token
  if (!token || user.setupToken !== token) {
    return NextResponse.json({ success: false, error: "Invalid or missing setup token." }, { status: 403 });
  }
  
  // Verify token hasn't expired
  if (user.setupTokenExpires && user.setupTokenExpires < new Date()) {
    return NextResponse.json({ success: false, error: "Setup link has expired." }, { status: 403 });
  }
}

    // 2. Already setup check
    if (user && user.twoFactorEnabled) {
      return NextResponse.json({ success: false, error: "Account already set up. Please log in." }, { status: 400 });
    }

    // 3. Create the Master user record if it is their very first time
    if (!user && isMaster) {
      user = new User({ email: email.toLowerCase(), name: 'Master Admin', role: 'Master' });
    }

    // 4. Hash the password and generate the 2FA secret
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const secret = speakeasy.generateSecret({ name: `JasiriCup Admin (${email})` });
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    user.password = hashedPassword;
    user.twoFactorSecret = secret.base32;
    await user.save();

    return NextResponse.json({ success: true, qrCode: qrCodeUrl });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ success: false, error: "Failed to initialize account" }, { status: 500 });
  }
}