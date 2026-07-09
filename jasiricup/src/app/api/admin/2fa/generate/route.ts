// src/app/api/admin/2fa/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-middleware";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import connectDB from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  const userEmail = authCheck.session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ success: false, error: "User session email not found" }, { status: 401 });
  }

  try {
    await connectDB();
    
    const secret = speakeasy.generateSecret({ 
      name: `JasiriCup Admin (${userEmail})` 
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return NextResponse.json({ 
      success: true, 
      secret: secret.base32, 
      qrCode: qrCodeUrl 
    });
  } catch (error) {
    console.error("2FA Generation Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate 2FA secret" }, { status: 500 });
  }
}