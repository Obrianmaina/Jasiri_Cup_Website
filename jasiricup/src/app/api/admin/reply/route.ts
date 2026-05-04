// src/app/api/admin/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { generateBrandedEmail } from "@/lib/email-template";

export async function POST(req: NextRequest) {
  // Verify admin authorization
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    const { toEmail, toName, subject, message } = await req.json();

    // Use the exact same robust configuration as your contact route
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

    // Convert plain text newlines from the textarea to HTML breaks
    const formattedMessage = message.replace(/\n/g, '<br>');

    const htmlContent = `
      <p style="font-size: 16px; margin-bottom: 20px;">Hi ${toName},</p>
      <p style="font-size: 16px; margin-bottom: 20px;">${formattedMessage}</p>
      <p style="font-size: 16px; margin-top: 30px;">Best regards,<br><strong>The JasiriCup Team</strong></p>
    `;

    // Send the email
    await transporter.sendMail({
      from: `"JasiriCup" <${process.env.EMAIL_SERVER_USER}>`,
      to: toEmail,
      subject: subject,
      html: generateBrandedEmail(subject, htmlContent),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
    
    // Log the exact error to your terminal so you can see what went wrong
    console.error("Reply API Email Error:", errorMessage);
    
    // Safely check and log the error code without using 'any'
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("Error Code:", (error as { code: unknown }).code);
    }

    return NextResponse.json(
      { success: false, error: "Failed to send email" }, 
      { status: 500 }
    );
  }
}