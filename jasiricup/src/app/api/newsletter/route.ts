// src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import crypto from 'crypto';
import { generateBrandedEmail } from '@/lib/email-template';
import { rateLimit } from '@/lib/rate-limit';

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    name:     { type: String, trim: true, default: '' },
    active:   { type: Boolean, default: true },
    source:   { type: String, default: 'website' },
    language: { type: String, enum: ['en', 'sw'], default: 'en' },
  },
  { timestamps: true }
);

const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
const resend = new Resend(process.env.RESEND_API_KEY);

function generateUnsubscribeToken(email: string): string {
  const secret = process.env.ADMIN_SECRET_TOKEN;
  if (!secret) throw new Error('ADMIN_SECRET_TOKEN is not configured');
  return crypto
    .createHmac('sha256', secret)
    .update(email.toLowerCase().trim())
    .digest('hex');
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const rl = await rateLimit(`newsletter:${ip}`, { windowMs: 60_000, max: 3 });

  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment.' },
      { status: 429 },
    );
  }

  try {
    await connectDB();
    const { email, name, language = 'en' } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 },
      );
    }

    await Subscriber.findOneAndUpdate(
      { email },
      { email, name: name || '', active: true, language },
      { upsert: true, new: true },
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jasiricup.org';
    const unsubToken = generateUnsubscribeToken(email);
    const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken}`;

    try {
      const greeting = name ? `Hi ${name},` : 'Hi there,';
      const html = `
        <p>${greeting}</p>
        <p>Welcome to the JasiriCup community!</p>
        <p>You'll receive our monthly impact newsletter packed with:</p>
        <ul>
          <li>Real impact numbers from the field</li>
          <li>Stories from the girls we serve</li>
          <li>Ways to help spread the word</li>
          <li>News and programme updates</li>
        </ul>
        <p>While you wait for our next newsletter, explore our impact:</p>
        <p style="margin-top:20px;">
          <a href="${baseUrl}/impact" style="background:#7856BF;color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:bold;">See Our Impact</a>
        </p>
        <p style="margin-top:24px;font-size:13px;color:#9ca3af;">
          Don't want these emails?&nbsp;
          <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe here</a>
        </p>
      `;

      await resend.emails.send({
        from: 'JasiriCup <notifications@hello.jasiricup.com>',
        to: email,
        replyTo: 'correspondence@jasiricup.com',
        subject: 'Welcome to the JasiriCup Newsletter! 🎉',
        html: generateBrandedEmail('Welcome to JasiriCup', html),
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr);
    }

    return NextResponse.json(
      { success: true, message: 'Subscribed successfully!' },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      return NextResponse.json({ success: true, message: "You're already subscribed!" });
    }
    console.error('Newsletter error:', err);
    return NextResponse.json(
      { success: false, error: 'Subscription failed. Please try again.' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.redirect(new URL('/newsletter/unsubscribed', req.url));
  }
  try {
    await connectDB();
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { active: false },
    );
  } catch {
    // Silent
  }
  return NextResponse.redirect(new URL('/newsletter/unsubscribed', req.url));
}