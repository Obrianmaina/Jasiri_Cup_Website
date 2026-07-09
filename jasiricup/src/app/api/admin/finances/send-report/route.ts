import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { Resend } from 'resend';
import { generateBrandedEmail } from "@/lib/email-template";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  // 1. General Admin Security layer
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  const userEmail = authCheck.session?.user?.email?.toLowerCase();
  
  if (!userEmail) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // 2. Database & Role Check
  await connectDB();
  const dbUser = await User.findOne({ email: userEmail }).lean() as { role?: string } | null;

  // 3. The Master Admin Override
  const officialMasterEmail = (process.env.MASTER_ADMIN_EMAIL || '').trim().toLowerCase();
  
  const isMaster = dbUser?.role === 'Master' || userEmail === officialMasterEmail;
  const isFinance = dbUser?.role === 'Finance';

  if (!isMaster && !isFinance) {
    return NextResponse.json(
      { success: false, error: "Access Denied: You do not have Finance privileges to generate reports." }, 
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const recipient = formData.get("recipient") as string;
    const message = formData.get("message") as string;
    const reportId = formData.get("reportId") as string;
    const file = formData.get("file") as File | null;

    if (!recipient || !message || !reportId || !file) {
      return NextResponse.json({ success: false, error: "Missing required fields or PDF attachment" }, { status: 400 });
    }

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

    const { error } = await resend.emails.send({
      from: 'JasiriCup Accounting <notifications@hello.jasiricup.com>',
      to: recipient,
      replyTo: 'admin@jasiricup.com', 
      subject: `JasiriCup Financial Report: ${reportId}`,
      html: generateBrandedEmail(`Financial Report`, emailInnerHtml),
      attachments: [
        {
          filename: `${reportId}.pdf`,
          content: buffer,
        }
      ]
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process FormData and send email:", error);
    return NextResponse.json({ success: false, error: "Dispatch failed" }, { status: 500 });
  }
}