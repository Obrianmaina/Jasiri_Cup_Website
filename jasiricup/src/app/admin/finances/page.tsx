// src/app/admin/finances/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import FinancesClient from "./FinancesClient";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function FinancesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const userEmail = session.user.email || '';
  
  // Parse the allowed emails from the .env file
  const allowedEmailsStr = process.env.EMAIL_Auth || '';
  const allowedEmails = allowedEmailsStr.split(',').map(e => e.trim().toLowerCase());
  
  // Check if the current admin is in the allowed list
  const canGenerateReports = allowedEmails.includes(userEmail.toLowerCase());

  return (
    <FinancesClient 
      canGenerateReports={canGenerateReports} 
      userEmail={userEmail} 
    />
  );
}