// src/app/api/send-order/route.ts
import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product'; // Added Product import

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  color: string;
  size: string;
  customNotes?: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { clientInfo, items } = await req.json();

    // 1. Save the order to the database
    await Order.create({ clientInfo, items });

    // 2. Automatically deduct stock from your inventory
    for (const item of items) {
      if (item.productId) {
        await Product.updateOne(
          { 
            _id: item.productId, 
            "variations.color": item.color, 
            "variations.size": item.size 
          },
          { 
            $inc: { "variations.$.stockQuantity": -item.quantity } 
          }
        );
      }
    }

    // 3. Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // 4. Format the email text
    const itemsText = items.map((item: OrderItem, index: number) => `
      --- Item ${index + 1} ---
      Product: ${item.productName}
      Quantity: ${item.quantity}
      Color: ${item.color}
      Size: ${item.size}
      Custom Notes: ${item.customNotes || 'N/A'}
    `).join('\n'); 

    // 5. Send email
    await transporter.sendMail({
      from: `"Jasiricup Orders" <${process.env.EMAIL_SERVER_USER}>`,
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