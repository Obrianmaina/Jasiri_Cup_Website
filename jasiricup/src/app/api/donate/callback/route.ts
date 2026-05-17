import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Transaction from '@/lib/models/Transaction'; // Imported the Transaction model

// Donation record model (Ensures it works even on Vercel cold starts)
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

interface MpesaItem {
  Name: string;
  Value: string | number;
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (!secret || secret !== process.env.ADMIN_SECRET_TOKEN) {
    console.warn('CRITICAL: Unauthorized M-Pesa callback attempt blocked.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const callbackData = body?.Body?.stkCallback;
    
    if (!callbackData) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await connectDB();

    const donation = await Donation.findOne({ mpesaCheckoutId: callbackData.CheckoutRequestID });
    
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    if (callbackData.ResultCode === 0) {
      // Payment Successful
      donation.status = 'complete';
      
      const receiptItem = callbackData.CallbackMetadata?.Item?.find(
        (item: MpesaItem) => item.Name === 'MpesaReceiptNumber'
      );
      
      const receiptCode = receiptItem ? String(receiptItem.Value) : callbackData.CheckoutRequestID;
      
      if (receiptItem) {
        donation.mpesaReceipt = receiptCode;
      }
      
      await donation.save();

      // NEW: Automatically log this directly to the Finances Ledger!
      await Transaction.create({
        type: 'income',
        category: 'Donation',
        amount: donation.amount,
        currency: 'KES',
        date: new Date(),
        description: `Website Donation (${donation.cups} cups sponsored)`,
        donorName: donation.name,
        donorEmail: donation.email,
        status: 'completed',
        paymentMethod: 'M-Pesa',
        referenceNumber: receiptCode
      });

    } else {
      // Payment Failed
      donation.status = 'failed';
      await donation.save();
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error: unknown) {
    console.error("M-Pesa Callback Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}