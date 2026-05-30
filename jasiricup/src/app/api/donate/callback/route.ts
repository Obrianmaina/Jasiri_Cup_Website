import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Transaction from '@/lib/models/Transaction';
import { sendDonationEmail } from '@/lib/sendDonationEmail';

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

interface MpesaItem {
  Name: string;
  Value: string | number;
}


// Handles Paystack Redirect Callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const reference = searchParams.get('ref');

  if (!secret || secret !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!reference) {
    return NextResponse.redirect(new URL('/donate?error=missing_reference', req.url));
  }

  try {
    await connectDB();
    const donation = await Donation.findOne({ reference });
    
    if (!donation) {
      return NextResponse.redirect(new URL('/donate?error=not_found', req.url));
    }

    // Skip verify if a webhook already marked it complete
    if (donation.status === 'complete') {
      return NextResponse.redirect(new URL('/donate/thank-you', req.url));
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status && verifyData.data.status === 'success') {
      donation.status = 'complete';
      await donation.save();

      // FIXED: Log the exact KES amount to the ledger
      await Transaction.create({
        type: 'income',
        category: 'Donation',
        amount: donation.baseAmountKes, // Changed from donation.amount
        currency: 'KES', // Standardized to KES
        date: new Date(),
        description: `Website Donation via Card (Originated as ${donation.currency} ${donation.amount}) - ${donation.cups ? donation.cups + ' cups' : 'Custom'}`, // Logs the foreign value here
        donorName: donation.name,
        donorEmail: donation.email,
        status: 'completed',
        paymentMethod: 'Card (Paystack)',
        referenceNumber: verifyData.data.receipt_number || reference
      });

      await sendDonationEmail({
        to: donation.email,
        name: donation.name,
        amount: donation.amount, // Keep original amount for the donor's email receipt
        currency: donation.currency,
        cups: donation.cups
      });

      return NextResponse.redirect(new URL('/donate/thank-you', req.url));
    } else {
      donation.status = 'failed';
      await donation.save();
      return NextResponse.redirect(new URL('/donate?error=payment_failed', req.url));
    }
  } catch (error) {
    console.error("Paystack Verification Error:", error);
    return NextResponse.redirect(new URL('/donate?error=server_error', req.url));
  }
}

// Handles M-Pesa STK Push Webhook
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
      donation.status = 'complete';
      
      const receiptItem = callbackData.CallbackMetadata?.Item?.find(
        (item: MpesaItem) => item.Name === 'MpesaReceiptNumber'
      );
      const receiptCode = receiptItem ? String(receiptItem.Value) : callbackData.CheckoutRequestID;
      if (receiptItem) donation.mpesaReceipt = receiptCode;
      
      await donation.save();

      await Transaction.create({
        type: 'income',
        category: 'Donation',
        amount: donation.baseAmountKes, // Ensure M-pesa logs reflect the exact KES amount
        currency: 'KES', 
        date: new Date(),
        description: `Website Donation (${donation.cups} cups sponsored)`,
        donorName: donation.name,
        donorEmail: donation.email,
        status: 'completed',
        paymentMethod: 'M-Pesa',
        referenceNumber: receiptCode
      });

      await sendDonationEmail({
        to: donation.email,
        name: donation.name,
        amount: donation.amount,
        currency: donation.currency,
        cups: donation.cups
      });

    } else {
      donation.status = 'failed';
      await donation.save();
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error: unknown) {
    console.error("M-Pesa Callback Error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}