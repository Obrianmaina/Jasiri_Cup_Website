// src/app/api/admin/team/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { checkAdminAuth } from "@/lib/auth-middleware";

const isMaster = (session: unknown) => 
  (session as { user?: { role?: string } })?.user?.role === 'Master';

export async function GET(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;
  if (!isMaster(authCheck.session)) {
    return NextResponse.json({ success: false, error: "Master Admin access required." }, { status: 403 });
  }

  try {
    await connectDB();
    const team = await User.find({}, 'name email role twoFactorEnabled isRevoked createdAt').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, team });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch team." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;
  if (!isMaster(authCheck.session)) {
    return NextResponse.json({ success: false, error: "Master Admin access required." }, { status: 403 });
  }

  try {
    const { userId, action } = await req.json();
    await connectDB();
    
    const targetUser = await User.findById(userId);
    if (!targetUser) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    if (targetUser.role === 'Master') return NextResponse.json({ success: false, error: "Cannot modify Master Admin" }, { status: 403 });

    // *** THIS IS THE MISSING TOGGLE LOGIC ***
    if (action === 'toggle-finance') {
      targetUser.role = targetUser.role === 'Finance' ? 'Admin' : 'Finance';
      await targetUser.save();
      return NextResponse.json({ 
        success: true, 
        message: `Finance access ${targetUser.role === 'Finance' ? 'granted' : 'revoked'} successfully.` 
      });
    }

    if (action === 'reset-2fa') {
      targetUser.twoFactorEnabled = false;
      targetUser.twoFactorSecret = undefined;
      await targetUser.save();
      return NextResponse.json({ success: true, message: "2FA has been successfully reset." });
    }

    if (action === 'toggle-revoke') {
      targetUser.isRevoked = !targetUser.isRevoked;
      await targetUser.save();
      return NextResponse.json({ success: true, message: targetUser.isRevoked ? "Access revoked." : "Access restored." });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update user status." }, { status: 500 });
  }
}