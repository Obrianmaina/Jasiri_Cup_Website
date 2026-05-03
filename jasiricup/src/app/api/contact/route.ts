// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ContactMessage from '@/lib/models/ContactMessage';
import nodemailer from 'nodemailer';
import { generateBrandedEmail } from '@/lib/email-template';

// Simple in-memory rate limiting (consider Redis for production)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_IP = 3; // Max 3 requests per minute per IP

// HTML sanitization function (enhanced)
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\n/g, '<br>')
    .trim();
}

// Enhanced email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Remove requests outside the time window
  const validRequests = userRequests.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= MAX_REQUESTS_PER_IP) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    rateLimitMap.clear();
  }
  
  return true;
}

// Input validation function
function validateInput(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 1. Ensure the data is actually an object before we try to read properties
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid request format'] };
  }

  // 2. Cast it to a safe, generic object so TypeScript lets us check properties
  const payload = data as Record<string, unknown>;
  
  if (!payload.name || typeof payload.name !== 'string') {
    errors.push('Name is required');
  } else if (payload.name.trim().length < 2 || payload.name.trim().length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  if (!payload.email || typeof payload.email !== 'string') {
    errors.push('Email is required');
  } else if (!isValidEmail(payload.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!payload.topic || typeof payload.topic !== 'string') {
    errors.push('Topic is required');
  } else if (payload.topic.trim().length < 3 || payload.topic.trim().length > 200) {
    errors.push('Topic must be between 3 and 200 characters');
  }
  
  if (!payload.message || typeof payload.message !== 'string') {
    errors.push('Message is required');
  } else if (payload.message.trim().length < 10 || payload.message.trim().length > 1000) {
    errors.push('Message must be between 10 and 1000 characters');
  }
  
  return { isValid: errors.length === 0, errors };
}
// Define the shape of a Mongoose ValidationError
interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

// Type guard to safely check if an unknown error is a MongooseValidationError
function isMongooseValidationError(error: unknown): error is MongooseValidationError {
  if (!error || typeof error !== 'object') return false;
  
  const err = error as Record<string, unknown>;
  return (
    err.name === 'ValidationError' &&
    typeof err.errors === 'object' &&
    err.errors !== null
  );
}

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
  requireTLS: true,
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const clientIp = Array.isArray(ip) ? ip[0] : ip.split(',')[0];
    
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { message: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeHtml(body.name.trim()),
      email: body.email.trim().toLowerCase(),
      topic: sanitizeHtml(body.topic.trim()),
      message: sanitizeHtml(body.message.trim())
    };

    // Check for suspicious content (basic spam detection)
    const suspiciousPatterns = [
      /https?:\/\/[^\s]+/gi, // URLs in message
      /\b(viagra|casino|lottery|winner|congratulations)\b/gi, // Spam keywords
    ];
    
    const fullText = `${sanitizedData.name} ${sanitizedData.topic} ${sanitizedData.message}`;
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(fullText));
    
    if (hasSuspiciousContent) {
      console.warn(`Suspicious contact form submission from IP: ${clientIp}`);
      return NextResponse.json(
        { message: 'Message could not be processed. Please contact us directly.' },
        { status: 400 }
      );
    }

    // Create new contact message in database
    const newContactMessage = await ContactMessage.create(sanitizedData);

    // Send email notifications
    let emailSent = false;
    try {
      // 1. Notify the Admin
      const adminHtml = `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${sanitizedData.name}<br>
        <strong>Email:</strong> ${sanitizedData.email}<br>
        <strong>Topic:</strong> ${sanitizedData.topic}</p>
        <div style="background-color: #f8f9fa; border-left: 4px solid #7856BF; padding: 15px; margin-top: 15px;">
          ${sanitizedData.message}
        </div>
      `;

      await transporter.sendMail({
        from: `"JasiriCup Contact" <${process.env.EMAIL_SERVER_USER}>`,
        replyTo: sanitizedData.email,
        to: process.env.EMAIL_TO,
        subject: `New Message: ${sanitizedData.topic}`,
        html: generateBrandedEmail(`New Message: ${sanitizedData.topic}`, adminHtml),
      });

      // 2. Send auto-reply to the Client
      const clientHtml = `
        <p>Hi ${sanitizedData.name},</p>
        <p>Thank you for reaching out to JasiriCup. This is a quick note to let you know we have received your message regarding <strong>"${sanitizedData.topic}"</strong>.</p>
        <p>Our team will review your message and get back to you as soon as possible.</p>
        <p style="margin-top: 20px;">Best regards,<br><strong>The JasiriCup Team</strong></p>
      `;

      await transporter.sendMail({
        from: `"JasiriCup" <${process.env.EMAIL_SERVER_USER}>`,
        to: sanitizedData.email,
        subject: `We received your message: ${sanitizedData.topic}`,
        html: generateBrandedEmail("Message Received", clientHtml),
      });

      emailSent = true;
    } catch (emailError: unknown) {
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown email error';
      console.error('Failed to send email:', errorMessage);
      // Continue without failing the request so the DB entry still succeeds
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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Contact API error:', errorMessage);
    
    // Use the type guard to safely handle validation errors
    if (isMongooseValidationError(error)) {
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
    
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} // <--- THIS WAS THE MISSING BRACE!

// Handle other HTTP methods securely
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}