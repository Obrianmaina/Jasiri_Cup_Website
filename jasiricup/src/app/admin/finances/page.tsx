// src/app/admin/finances/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import FinancesClient from "./FinancesClient";
import { redirect } from "next/navigation";
import connectDB from "@/lib/dbConnect";
import User from "@/lib/models/User";

export const dynamic = 'force-dynamic';

export default async function FinancesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const userEmail = (session.user.email || '').trim().toLowerCase();
  
  // 1. Connect to DB and fetch the user's latest role
  await connectDB();
  const dbUser = await User.findOne({ email: userEmail }).lean() as { role?: string } | null;

  // 2. Fetch the official Master Email from the environment
  const officialMasterEmail = (process.env.MASTER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL || '').trim().toLowerCase();
  
  // 3. Evaluate permissions using the exact same logic as our secured backend APIs
  const isMaster = dbUser?.role === 'Master' || userEmail === officialMasterEmail;
  const isFinance = dbUser?.role === 'Finance';

  // 4. Pass the final boolean to the client component to reveal the button!
  const canGenerateReports = isMaster || isFinance;

  return (
    <FinancesClient 
      canGenerateReports={canGenerateReports} 
      userEmail={userEmail} 
    />
  );
}