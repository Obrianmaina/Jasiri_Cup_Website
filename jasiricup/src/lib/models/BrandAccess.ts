// src/lib/models/BrandAccess.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandAccess extends Document {
  email: string;
  name?: string;
  organization?: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  accessToken?: string;
  requestedAt: Date;
  approvedAt?: Date;
  expiresAt?: Date;
  lastAccessedAt?: Date;
}

const BrandAccessSchema = new Schema<IBrandAccess>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    name: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Please provide a reason for accessing the brand kit'],
      trim: true,
      maxlength: [500, 'Purpose cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    accessToken: {
      type: String,
      unique: true,
      sparse: true, 
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation warning in Next.js development
const BrandAccess = mongoose.models.BrandAccess || mongoose.model<IBrandAccess>('BrandAccess', BrandAccessSchema);

export default BrandAccess;