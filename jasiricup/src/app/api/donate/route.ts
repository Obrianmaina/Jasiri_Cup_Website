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

      const paystackData = await paystackRes.json();

      if (paystackData.status) {
        donation.reference = reference;
        await donation.save();
        
        return NextResponse.json({ success: true, checkoutUrl: paystackData.data.authorization_url });
      } else {
        throw new Error(paystackData.message || 'Paystack initialization failed');
      }
    }

    // 3. Handle Daraja (M-Pesa)
    if (payMethod === 'mpesa') {
      // Format phone number to 2547XXXXXXXX
      let formattedPhone = phone.replace(/\s+/g, '');
      if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);
      if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);

      // Get Daraja OAuth Token
      const consumerKey = process.env.MPESA_CONSUMER_KEY;
      const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
      const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

      const authRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${credentials}`
        }
      });
      
      if (!authRes.ok) {
        console.error("Daraja Auth Error:", await authRes.text());
        throw new Error('Failed to authenticate with M-Pesa');
      }

      const authData = await authRes.json();
      const token = authData.access_token;

      // Generate Password for STK Push
      const shortCode = '174379'; // Safaricom Sandbox Paybill
      const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Safaricom Sandbox Passkey
      
      // Timestamp format: YYYYMMDDHHmmss
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

      // Initiate STK Push
      const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(baseAmountKes),
          PartyA: formattedPhone,
          PartyB: shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: `${baseUrl}/api/donate/callback?secret=${process.env.ADMIN_SECRET_TOKEN}`,
          AccountReference: "JasiriCup",
          TransactionDesc: `Donation: ${cups ? cups + ' cups' : 'Custom'}`
        })
      });

      const stkData = await stkRes.json();

      if (stkData.ResponseCode === "0") {
        donation.mpesaCheckoutId = stkData.CheckoutRequestID;
        await donation.save();
        return NextResponse.json({ success: true, message: 'M-Pesa prompt initiated' });
      } else {
        console.error("Daraja STK Error:", stkData);
        throw new Error(stkData.errorMessage || 'Failed to initiate STK push');
      }
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  } catch (error) {
    console.error("Donation Initialization Error:", error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}