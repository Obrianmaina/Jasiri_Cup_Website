import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { rateLimitOrder } from '@/lib/rate-limit';

// ─── Donation record model ─────────────────────────────────────────────────
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
    mpesaCheckoutId: { type: String }, // Added to track Safaricom's session
    mpesaReceipt:    { type: String }, // Added to store the final receipt code
  },
  { timestamps: true },
);

const Donation =
  mongoose.models.Donation || mongoose.model('Donation', DonationSchema);

// ─── M-Pesa helpers ────────────────────────────────────────────────────────
async function getMpesaToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString('base64');

  const res = await fetch(
    'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } },
  );
  const data = await res.json();
  return data.access_token;
}

async function stkPush(phone: string, amount: number, reference: string) {
  const token = await getMpesaToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`,
  ).toString('base64');

  // Normalise phone to 254XXXXXXXXX
  const normalised = phone.replace(/^0/, '254').replace(/^\+/, '');

  // CRITICAL SECURITY FIX: Append the secret token to the callback URL
  const callbackSecret = process.env.ADMIN_SECRET_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jasiricup.org';
  const callBackURL = `${baseUrl}/api/donate/callback?secret=${callbackSecret}`;

  const res = await fetch(
    'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: normalised,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: normalised,
        CallBackURL: callBackURL,
        AccountReference: reference,
        TransactionDesc: 'JasiriCup Donation',
      }),
    },
  );
  return res.json();
}

// ─── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';

  const rl = await rateLimitOrder(ip);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a minute.' },
      { status: 429 },
    );
  }

  try {
    await connectDB();
    const { name, email, phone, amount, cups, payMethod } = await req.json();

    if (!name || !email || !amount || amount < 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid donation data.' },
        { status: 400 },
      );
    }

    const reference = `JC-${Date.now()}`;

    // Save initial pending record
    const newDonation = await Donation.create({ name, email, phone, amount, cups, payMethod, reference });

    // ── M-Pesa ──
    if (payMethod === 'mpesa') {
      if (!process.env.MPESA_CONSUMER_KEY) {
        // Keys not yet configured — return stub success for development
        return NextResponse.json({
          success: true,
          message: 'M-Pesa STK push sent (dev mode — keys not configured)',
          reference,
        });
      }
      
      const mpesaRes = await stkPush(phone, amount, reference);
      
      if (mpesaRes.ResponseCode === '0') {
        // CRITICAL UPDATE: Save the CheckoutRequestID so the callback route can find this specific donation
        newDonation.mpesaCheckoutId = mpesaRes.CheckoutRequestID;
        await newDonation.save();
        
        return NextResponse.json({ success: true, reference });
      }
      return NextResponse.json(
        { success: false, error: mpesaRes.errorMessage || 'M-Pesa request failed' },
        { status: 400 },
      );
    }

    // ── Card (Pesapal) ──
    if (payMethod === 'card') {
      if (!process.env.PESAPAL_CONSUMER_KEY) {
        return NextResponse.json({
          success: true,
          checkoutUrl: '/donate/thank-you?ref=' + reference,
          message: 'Card payment stub (keys not configured)',
        });
      }
      // TODO: implement Pesapal OAuth + IPN registration
      // See: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/authentication
      return NextResponse.json({
        success: true,
        checkoutUrl: '/donate/thank-you?ref=' + reference,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown payment method' }, { status: 400 });
  } catch (err) {
    console.error('Donation error:', err);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed. Please try again.' },
      { status: 500 },
    );
  }
}