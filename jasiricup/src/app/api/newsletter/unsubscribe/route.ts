// src/app/api/newsletter/unsubscribe/route.ts
// Place this file at: jasiricup/src/app/api/newsletter/unsubscribe/route.ts
//
// SECURITY NOTES:
// - Uses HMAC-SHA256 token verification (timing-safe comparison) to prevent
//   anyone from unsubscribing arbitrary email addresses via URL guessing.
// - Token is generated from ADMIN_SECRET_TOKEN + email (same as /src/lib/token.ts).
// - Rate-limited to prevent abuse.

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

// ---------------------------------------------------------------------------
// Inline Subscriber model reference (avoids circular imports; Mongoose caches
// compiled models so this won't create a duplicate if the model already exists)
// ---------------------------------------------------------------------------
const SubscriberSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:     { type: String, trim: true, default: '' },
    active:   { type: Boolean, default: true },
    source:   { type: String, default: 'website' },
    language: { type: String, enum: ['en', 'sw'], default: 'en' },
  },
  { timestamps: true },
);

const Subscriber =
  mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);

// ---------------------------------------------------------------------------
// Token helpers (mirrors src/lib/token.ts)
// ---------------------------------------------------------------------------
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
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expected, 'hex'),
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// GET /api/newsletter/unsubscribe?email=...&token=...
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';

  // Rate-limit: max 10 attempts per minute per IP
  const rl = await rateLimit(`unsub:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.success) {
    // Redirect to error page rather than exposing a JSON 429
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed?error=rate_limited', req.url),
    );
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  // Missing parameters — redirect to a generic unsubscribed page so we
  // don't leak information about whether the email is actually registered.
  if (!email || !token) {
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', req.url),
    );
  }

  // Basic email format sanity check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', req.url),
    );
  }

  // Token must be exactly 64 hex characters (SHA-256 output)
  if (!/^[0-9a-f]{64}$/i.test(token)) {
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed?error=invalid_token', req.url),
    );
  }

  // Verify HMAC token
  if (!verifyToken(email, token)) {
    console.warn(`[unsubscribe] Invalid token for email: ${email.slice(0, 3)}***`);
    // Still redirect to unsubscribed page — don't expose that the token is wrong
    // (prevents enumeration attacks)
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', req.url),
    );
  }

  // Token is valid — deactivate the subscription
  try {
    await connectDB();

    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { active: false },
      { new: true },
    );

    // Success — redirect to the confirmation page
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', req.url),
    );
  } catch (error: unknown) {
    console.error('[unsubscribe] DB error:', error instanceof Error ? error.message : error);
    // Still redirect cleanly — don't expose internal errors to the user
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', req.url),
    );
  }
}

// Block other HTTP methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}