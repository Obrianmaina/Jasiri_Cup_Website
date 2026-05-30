import nodemailer from 'nodemailer';
import { generateBrandedEmail } from './email-template';

interface SendDonationEmailParams {
  to: string;
  name: string;
  amount: number;
  currency: string;
  cups: number;
}

export async function sendDonationEmail({ to, name, amount, currency, cups }: SendDonationEmailParams) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const greeting = name ? `Hello ${name},` : 'Hello,';
  
  // Format the amount neatly (e.g., $11.25 or KES 1,500)
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  const impactText = cups > 0 
    ? `Your generous donation of <strong>${formattedAmount}</strong> will sponsor <strong>${cups} menstrual cup${cups > 1 ? 's' : ''}</strong>, keeping girls in school period-safe for up to a decade!` 
    : `Your generous custom donation of <strong>${formattedAmount}</strong> goes directly towards keeping girls period-safe and in school.`;

  const innerHtmlContent = `
    <p>${greeting}</p>
    <p>Thank you from the bottom of our hearts for your contribution to JasiriCup.</p>
    <p>${impactText}</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #7856BF;">Donation Receipt</h3>
      <p style="margin: 5px 0;"><strong>Amount:</strong> ${formattedAmount}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <p>Because of you, we are one step closer to ending period poverty.</p>
    
    <p style="margin-top: 40px;">
      With deep gratitude,<br/>
      <strong>The JasiriCup Team</strong>
    </p>
  `;

  const finalHtml = generateBrandedEmail('Thank You for Your Donation!', innerHtmlContent);

  await transporter.sendMail({
    from: `"JasiriCup" <${process.env.EMAIL_SERVER_USER}>`,
    to,
    subject: 'Thank you for your generous donation! 💜',
    html: finalHtml,
  });
}