import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';

// ─── Donation record model (Ensures it works even on Vercel cold starts) ───
const DonationSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    email:     { type: String, required: true },
    phone:     { type: String },
    amount:    { type: Number, required: true },
    cups:      { type: Number, default: 0 },
    payMethod: { type: String, enum: ['mpesa', 'card'], required: true },
    status:    { type: String, enum: ['pending', 'complete', 'failed'], default: 'pending' },
    reference: { type: String },
    mpesaCheckoutId: { type: String }, 
    mpesaReceipt:    { type: String }, 
  },
  { timestamps: true },
);

const Donation = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);

// ─── M-Pesa Item Interface for strict typing ───
interface MpesaItem {
  Name: string;
  Value: string | number;
}

export async function POST(req: NextRequest) {
  // 1. Verify the secret in the URL (Authenticates Safaricom)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (!secret || secret !== process.env.ADMIN_SECRET_TOKEN) {
    console.warn('CRITICAL: Unauthorized M-Pesa callback attempt blocked.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Safaricom nests the data under Body.stkCallback
    const callbackData = body?.Body?.stkCallback;
    if (!callbackData) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await connectDB();

    // 2. Find the donation using the CheckoutRequestID we saved in the previous step
    const donation = await Donation.findOne({ mpesaCheckoutId: callbackData.CheckoutRequestID });
    
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // 3. Process the ResultCode (0 means success in Safaricom's system)
    if (callbackData.ResultCode === 0) {
      // Payment Successful
      donation.status = 'complete';
      
      // Extract the exact M-Pesa receipt number from the metadata array
      const receiptItem = callbackData.CallbackMetadata?.Item?.find(
        (item: MpesaItem) => item.Name === 'MpesaReceiptNumber'
      );
      
      if (receiptItem) {
        donation.mpesaReceipt = String(receiptItem.Value);
      }
      
      await donation.save();
    } else {
      // Payment Failed (Insufficient funds, cancelled by user, timeout, etc.)
      donation.status = 'failed';
      await donation.save();
    }

    // 4. Safaricom expects a simple success response to acknowledge we received it
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("M-Pesa Callback Error:", error.message);
    } else {
      console.error("M-Pesa Callback Error:", error);
    }
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}