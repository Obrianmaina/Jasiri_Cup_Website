// src/app/api/admin/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { checkAdminAuth } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const user = await User.findOne({ email: authCheck.session?.user?.email?.toLowerCase() }, 'name email image role');
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    const { name, image } = await req.json();
    if (!name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email: authCheck.session?.user?.email?.toLowerCase() },
      { name, image },
      { new: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}