// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get('admin-token')?.value;
    if (token !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'jasiricup/blog',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}