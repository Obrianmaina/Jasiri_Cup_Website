// src/app/api/admin/finances/send-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-middleware";
import nodemailer, { SendMailOptions } from 'nodemailer';
import { generateBrandedEmail } from "@/lib/email-template";

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
  tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' }
});

export async function POST(req: NextRequest) {
  // 1. Server-Side RBAC Verification (Security layer)
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    // 2. Parse the multipart/form-data
    const formData = await req.formData();
    const recipient = formData.get("recipient") as string;
    const message = formData.get("message") as string;
    const reportId = formData.get("reportId") as string;
    const file = formData.get("file") as File | null;

    if (!recipient || !message || !reportId || !file) {
      return NextResponse.json({ success: false, error: "Missing required fields or PDF attachment" }, { status: 400 });
    }

    // 3. Convert the Blob/File into a Node Buffer for Nodemailer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const emailInnerHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #7856BF; margin-top: 0;">JasiriCup Official Financial Report</h2>
        <p style="font-size: 14px; background-color: #f9fafb; padding: 10px; border-radius: 6px; font-family: monospace;">
          <strong>Report Reference ID:</strong> ${reportId}
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="white-space: pre-wrap; color: #374151; font-size: 15px; line-height: 1.6;">${message}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 0;">This is an automated dispatch from the JasiriCup Accounting System. The official report is attached to this email as a PDF document.</p>
      </div>
    `;

    const mailOptions: SendMailOptions = {
      from: `"JasiriCup Accounting" <${process.env.EMAIL_SERVER_USER}>`,
      to: recipient,
      subject: `JasiriCup Financial Report: ${reportId}`,
      html: generateBrandedEmail(`Financial Report`, emailInnerHtml),
      attachments: [
        {
          filename: `${reportId}.pdf`,
          content: buffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process FormData and send email:", error);
    return NextResponse.json({ success: false, error: "Dispatch failed" }, { status: 500 });
  }
}