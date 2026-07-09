// src/lib/models/Transaction.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'income' | 'expense';
  category: string;
  amount: number; // Always stored in KES for totals
  currency: string; // Always KES
  
  // Multi-currency tracking
  originalAmount?: number;
  originalCurrency?: 'USD' | 'EUR' | 'GBP';
  exchangeRate?: number; // KES per 1 unit of foreign currency
  
  // Auditing
  createdBy: string;
  
  date: Date;
  description: string;
  donorName?: string;
  donorEmail?: string;
  receiptUrl?: string;
  status: 'completed' | 'voided';
  
  // Void Tracking
  voidReason?: string;
  voidedBy?: string;

  paymentMethod: string;
  referenceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'KES' },
    
    originalAmount: { type: Number },
    originalCurrency: { type: String, enum: ['USD', 'EUR', 'GBP'] },
    exchangeRate: { type: Number },
    createdBy: { type: String, required: true },

    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    donorName: { type: String },
    donorEmail: { type: String },
    receiptUrl: { type: String },
    
    status: { type: String, enum: ['completed', 'voided'], default: 'completed' },
    voidReason: { type: String },
    voidedBy: { type: String },
    
    paymentMethod: { type: String, required: true },
    referenceNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);