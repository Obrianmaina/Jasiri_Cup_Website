// src/app/api/admin/finances/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Transaction from "@/lib/models/Transaction";
import { verifyFinanceAccess } from "@/lib/finance-auth";
import { getExchangeRates } from "@/lib/exchangeRates";
import { rateLimit } from "@/lib/rate-limit";

interface CreateTransactionBody {
  type: 'income' | 'expense';
  category: string;
  amount: number; 
  originalCurrency?: 'KES' | 'USD' | 'EUR' | 'GBP';
  date?: string | Date;
  description: string;
  donorName?: string;
  donorEmail?: string;
  receiptUrl?: string;
  paymentMethod: string;
  referenceNumber?: string;
}

interface MonthlyMetric {
  _id: { year: number; month: number; };
  totalIncome: number;
  totalExpense: number;
}

export async function GET(req: NextRequest) {
  try {
    const access = await verifyFinanceAccess(req);
    if (!access.authorized) return access.response!;

    await connectDB();
    const transactions = await Transaction.find().sort({ date: -1 }).lean();
    
    const metricsResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    const metrics: MonthlyMetric[] = metricsResult as MonthlyMetric[];
    return NextResponse.json({ success: true, data: { transactions, metrics } });
  } catch (error: unknown) {
    console.error("GET Finances Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch financial data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize User
    const access = await verifyFinanceAccess(req);
    if (!access.authorized || !access.userEmail) return access.response!;

    // 2. Safe Rate Limiting (Now inside the try/catch block to prevent crashes)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    try {
      const rl = await rateLimit(`finance-write:${ip}`, { windowMs: 60000, max: 20 });
      if (!rl.success) {
        return NextResponse.json({ success: false, error: "Too many requests. Please slow down." }, { status: 429 });
      }
    } catch (rlError) {
      console.warn("Rate Limiter is offline or failing, proceeding anyway to prevent blockage:", rlError);
    }

    // 3. Connect to DB and parse body
    await connectDB();
    const body = (await req.json()) as CreateTransactionBody;
    
    // 4. Strict Validation
    if (!body.type || !body.category || typeof body.amount !== 'number' || !body.description || !body.paymentMethod) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    if (!['income', 'expense'].includes(body.type)) {
      return NextResponse.json({ success: false, error: "Invalid transaction type" }, { status: 400 });
    }
    if (body.amount <= 0) {
      return NextResponse.json({ success: false, error: "Amount must be greater than zero" }, { status: 400 });
    }

    // 5. Currency Conversion Logic
    const currency = body.originalCurrency || 'KES';
    let amountKes = body.amount;
    let originalAmount: number | undefined;
    let exchangeRate: number | undefined;

    if (currency !== 'KES') {
      const rates = await getExchangeRates();
      const rate = rates[currency]; 
      
      if (!rate) {
        return NextResponse.json({ success: false, error: "Unsupported currency or failed to fetch rates" }, { status: 400 });
      }
      
      originalAmount = body.amount;
      exchangeRate = Math.round((1 / rate) * 10000) / 10000; 
      amountKes = Math.round(originalAmount * exchangeRate * 100) / 100;
    }

    // 6. Database Insertion (Converting empty strings to undefined to prevent Mongoose schema errors)
    const newTransaction = await Transaction.create({
      type: body.type,
      category: body.category,
      amount: amountKes,
      currency: 'KES',
      originalAmount,
      originalCurrency: currency !== 'KES' ? currency : undefined,
      exchangeRate,
      date: body.date,
      description: body.description,
      
      // Convert "" to undefined safely
      donorName: body.donorName?.trim() || undefined,
      donorEmail: body.donorEmail?.trim() || undefined,
      receiptUrl: body.receiptUrl?.trim() || undefined,
      referenceNumber: body.referenceNumber?.trim() || undefined,
      
      paymentMethod: body.paymentMethod,
      createdBy: access.userEmail, 
    });
    
    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
    
  } catch (error: unknown) {
    // If it STILL fails, this will print the exact database error to your terminal
    console.error("FATAL POST Transaction Error:", error);
    
    // Safely extract the error message to send to the frontend
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during transaction logging.";
    return NextResponse.json({ success: false, error: `Failed to log transaction: ${errorMessage}` }, { status: 500 });
  }
}