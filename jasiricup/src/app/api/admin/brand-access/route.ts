// src/app/api/admin/brand-access/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';

// ADD THIS LINE to prevent aggressive route caching
export const dynamic = 'force-dynamic';

interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as CustomUser | undefined;

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Fetch all requests, sorting newest first
    const requests = await BrandAccess.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching brand access requests:', error.message);
    } else {
      console.error('Error fetching brand access requests:', String(error));
    }
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}