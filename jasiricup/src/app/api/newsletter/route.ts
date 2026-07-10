// src/app/api/newsletter/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Subscriber from '@/lib/models/Subscriber';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rate-limit';
import { generateBrandedEmail } from '@/lib/email-template';
import { generateUnsubscribeToken } from '@/lib/token';

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

    let isNewSubscription = false;

    if (existingSub) {
      if (!existingSub.active) {
        existingSub.active = true;
        existingSub.name = name || existingSub.name;
        await existingSub.save();
        isNewSubscription = true; // They resubscribed
      } else {
        return NextResponse.json({ success: true, message: 'Already subscribed!' });
      }
    } else {
      await Subscriber.create({
        email: normalizedEmail,
        name: name?.trim(),
        source: 'website_footer',
      });
      isNewSubscription = true;
    }

    if (isNewSubscription) {
      // Generate Secure Unsubscribe Link
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const unsubToken = generateUnsubscribeToken(normalizedEmail);
      const unsubscribeLink = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&token=${unsubToken}`;

      // 1. Send Confirmation Email to the Subscriber
      const greeting = name ? `Hi ${name.trim()},` : 'Hello,';
      const userHtmlContent = `
        <p>${greeting}</p>
        <p>Thank you for subscribing to the JasiriCup newsletter! We are absolutely thrilled to have you in our community.</p>
        <p>You can look forward to monthly impact updates, inspiring stories, and new ways to get involved as we work to end period poverty and keep girls in school.</p>
        <br/>
        <p>With gratitude,<br/><strong>The JasiriCup Team</strong></p>
        
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            Changed your mind? You can <a href="${unsubscribeLink}" style="color: #178E4E; text-decoration: underline;">unsubscribe securely here</a>.
          </p>
        </div>
      `;
      
      const userEmailHtml = generateBrandedEmail('Welcome to JasiriCup!', userHtmlContent);

      await resend.emails.send({
        from: 'JasiriCup <notifications@hello.jasiricup.com>',
        to: normalizedEmail,
        subject: 'Welcome to the JasiriCup Community! 🎉',
        html: userEmailHtml,
      });

      // 2. Alert your Zoho inbox about the new subscriber
      await resend.emails.send({
        from: 'JasiriCup Notifications <notifications@hello.jasiricup.com>',
        to: process.env.EMAIL_TO || 'hello@jasiricup.com',
        subject: `New Newsletter Subscriber: ${normalizedEmail}`,
        html: `<p>You have a new subscriber to the JasiriCup newsletter!</p><p><strong>Email:</strong> ${normalizedEmail}</p>`,
      });
    }

    return NextResponse.json(
      { success: true, message: existingSub ? 'Resubscribed successfully!' : 'Subscribed successfully!' }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Failed to subscribe.' }, { status: 500 });
  }
}