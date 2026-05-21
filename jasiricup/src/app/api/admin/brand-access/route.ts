// src/app/api/admin/brand-access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
import { checkAdminAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await dbConnect();
    const requests = await BrandAccess.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching brand access requests:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}