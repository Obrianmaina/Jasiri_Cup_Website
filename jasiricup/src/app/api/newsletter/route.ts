// src/app/api/newsletter/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Subscriber from '@/lib/models/Subscriber';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await rateLimit(`newsletter:${ip}`, { windowMs: 60_000, max: 5 });
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    await dbConnect();
    const { email, name } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingSub = await Subscriber.findOne({ email: normalizedEmail });

    if (existingSub) {
      if (!existingSub.active) {
        existingSub.active = true;
        existingSub.name = name || existingSub.name;
        await existingSub.save();
        return NextResponse.json({ success: true, message: 'Resubscribed successfully!' });
      }
      return NextResponse.json({ success: true, message: 'Already subscribed!' });
    }

    await Subscriber.create({
      email: normalizedEmail,
      name: name?.trim(),
      source: 'website_footer',
    });

    // Optional: Alert your Zoho inbox about the new subscriber
    await resend.emails.send({
      from: 'JasiriCup Notifications <notifications@hello.jasiricup.com>',
      to: process.env.EMAIL_TO || 'hello@jasiricup.com',
      subject: `New Newsletter Subscriber: ${normalizedEmail}`,
      html: `<p>You have a new subscriber to the JasiriCup newsletter!</p><p><strong>Email:</strong> ${normalizedEmail}</p>`,
    });

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Failed to subscribe.' }, { status: 500 });
  }
}