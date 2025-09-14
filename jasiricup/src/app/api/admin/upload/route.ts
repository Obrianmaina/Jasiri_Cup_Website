// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { checkAdminAuth } from '@/lib/auth-middleware';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Validate file type by checking both MIME type and file signature
function validateFileType(buffer: Buffer, mimeType: string, fileName: string): boolean {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return false;
  }

  // Check file extension
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return false;
  }

  // Check file signature (magic numbers)
  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46, 0x38],
    webp: [0x52, 0x49, 0x46, 0x46] // RIFF
  };

  // Check JPEG signature
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    const jpegSig = signatures.jpeg;
    for (let i = 0; i < jpegSig.length; i++) {
      if (buffer[i] !== jpegSig[i]) return false;
    }
    return true;
  }

  // Check PNG signature
  if (mimeType === 'image/png') {
    const pngSig = signatures.png;
    for (let i = 0; i < pngSig.length; i++) {
      if (buffer[i] !== pngSig[i]) return false;
    }
    return true;
  }

  // Check GIF signature
  if (mimeType === 'image/gif') {
    const gifSig = signatures.gif;
    for (let i = 0; i < gifSig.length; i++) {
      if (buffer[i] !== gifSig[i]) return false;
    }
    return true;
  }

  // Check WebP signature (simplified check)
  if (mimeType === 'image/webp') {
    const webpSig = signatures.webp;
    for (let i = 0; i < webpSig.length; i++) {
      if (buffer[i] !== webpSig[i]) return false;
    }
    // Check for WEBP in bytes 8-11
    const webpMarker = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
    for (let i = 0; i < webpMarker.length; i++) {
      if (buffer[8 + i] !== webpMarker[i]) return false;
    }
    return true;
  }