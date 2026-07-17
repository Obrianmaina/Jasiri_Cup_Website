import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { checkAdminAuth } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  // SECURITY FIX: Auth-gate the endpoint to prevent public PII leaks
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  await dbConnect();
  try {
    // SECURITY FIX: Only select safe, public-facing fields. 
    // Never expose passwords, tokens, or 2FA secrets!
    const users = await User.find({}, 'name email image role').lean();
    return NextResponse.json({ data: users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// SECURITY FIX: The POST export has been entirely removed. 
// Account creation must route safely through /api/admin/invite.