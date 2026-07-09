// src/lib/sendBrandEmail.ts
import { Resend } from 'resend';
import { generateBrandedEmail } from './email-template';

interface SendEmailParams {
  to: string;
  name?: string;
  token: string;
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBrandAccessEmail({ to, name, token }: SendEmailParams) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const magicLink = `${baseUrl}/brand-os?token=${token}`;
  const greeting = name ? `Hello ${name},` : 'Hello,';

  // 1. Create the inner HTML specific to this email
  const innerHtmlContent = `
    <p>${greeting}</p>
    <p>Great news! Your request to access the JaSiriCup Brand Operating System has been approved.</p>
    <p>Use your secure link below to access our official brand guidelines, logos, and document templates:</p>
    
    <div style="margin: 30px 0; text-align: center;">
      <a href="${magicLink}" style="background-color: #7856BF; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
        Access Brand OS
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <em>Please do not share this link - it is a secure token tied to your approved email address.</em>
    </p>
    
    <p style="margin-top: 40px;">
      Best regards,<br/>
      <strong>The JasiriCup Team</strong>
    </p>
  `;

  // 2. Wrap it using your standardized email template
  const finalHtml = generateBrandedEmail('Brand OS Access Approved', innerHtmlContent);

  // 3. Send the formatted email via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: 'JasiriCup Brand Team <notifications@hello.jasiricup.com>',
      to,
      replyTo: 'correspondence@jasiricup.com', 
      subject: 'Your JasiriCup Brand OS Access is Approved',
      html: finalHtml,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send brand email:", error);
    return { success: false, error };
  }
}