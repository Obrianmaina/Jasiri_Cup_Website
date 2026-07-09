import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    email:         { type: String, required: true },
    amount:        { type: Number, required: true },
    currency:      { type: String, required: true, default: 'KES' }, 
    baseAmountKes: { type: Number, required: true },
    cups:          { type: Number, default: 0 },
    payMethod:     { type: String, enum: ['card'], required: true, default: 'card' },
    status:        { type: String, enum: ['pending', 'complete', 'failed'], default: 'pending' },
    reference:     { type: String },
  },
  { timestamps: true },
);

const Donation = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      amount: number;
      baseAmountKes: number;
      currency: string;
      name: string;
      email: string;
      cups: number;
    };

    const { amount, baseAmountKes, currency, name, email, cups } = body;

    await connectDB();

    const donation = await Donation.create({
      name,
      email,
      amount,
      currency,
      baseAmountKes,
      cups,
      payMethod: 'card',
      status: 'pending'
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const reference = `JASIRI_${String(donation._id)}_${Date.now()}`;
    
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(baseAmountKes * 100), // Paystack expects cents
        currency: 'KES',
        reference: reference,
        callback_url: `${baseUrl}/api/donate/callback?secret=${process.env.ADMIN_SECRET_TOKEN}&ref=${reference}`,
        metadata: {
          custom_fields: [
            { display_name: "Original Currency", variable_name: "original_currency", value: currency },
            { display_name: "Original Display Amount", variable_name: "original_amount", value: amount }
          ]
        }
      }),
    });

    const paystackData = (await paystackRes.json()) as { 
      status: boolean; 
      message: string; 
      data?: { authorization_url: string } 
    };

    if (paystackData.status && paystackData.data) {
      donation.reference = reference;
      await donation.save();
      return NextResponse.json({ success: true, checkoutUrl: paystackData.data.authorization_url });
    } else {
      throw new Error(paystackData.message || 'Paystack initialization failed');
    }

  } catch (error) {
    console.error("Donation Initialization Error:", error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}