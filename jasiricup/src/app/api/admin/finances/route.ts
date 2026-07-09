// src/app/api/admin/finances/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { checkAdminAuth } from "@/lib/auth-middleware";

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

interface MonthlyMetric {
  _id: { year: number; month: number; };
  totalIncome: number;
  totalExpense: number;
}

// *** THIS IS THE MISSING HELPER THAT FIXES THE MASTER ADMIN ***
async function verifyFinanceAccess(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return { authorized: false, response: authCheck.response! };

  const userEmail = authCheck.session?.user?.email?.toLowerCase();
  if (!userEmail) {
    return { authorized: false, response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }

  await connectDB();
  const dbUser = await User.findOne({ email: userEmail }).lean() as { role?: string } | null;
  
  // Checking both variations of the env variable just to be totally bulletproof
  const officialMasterEmail = (process.env.MASTER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL || '').trim().toLowerCase();
  
  const isMaster = dbUser?.role === 'Master' || userEmail === officialMasterEmail;
  const isFinance = dbUser?.role === 'Finance';

  if (!isMaster && !isFinance) {
    return { 
      authorized: false, 
      response: NextResponse.json({ success: false, error: "Access Denied: Finance privileges required." }, { status: 403 }) 
    };
  }

  return { authorized: true };
}

export async function GET(req: NextRequest) {
  const access = await verifyFinanceAccess(req);
  if (!access.authorized) return access.response;

  try {
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
    return NextResponse.json({ success: false, error: "Failed to fetch financial data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const access = await verifyFinanceAccess(req);
  if (!access.authorized) return access.response;

  try {
    await connectDB();
    const body = (await req.json()) as CreateTransactionBody;
    
    if (!body.type || !body.category || typeof body.amount !== 'number' || !body.description || !body.paymentMethod) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newTransaction = await Transaction.create(body);
    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: "Failed to log transaction" }, { status: 500 });
  }
}