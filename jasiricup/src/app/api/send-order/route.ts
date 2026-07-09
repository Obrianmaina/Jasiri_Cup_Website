// src/app/api/send-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { Resend } from 'resend';
import { generateBrandedEmail } from '@/lib/email-template';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  color: string;
  size: string;
  customNotes?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { clientInfo, items } = await req.json();

    await Order.create({ clientInfo, items });

    for (const item of items) {
      const updateResult = await Product.updateOne(
        {
          _id: item.productId,
          "variations.color": item.color,
          "variations.size": item.size,
          "variations.stockQuantity": { $gte: item.quantity }
        },
        {
          $inc: { "variations.$.stockQuantity": -item.quantity }
        }
      );

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for product ${item.productId}` },
          { status: 400 }
        );
      }
    }

    const itemsHtml = items.map((item: OrderItem, index: number) => `
      <div style="background-color: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #2e003a;">Item ${index + 1}: ${item.productName}</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Quantity:</strong> ${item.quantity}</li>
          <li><strong>Color:</strong> ${item.color}</li>
          <li><strong>Size:</strong> ${item.size}</li>
          ${item.customNotes ? `<li><strong>Notes:</strong> ${item.customNotes}</li>` : ''}
        </ul>
      </div>
    `).join('');

    const adminHtml = `
      <h3>New Order Received</h3>
      <p><strong>Name:</strong> ${clientInfo.name}<br>
      <strong>Email:</strong> ${clientInfo.email}<br>
      <strong>Phone:</strong> ${clientInfo.phone}</p>
      ${itemsHtml}
    `;

    const clientHtml = `
      <p>Hi ${clientInfo.name},</p>
      <p>Thank you for placing an order with JasiriCup! We have received your order and are currently processing it.</p>
      <h3>Order Summary</h3>
      ${itemsHtml}
      <p style="margin-top: 20px;">We will contact you soon regarding delivery. If you have any questions, simply reply to this email.</p>
      <p>Best,<br><strong>The JasiriCup Team</strong></p>
    `;

    // 1. Send notification to Admin
    await resend.emails.send({
      from: 'JasiriCup Orders <notifications@hello.jasiricup.com>',
      to: process.env.EMAIL_TO as string,
      replyTo: clientInfo.email, // Lets you reply directly to the customer!
      subject: 'New Order Received',
      html: generateBrandedEmail('New Order Received', adminHtml),
    });

    // 2. Send branded confirmation to Client
    await resend.emails.send({
      from: 'JasiriCup <notifications@hello.jasiricup.com>',
      to: clientInfo.email,
      replyTo: 'support@jasiricup.com', // Directs customer questions to your support alias
      subject: 'Your JasiriCup Order Confirmation',
      html: generateBrandedEmail('Order Confirmation', clientHtml),
    });

    return NextResponse.json({ message: 'Order submitted successfully!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit order.' }, { status: 500 });
  }
}