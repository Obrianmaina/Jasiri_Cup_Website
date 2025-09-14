import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ContactMessage from '@/lib/models/ContactMessage';
import nodemailer from 'nodemailer';

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

// Enhanced email validation
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
function validateInput(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.trim().length < 2 || data.name.trim().length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!data.topic || typeof data.topic !== 'string') {
    errors.push('Topic is required');
  } else if (data.topic.trim().length < 3 || data.topic.trim().length > 200) {
    errors.push('Topic must be between 3 and 200 characters');
  }
  
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required');
  } else if (data.message.trim().length < 10 || data.message.trim().length > 1000) {
    errors.push('Message must be between 10 and 1000 characters');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Configure Nodemailer transporter with better security
const transporter = nodemailer.createTransporter({
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
  // Additional security options
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
      // Log suspicious activity
      console.warn(`Suspicious contact form submission from IP: ${clientIp}`);
      return NextResponse.json(
        { message: 'Message could not be processed. Please contact us directly.' },
        { status: 400 }
      );
    }

    // Create new contact message in database
    const newContactMessage = await ContactMessage.create(sanitizedData);

    // Send email notification with better error handling
    let emailSent = false;
    try {
      await transporter.sendMail({
        from: `"JasiriCup Contact" <${process.env.EMAIL_SERVER_USER}>`,
        replyTo: sanitizedData.email,
        to: process.env.EMAIL_TO,
        subject: `New Contact Message: ${sanitizedData.topic}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Contact Message from JasiriCup Website
            </h1>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> ${sanitizedData.name}</p>
              <p><strong>Email:</strong> ${sanitizedData.email}</p>
              <p><strong>Topic:</strong> ${sanitizedData.topic}</p>
            </div>
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Message:</h3>
              <div style="background-color: #fff; border-left: 4px solid #007bff; padding: 15px; margin: 10px 0;">
                ${sanitizedData.message}
              </div>
            </div>
            <hr style="border: none; height: 1px; background-color: #dee2e6; margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">
              Sent from IP: ${clientIp}<br>
              Database ID: ${newContactMessage._id}
            </p>
          </div>
        `,
        text: `
New Contact Message from JasiriCup Website

Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Topic: ${sanitizedData.topic}

Message:
${sanitizedData.message}

Sent from IP: ${clientIp}
Database ID: ${newContactMessage._id}
        `.trim(),
      });
      emailSent = true;
    } catch (emailError: any) {
      console.error('Failed to send email:', emailError.message);
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
    console.error('Contact API error:', error.message);

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

    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

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