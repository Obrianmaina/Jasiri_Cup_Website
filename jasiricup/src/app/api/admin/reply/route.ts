// src/app/api/admin/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { generateBrandedEmail } from "@/lib/email-template";
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { toEmail, toName, subject, message } = body;

    if (!toEmail || !toName || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: toEmail, toName, subject, or message.' },
        { status: 400 }
      );
    }

    const sanitizedReply = purify.sanitize(message, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    });
    
    const formattedMessage = sanitizedReply.replace(/\n/g, '<br>');

    const htmlContent = `
      <p style="font-size: 16px; margin-bottom: 20px; font-family: sans-serif; color: #333333;">Hi ${toName},</p>
      <p style="font-size: 16px; margin-bottom: 20px; font-family: sans-serif; color: #333333; line-height: 1.6;">${formattedMessage}</p>
      <p style="font-size: 16px; margin-top: 30px; font-family: sans-serif; color: #333333;">Best regards,<br><strong>The JasiriCup Team</strong></p>
    `;

    const { error } = await resend.emails.send({
      from: 'JasiriCup <notifications@hello.jasiricup.com>',
      to: toEmail,
      replyTo: 'correspondence@jasiricup.com', 
      subject: subject,
      html: generateBrandedEmail(subject, htmlContent),
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, message: 'Branded email dispatched successfully.' }, { status: 200 });
  } catch (error: unknown) {
    console.error("CRITICAL REPLY API EMAIL ERROR:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch email", details: errorMessage }, 
      { status: 500 }
    );
  }
}