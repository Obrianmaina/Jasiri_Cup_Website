// src/app/api/brand/download/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';

// Replace these with your actual Cloudinary URLs or file paths once uploaded
const ASSET_LINKS: Record<string, string> = {
  logos: 'https://res.cloudinary.com/your-cloud-id/raw/upload/v1/brand/jasiricup-logos.zip',
  word: 'https://res.cloudinary.com/your-cloud-id/raw/upload/v1/brand/jasiricup-word-template.docx',
  powerpoint: 'https://res.cloudinary.com/your-cloud-id/raw/upload/v1/brand/jasiricup-ppt-template.pptx',
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const asset = searchParams.get('asset');

    if (!token || !asset || !ASSET_LINKS[asset]) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    await dbConnect();

    // Check if the token exists, is approved, and has NOT expired
    const isValid = await BrandAccess.findOne({ 
      accessToken: token, 
      status: 'approved',
      expiresAt: { $gt: new Date() } // Ensures expiration date is strictly in the future
    });

    if (!isValid) {
      return new NextResponse('Unauthorized or Token Expired', { status: 401 });
    }

    // Redirect the user to the actual secure file URL
    return NextResponse.redirect(ASSET_LINKS[asset]);
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Download error:', error.message);
    } else {
      console.error('Download error:', String(error));
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}