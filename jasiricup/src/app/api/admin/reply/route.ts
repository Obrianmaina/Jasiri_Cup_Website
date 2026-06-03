import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { generateBrandedEmail } from "@/lib/email-template";
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export async function POST(req: NextRequest) {
  // 1. Enforce strict admin session verification
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { toEmail, toName, subject, message } = body;

    // 2. Validate essential request inputs
    if (!toEmail || !toName || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: toEmail, toName, subject, or message.' },
        { status: 400 }
      );
    }

    // 3. Re-establish your exact customized SMTP transporter parameters
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });

    // 4. Verify SMTP connection state before attempting a transmission block
    try {
      await transporter.verify();
      console.log("SMTP Connection verified successfully.");
    } catch (verifyError) {
      console.error("SMTP Verification Failed:", verifyError);
      return NextResponse.json(
        { success: false, error: "SMTP Connection failed. Check server log outputs." }, 
        { status: 500 }
      );
    }

    // 5. Clean and sanitize raw message text safely
    const sanitizedReply = purify.sanitize(message, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    });

    const formattedMessage = sanitizedReply.replace(/\n/g, '<br>');

    // 6. Build out the styled interior frame body text
    const htmlContent = `
      <p style="font-size: 16px; margin-bottom: 20px; font-family: sans-serif; color: #333333;">Hi ${toName},</p>
      <p style="font-size: 16px; margin-bottom: 20px; font-family: sans-serif; color: #333333; line-height: 1.6;">${formattedMessage}</p>
      <p style="font-size: 16px; margin-top: 30px; font-family: sans-serif; color: #333333;">Best regards,<br><strong>The JasiriCup Team</strong></p>
    `;

    // 7. Dispatch your official branded layout design wrapper
    await transporter.sendMail({
      from: `"JasiriCup" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
      to: toEmail,
      subject: subject,
      html: generateBrandedEmail(subject, htmlContent),
    });

    return NextResponse.json({ success: true, message: 'Branded email dispatched successfully.' }, { status: 200 });

  } catch (error: unknown) {
    console.error("❌ CRITICAL REPLY API EMAIL ERROR:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch email", details: errorMessage }, 
      { status: 500 }
    );
  }
}