import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimitContact } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Basic rate limiting to prevent spam
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = await rateLimitContact(ip);
    if (!rateLimit.success) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const { name, email, topic, message } = await req.json();

    if (!name || !email || !topic || !message) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    // Forward straight to Zoho
    const { error } = await resend.emails.send({
      from: 'JasiriCup Website <notifications@hello.jasiricup.com>',
      to: process.env.EMAIL_TO || 'hello@jasiricup.com', // Your Zoho address
      replyTo: email,
      subject: `Website Contact: ${topic}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error("Email forwarding failed:", error);
      return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}