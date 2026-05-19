// src/app/api/admin/faqs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FAQ from '@/lib/models/FAQ';
import { checkAdminAuth } from '@/lib/auth-middleware';
import { revalidateTag } from 'next/cache';

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const faqs = await FAQ.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    // 'error' defaults to 'unknown' in TypeScript
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  await dbConnect();
  try {
    const body = await req.json();
    const faq = await FAQ.create(body);
    
    revalidateTag("faqs");

    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    console.error("FAQ Creation Error:", error);
    
    // Safely check if the 'unknown' error has a message property
    const errorMessage = error instanceof Error ? error.message : 'Failed to create FAQ';

    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: 400 }
    );
  }
}