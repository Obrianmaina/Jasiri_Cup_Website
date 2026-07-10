import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, phone, roles, message } = await req.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ success: false, message: 'Required fields missing' }, { status: 400 });
    }

    const selectedRoles = roles && roles.length > 0 ? roles.join(', ') : 'General Application';

    // Forward straight to Zoho
    const { error } = await resend.emails.send({
      from: 'JasiriCup Website <notifications@hello.jasiricup.com>',
      to: process.env.EMAIL_TO || 'hello@jasiricup.com', // Your Zoho address
      replyTo: email,
      subject: `New Volunteer Application: ${name}`,
      html: `
        <h2>New Volunteer Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Interested Roles:</strong> ${selectedRoles}</p>
        <br/>
        <p><strong>Why they want to volunteer:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error("Email forwarding failed:", error);
      return NextResponse.json({ success: false, message: 'Failed to submit application' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error("Volunteer API Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}