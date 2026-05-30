import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Ensure the Mongoose model is available
const DonationSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    email:         { type: String, required: true },
    phone:         { type: String },
    amount:        { type: Number, required: true },
    currency:      { type: String, required: true, default: 'KES' }, 
    baseAmountKes: { type: Number, required: true },
    cups:          { type: Number, default: 0 },
    payMethod:     { type: String, enum: ['mpesa', 'card'], required: true },
    status:        { type: String, enum: ['pending', 'complete', 'failed'], default: 'pending' },
    reference:     { type: String },
    mpesaCheckoutId: { type: String }, 
    mpesaReceipt:    { type: String }, 
  },
  { timestamps: true },
);

const Donation = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, baseAmountKes, currency, phone, name, email, payMethod, cups } = body;

    await connectDB();

    // 1. Create the pending donation record
    const donation = await Donation.create({
      name,
      email,
      phone,
      amount,
      currency,
      baseAmountKes,
      cups,
      payMethod,
      status: 'pending'
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 2. Handle Paystack (Card)
    if (payMethod === 'card') {
      const reference = `JASIRI_${donation._id}_${Date.now()}`;
      
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(baseAmountKes * 100), // Paystack requires the lowest denomination
          currency: 'KES', // Force Paystack to process in KES
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

      const paystackData = await paystackRes.json();

      if (paystackData.status) {
        donation.reference = reference;
        await donation.save();
        
        // Return the checkout URL so the frontend can redirect the user
        return NextResponse.json({ success: true, checkoutUrl: paystackData.data.authorization_url });
      } else {
        throw new Error(paystackData.message || 'Paystack initialization failed');
      }
    }

    // 3. Handle Daraja (M-Pesa)
    if (payMethod === 'mpesa') {
      // Your Daraja STK Push logic will go here
      // donation.mpesaCheckoutId = mpesaData.CheckoutRequestID;
      // await donation.save();

      return NextResponse.json({ success: true, message: 'M-Pesa prompt initiated' });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  } catch (error) {
    console.error("Donation Initialization Error:", error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}