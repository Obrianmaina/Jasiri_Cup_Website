// src/lib/models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this user.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email for this user.'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false, 
  },
  twoFactorSecret: {
    type: String,
    required: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    type: String,
    required: false,
  },
  // FIELDS FOR SECURE STAFF ONBOARDING
  setupToken: { 
    type: String, 
    required: false 
  },
  setupTokenExpires: { 
    type: Date, 
    required: false 
  },
// NEW: Advanced Admin Controls & Backdoor
  isRevoked: { type: Boolean, default: false },
  recoveryCode: { type: String, required: false },
  recoveryCodeExpires: { type: Date, required: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);