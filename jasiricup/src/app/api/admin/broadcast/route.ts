// src/app/api/admin/broadcast/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Subscriber from '@/lib/models/Subscriber';
import { Resend } from 'resend';
import { generateBrandedEmail } from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const formData = await req.formData();
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
    }

    // 1. Process Attachments
    const attachments = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        const buffer = Buffer.from(await value.arrayBuffer());
        attachments.push({
          filename: value.name,
          content: buffer,
        });
      }
    }

    // 2. Fetch Active Subscribers
    const activeSubscribers = await Subscriber.find({ 
      $or: [{ status: 'subscribed' }, { status: { $exists: false } }] 
    }).lean();

    if (activeSubscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers found.' }, { status: 400 });
    }

    // Extract emails for BCC
    const bccList = activeSubscribers.map((s) => s.email);

    // 3. Format the Email
    const formattedMessage = message.replace(/\n/g, '<br/>');
    const finalHtml = generateBrandedEmail(subject, formattedMessage);

    // 4. Dispatch Broadcast
    const { error } = await resend.emails.send({
      from: 'JasiriCup <notifications@hello.jasiricup.com>',
      to: 'notifications@hello.jasiricup.com',
      bcc: bccList,
      replyTo: 'correspondence@jasiricup.com',
      subject: subject,
      html: finalHtml,
      attachments: attachments,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ 
      success: true, 
      sentCount: activeSubscribers.length 
    }, { status: 200 });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json({ error: 'Failed to send broadcast' }, { status: 500 });
  }
}