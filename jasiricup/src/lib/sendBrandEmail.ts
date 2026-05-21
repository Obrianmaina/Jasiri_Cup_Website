// src/lib/sendBrandEmail.ts
import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  name?: string;
  token: string;
}

export async function sendBrandAccessEmail({ to, name, token }: SendEmailParams) {
  // Ensure you have these environment variables set in your .env.local file
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const magicLink = `${baseUrl}/brand-os?token=${token}`;
  const greeting = name ? `Hello ${name},` : 'Hello,';

  const htmlContent = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #eab308;">JaSiriCup Brand OS Access</h2>
      <p>${greeting}</p>
      <p>Great news! Your request to access the JaSiriCup Brand Operating System has been approved.</p>
      <p>You can now access our official brand guidelines, logos, and document templates using your secure magic link below:</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${magicLink}" style="background-color: #eab308; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Access Brand OS
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666;">
        <em>Note: Please do not share this link with others. It is a secure token generated specifically for your approved email address.</em>
      </p>
      
      <p style="margin-top: 40px;">
        Best regards,<br/>
        <strong>The JaSiriCup Team</strong>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"JaSiriCup Brand Team" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: 'Your JaSiriCup Brand OS Access is Approved',
    html: htmlContent,
  });
}