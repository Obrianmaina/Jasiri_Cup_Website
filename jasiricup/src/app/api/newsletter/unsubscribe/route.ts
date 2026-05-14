import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Subscriber from '@/lib/models/Subscriber'; // Adjust this import based on your model name
import crypto from 'crypto';
import { generateUnsubscribeToken } from '@/lib/token';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return NextResponse.json({ error: 'Missing email or token' }, { status: 400 });
    }

    // Generate what the token SHOULD be
    const expectedToken = generateUnsubscribeToken(email);

    // Use timingSafeEqual to prevent cryptographic timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken)
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired unsubscribe link' }, { status: 403 });
    }

    await connectDB();
    
    // Safely unsubscribe the user
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() }, 
      { active: false }
    );

    // Redirect to a frontend success page
    return NextResponse.redirect(new URL('/newsletter/unsubscribed', req.url));

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Unsubscribe Error:", error.message);
    }
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}