// src/app/api/site-content/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import SiteContent from "@/lib/models/SiteContent";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    if (!page) {
      return NextResponse.json(
        { success: false, error: "page parameter is required" },
        { status: 400 }
      );
    }

    const content = await SiteContent.find({ page }).sort({ section: 1 });
    
    return NextResponse.json({ 
      success: true, 
      data: content 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error("Error fetching site content:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch content" }, { status: 500 });
  }
}