// src/app/api/brand/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset');
    const token = searchParams.get('token');

    // 1. Basic validation
    if (!asset || !token) {
      return new NextResponse('Invalid request: Missing asset or token', { status: 400 });
    }

    // 2. Verify the security token
    const accessRecord = await BrandAccess.findOne({ 
      accessToken: token, 
      status: 'approved' 
    });

    if (!accessRecord) {
      return new NextResponse('Invalid or unauthorized token', { status: 403 });
    }

    if (accessRecord.expiresAt && new Date(accessRecord.expiresAt) < new Date()) {
      return new NextResponse('This access link has expired', { status: 403 });
    }

    // 3. Handle Dynamic URLs from the Admin Panel
    // If you pasted a full Cloudinary or Google Drive link, redirect straight to it!
    if (asset.startsWith('http://') || asset.startsWith('https://')) {
      return NextResponse.redirect(asset);
    }

    // 4. Fallback for the old hardcoded keywords (just in case!)
    // If you type "logos" instead of a URL in the admin panel, it will use these.
    // Feel free to replace these empty strings with your actual fallback URLs.
    const FALLBACK_ASSETS: Record<string, string> = {
      'logos': 'https://your-fallback-cloudinary-link-for-logos.zip',
      'word': 'https://your-fallback-cloudinary-link-for-word.zip',
      'powerpoint': 'https://your-fallback-cloudinary-link-for-ppt.zip',
    };

    const downloadUrl = FALLBACK_ASSETS[asset];

    if (!downloadUrl) {
      return new NextResponse('Asset not found', { status: 404 });
    }

    // 5. Final Redirect
    return NextResponse.redirect(downloadUrl);
    
  } catch (error) {
    console.error('Download API error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}