import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ContactMessage from '@/lib/models/ContactMessage';
import nodemailer from 'nodemailer';

// Add debug logging
console.log('Environment check:');
console.log('DB_CONNECTION_STRING exists:', !!process.env.DB_CONNECTION_STRING);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

// HTML sanitization function
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\n/g, '<br>');
}

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export async function POST(req: Request) {
  console.log('POST request received at /api/contact');

  try {
    // Test database connection first
    console.log('Attempting database connection...');
    await dbConnect();
    console.log('Database connected successfully');

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body parsed:', { 
        ...body, 
        message: body.message?.substring(0, 50) + '...' 
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { name, email, topic, message } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !topic?.trim() || !message?.trim()) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { message: 'All fields are required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.log('Validation failed: invalid email format');
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate field lengths
    const validations = [
      { field: name.trim(), max: 100, name: 'Name' },
      { field: email.trim(), max: 254, name: 'Email' },
      { field: topic.trim(), max: 200, name: 'Topic' },
      { field: message.trim(), max: 1000, name: 'Message' }
    ];

    for (const { field, max, name: fieldName } of validations) {
      if (field.length > max) {
        return NextResponse.json(
          { message: `${fieldName} must be less than ${max + 1} characters` },
          { status: 400 }
        );
      }
    }

    // Create new contact message in database
    console.log('Creating new contact message...');
    const newContactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      topic: topic.trim(),
      message: message.trim(),
    });
    console.log('Contact message created successfully:', newContactMessage._id);

    // Send email notification
    console.log('Attempting to send email...');
    let emailSent = false;
    try {
      await transporter.sendMail({
        from: `"JasiriCup Contact" <${process.env.EMAIL_SERVER_USER}>`, // Use your verified sender
        replyTo: email, // User can reply to this address
        to: process.env.EMAIL_TO,
        subject: `New Contact Message: ${topic}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Contact Message from JasiriCup Website
            </h1>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> ${sanitizeHtml(name)}</p>
              <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
              <p><strong>Topic:</strong> ${sanitizeHtml(topic)}</p>
            </div>
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Message:</h3>
              <div style="background-color: #fff; border-left: 4px solid #007bff; padding: 15px; margin: 10px 0;">
                ${sanitizeHtml(message)}
              </div>
            </div>
            <hr style="border: none; height: 1px; background-color: #dee2e6; margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">
              This message has been saved to your MongoDB database with ID: ${newContactMessage._id}
            </p>
          </div>
        `,
        text: `
New Contact Message from JasiriCup Website

Name: ${name}
Email: ${email}
Topic: ${topic}

Message:
${message}

This message has been saved to your MongoDB database with ID: ${newContactMessage._id}
        `.trim(),
      });
      console.log('Email sent successfully!');
      emailSent = true;
    } catch (emailError: any) {
      console.error('Failed to send email:', {
        name: emailError.name,
        message: emailError.message,
        code: emailError.code,
      });
      // Continue without failing the request
    }

    return NextResponse.json(
      {
        message: 'Message sent successfully!',
        data: {
          id: newContactMessage._id,
          emailSent,
          timestamp: newContactMessage.createdAt || new Date()
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Detailed error in contact API:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          message: 'Invalid data provided', 
          errors: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        },
        { status: 400 }
      );
    }

    if (error.name === 'MongooseError' || 
        error.message?.includes('MongoDB') || 
        error.message?.includes('connection')) {
      return NextResponse.json(
        { message: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Internal Server Error', 
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to submit contact messages.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to submit contact messages.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to submit contact messages.' },
    { status: 405 }
  );
}