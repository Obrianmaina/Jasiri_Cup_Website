import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Subscriber from '@/lib/models/Subscriber';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    // Fetch all subscribers, sorted by newest first
    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ subscribers }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }
}