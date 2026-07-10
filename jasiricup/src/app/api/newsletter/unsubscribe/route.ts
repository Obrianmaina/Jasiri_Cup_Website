// src/app/api/newsletter/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Subscriber from '@/lib/models/Subscriber'; 
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

function generateUnsubscribeToken(email: string): string {
  const secret = process.env.ADMIN_SECRET_TOKEN;
  if (!secret) throw new Error('ADMIN_SECRET_TOKEN is not configured');
  return crypto
    .createHmac('sha256', secret)
    .update(email.toLowerCase().trim())
    .digest('hex');
}

function verifyToken(email: string, token: string): boolean {
  try {
    const expected = generateUnsubscribeToken(email);
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expected, 'hex'),
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const rl = await rateLimit(`unsub:${ip}`, { windowMs: 60_000, max: 10 });
    
    if (!rl.success) {
      return new NextResponse('Too many requests. Try again later.', { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return new NextResponse('Invalid request: Missing parameters.', { status: 400 });
    }

    if (!/^[0-9a-f]{64}$/i.test(token)) {
      return new NextResponse('Invalid token format.', { status: 400 });
    }

    if (!verifyToken(email, token)) {
      console.warn(`[unsubscribe] Invalid token for email: ${email.slice(0, 3)}***`);
      return new NextResponse('Invalid or expired unsubscribe link.', { status: 403 });
    }

    await connectDB();
    
    // Hard delete the subscriber from the database
    await Subscriber.findOneAndDelete({ email: email.toLowerCase().trim() });

    // Return a clean HTML message confirming complete removal
    return new NextResponse(
      `<html><body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #178E4E;">You have been successfully unsubscribed.</h2>
        <p>Your email address has been completely removed from our system.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error: unknown) {
    console.error('[unsubscribe] DB error:', error instanceof Error ? error.message : error);
    return new NextResponse('An error occurred. Please try again.', { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}