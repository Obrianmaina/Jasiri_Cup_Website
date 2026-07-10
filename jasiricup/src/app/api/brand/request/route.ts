// src/app/api/brand/request/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, name, organization, purpose } = body;

    // 1. Basic validation
    if (!email || !purpose) {
      return NextResponse.json(
        { error: 'Email and purpose are required to access the brand kit.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check for existing requests to prevent spam
    const existingRequest = await BrandAccess.findOne({ email: normalizedEmail });
    
    if (existingRequest) {
      if (existingRequest.status === 'approved') {
        return NextResponse.json(
          { message: 'You already have approved access. Please check your email for the link.' },
          { status: 200 }
        );
      }
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { message: 'A request for this email is already pending review.' },
          { status: 200 }
        );
      }
      if (existingRequest.status === 'rejected') {
          return NextResponse.json(
            { error: 'Previous access request was denied. Please contact support.' },
            { status: 403 }
          );
      }
    }

    // 3. Create the new request in the database
    await BrandAccess.create({
      email: normalizedEmail,
      name: name?.trim(),
      organization: organization?.trim(),
      purpose: purpose.trim(),
    });

    // 4. Trigger a notification email to the admin team (Zoho)
    const { error } = await resend.emails.send({
      from: 'JasiriCup Brand Kit <notifications@hello.jasiricup.com>',
      to: process.env.EMAIL_TO || 'brian@jasiricup.com', // Your Zoho address
      replyTo: normalizedEmail,
      subject: `New Brand Kit Request: ${name || normalizedEmail}`,
      html: `
        <h2>New Brand Kit Access Request</h2>
        <p>A new request has been submitted to access the JasiriCup Brand Kit.</p>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${normalizedEmail}</p>
        <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
        <br/>
        <p><strong>Intended Purpose:</strong></p>
        <p>${purpose}</p>
        <br/>
        <p><em>You can approve or deny this request from your Admin Dashboard.</em></p>
      `,
    });

    if (error) {
      console.error("Brand access email forwarding failed:", error);
      // We still return a success message to the user because their request was saved to the DB safely.
    }

    return NextResponse.json(
      { message: 'Request submitted successfully. We will review it shortly.' },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Type-safe error handling
    if (error instanceof Error) {
      console.error('Brand access request error:', error.message);
    } else {
      console.error('Brand access request error:', String(error));
    }
    
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again later.' },
      { status: 500 }
    );
  }
}