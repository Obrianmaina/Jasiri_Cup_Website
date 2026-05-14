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
  // Get the first 4 bytes as a Hex string
  const hex = Buffer.from(buffer.slice(0, 4)).toString('hex').toUpperCase();
  
  // Common image signatures
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Size validation (e.g., Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    // 3. Convert to buffer for deep inspection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 4. Magic Byte Validation (The actual security fix)
    if (!isValidImageSignature(buffer)) {
      console.warn(`Blocked invalid file upload attempt. Reported type: ${file.type}`);
      return NextResponse.json({ error: "Invalid file format. Only actual images are allowed." }, { status: 400 });
    }

    // 5. Convert to Base64 for Cloudinary
    const base64Data = Buffer.from(buffer).toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // 6. Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileUri, {
      folder: "jasiricup/blog",
      resource_type: "image",
      // Optional: Ask cloudinary to further sanitize the image
      format: "webp", 
    });

    return NextResponse.json({ success: true, url: uploadResponse.secure_url }, { status: 201 });

  } catch (error: unknown) {
    // Type-safe error logging
    if (error instanceof Error) {
      console.error("Upload error:", error.message);
    } else {
      console.error("Upload error:", error);
    }

    return NextResponse.json(
      { error: "Failed to upload image. Please try again." }, 
      { status: 500 }
    );
  }
}