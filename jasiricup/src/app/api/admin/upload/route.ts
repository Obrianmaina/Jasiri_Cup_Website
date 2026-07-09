// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth-middleware";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Check the physical binary signature (Magic Bytes) of the file
function isValidImageSignature(buffer: Uint8Array): boolean {
  const hex = Buffer.from(buffer.slice(0, 4)).toString('hex').toUpperCase();
  return (
    hex.startsWith('FFD8FF') || // JPEG/JPG
    hex.startsWith('89504E47') || // PNG
    hex.startsWith('47494638') || // GIF
    hex.startsWith('52494646')    // WEBP (RIFF header)
  );
}

export async function POST(req: NextRequest) {
  // 1. Verify Admin Authentication & CSRF
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploadType = formData.get('type') as string | null; // NEW: Identify what is being uploaded

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // 2. Size validation (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    // 3. Convert to buffer for deep inspection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 4. Magic Byte Validation
    if (!isValidImageSignature(buffer)) {
      console.warn(`Blocked invalid file upload attempt. Reported type: ${file.type}`);
      return NextResponse.json({ success: false, error: "Invalid file format. Only actual images are allowed." }, { status: 400 });
    }

    // 5. Convert to Base64 for Cloudinary
    const base64Data = Buffer.from(buffer).toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // 6. Dynamic Cloudinary Configuration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadOptions: any = {
      resource_type: "image",
      format: "webp",
    };

    if (uploadType === 'profile') {
      // Setup for Admin Profile Pictures
      uploadOptions.folder = "jasiricup_admin_profiles";
      uploadOptions.transformation = [
        { width: 400, height: 400, crop: "fill", gravity: "face" }
      ];
    } else {
      // Default Setup (Maintains existing Blog functionality)
      uploadOptions.folder = "jasiricup/blog";
    }

    // 7. Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileUri, uploadOptions);

    return NextResponse.json({ success: true, url: uploadResponse.secure_url }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Upload error:", error.message);
    } else {
      console.error("Upload error:", error);
    }

    return NextResponse.json(
      { success: false, error: "Failed to upload image. Please try again." }, 
      { status: 500 }
    );
  }
}