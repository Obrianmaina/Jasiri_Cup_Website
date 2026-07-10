// src/app/api/volunteer/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rate-limit';
import { generateBrandedEmail } from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 1. Rate Limit Protection
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await rateLimit(`volunteer:${ip}`, { windowMs: 60_000, max: 3 });
    
    if (!success) {
      return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // 2. Parse Application
    const body = await req.json();
    const { name, email, phone, message, roles } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Name, email, and message are required.' }, { status: 400 });
    }

    const selectedRoles = roles && roles.length > 0 ? roles.join(', ') : 'General Application';

    // 3. Send Confirmation Email to the Applicant
    const applicantHtml = `
      <p>Hi ${name.trim()},</p>
      <p>Thank you so much for your interest in volunteering with JasiriCup!</p>
      <p>We have received your application for the following roles: <strong>${selectedRoles}</strong>.</p>
      <p>Our team will review your details and get back to you shortly regarding the next steps.</p>
      <br/>
      <p>With gratitude,<br/><strong>The JasiriCup Team</strong></p>
    `;
    const brandedApplicantEmail = generateBrandedEmail('Volunteer Application Received', applicantHtml);

    await resend.emails.send({
      from: 'JasiriCup <notifications@hello.jasiricup.com>',
      to: email, // Sending directly to the applicant
      subject: 'We received your JasiriCup volunteer application! 💚',
      html: brandedApplicantEmail,
    });

    // 4. Send Notification to Zoho (Admin)
    await resend.emails.send({
      from: 'JasiriCup Volunteer <notifications@hello.jasiricup.com>',
      to: process.env.EMAIL_TO || 'hello@jasiricup.com', // Sending to Zoho
      replyTo: email,
      subject: `New Volunteer Application: ${name}`,
      html: `
        <h2>New Volunteer Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Roles of Interest:</strong> ${selectedRoles}</p>
        <br/>
        <p><strong>Why they want to volunteer:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true, message: 'Application submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Volunteer API error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}