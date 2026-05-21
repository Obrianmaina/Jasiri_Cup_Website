// src/app/api/brand/request/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
// import { checkRateLimit } from '@/lib/rate-limit'; // Uncomment if using your existing rate limiter

export async function POST(req: Request) {
  try {
    // Optional: await checkRateLimit(req);

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

    // 3. Create the new request
    await BrandAccess.create({
      email: normalizedEmail,
      name: name?.trim(),
      organization: organization?.trim(),
      purpose: purpose.trim(),
    });

    // Future addition: Trigger a notification email to the admin team here

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