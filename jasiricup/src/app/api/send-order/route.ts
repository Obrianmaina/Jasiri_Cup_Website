// app/api/send-order/route.ts
import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { clientInfo, items } = await req.json();

    // Create transporter using Gmail SMTP from env
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Format the order items into a readable string
    const itemsText = items.map((item: any, index: number) => `
      --- Item ${index + 1} ---
      Quantity: ${item.quantity}
      Color: ${item.color}
      Size: ${item.size}
      Custom Notes: ${item.customNotes || 'N/A'}
    `).join('\n'); // Joins all item strings with a new line

    // Send email
    await transporter.sendMail({
      from: `"Order App" <${process.env.EMAIL_SERVER_USER}>`,
      to: process.env.EMAIL_TO,
      subject: 'New Order Received',
      text: `
        --- Customer Information ---
        Name: ${clientInfo.name}
        Email: ${clientInfo.email}
        Phone: ${clientInfo.phone}

        ${itemsText}
      `,
    });

    return NextResponse.json({ message: 'Order submitted successfully!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit order.' }, { status: 500 });
  }
}