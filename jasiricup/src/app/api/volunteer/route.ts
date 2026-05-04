import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Volunteer from '@/lib/models/Volunteer';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const volunteer = await Volunteer.create(body);
    
    return NextResponse.json({ success: true, data: volunteer }, { status: 201 });
  } catch (error) {
    console.error('Error saving volunteer:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit application' }, { status: 500 });
  }
}