import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Transaction from '@/lib/models/Transaction';
import { sendDonationEmail } from '@/lib/sendDonationEmail';
import crypto from 'crypto';

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

// Handles Paystack Redirect Callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const reference = searchParams.get('ref');

  // SECURITY FIX: Timing-safe equality check
  const providedSecret = Buffer.from(secret || '');
  const expectedSecret = Buffer.from(process.env.ADMIN_SECRET_TOKEN || '');

  if (providedSecret.length !== expectedSecret.length || !crypto.timingSafeEqual(providedSecret, expectedSecret)) {
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

    if (donation.status === 'complete') {
      return NextResponse.redirect(new URL('/donate/thank-you', req.url));
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = (await verifyRes.json()) as { 
      status: boolean; 
      data?: { status: string; receipt_number?: string } 
    };

    if (verifyData.status && verifyData.data?.status === 'success') {
      donation.status = 'complete';
      await donation.save();

      // Log the exact KES amount to the ledger
      await Transaction.create({
        type: 'income',
        category: 'Donation',
        amount: donation.baseAmountKes,
        currency: 'KES',
        date: new Date(),
        description: `Website Donation via Card (Originated as ${donation.currency} ${donation.amount}) - ${donation.cups ? donation.cups + ' cups' : 'Custom'}`,
        donorName: donation.name,
        donorEmail: donation.email,
        status: 'completed',
        paymentMethod: 'Card (Paystack)',
        referenceNumber: verifyData.data.receipt_number || reference,
        createdBy: 'system@jasiricup.com' // Explicitly logging system automation
      });

      await sendDonationEmail({
        to: donation.email,
        name: donation.name,
        amount: donation.amount,
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