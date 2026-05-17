// src/app/api/admin/finances/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Transaction from "@/lib/models/Transaction";
import { checkAdminAuth } from "@/lib/auth-middleware";

// Strict Types for incoming POST requests
interface CreateTransactionBody {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency?: string;
  date?: string | Date;
  description: string;
  donorName?: string;
  donorEmail?: string;
  receiptUrl?: string;
  paymentMethod: string;
  referenceNumber?: string;
}

// Strict Types for the MongoDB Aggregation Result
interface MonthlyMetric {
  _id: {
    year: number;
    month: number;
  };
  totalIncome: number;
  totalExpense: number;
}

export async function GET(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();

    // 1. Fetch all transactions sorted by date
    const transactions = await Transaction.find().sort({ date: -1 }).lean();

    // 2. Aggregate monthly metrics directly in MongoDB for performance
    const metricsResult = await Transaction.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
          }
        }
      },
      { 
        $sort: { "_id.year": -1, "_id.month": -1 } 
      }
    ]);

    // Cast the result to our strict type
    const metrics: MonthlyMetric[] = metricsResult as MonthlyMetric[];

    return NextResponse.json({ 
      success: true, 
      data: {
        transactions,
        metrics
      } 
    });
  } catch (error: unknown) {
    console.error("Failed to fetch finances:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch financial data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const body = (await req.json()) as CreateTransactionBody;
    
    // Basic validation
    if (!body.type || !body.category || typeof body.amount !== 'number' || !body.description || !body.paymentMethod) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newTransaction = await Transaction.create(body);
    
    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json({ success: false, error: "Failed to log transaction" }, { status: 500 });
  }
}