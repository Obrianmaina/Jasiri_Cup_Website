// src/app/api/admin/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { generateBrandedEmail } from "@/lib/email-template";
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    const { toEmail, toName, subject, message } = await req.json();

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

    // ADDED: Verify the connection before trying to send
    try {
      await transporter.verify();
      console.log("SMTP Connection successful.");
    } catch (verifyError) {
      console.error("SMTP Verification Failed:", verifyError);
      return NextResponse.json({ success: false, error: "SMTP Connection failed. Check server logs." }, { status: 500 });
    }

    const sanitizedReply = purify.sanitize(message, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    });

    const formattedMessage = sanitizedReply.replace(/\n/g, '<br>');

    const htmlContent = `
      <p style="font-size: 16px; margin-bottom: 20px;">Hi ${toName},</p>
      <p style="font-size: 16px; margin-bottom: 20px;">${formattedMessage}</p>
      <p style="font-size: 16px; margin-top: 30px;">Best regards,<br><strong>The JasiriCup Team</strong></p>
    `;

    await transporter.sendMail({
      from: `"JasiriCup" <${process.env.EMAIL_SERVER_USER}>`,
      to: toEmail,
      subject: subject,
      html: generateBrandedEmail(subject, htmlContent),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Reply API Email Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}