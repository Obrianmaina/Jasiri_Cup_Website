// src/lib/models/Transaction.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  donorName?: string;
  donorEmail?: string;
  receiptUrl?: string; // Cloudinary link for transparency/proof
  status: 'completed' | 'voided'; // Soft-delete for accounting audit trails
  paymentMethod: string;
  referenceNumber?: string; // e.g., M-Pesa code, Bank Transfer ID
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    type: { 
      type: String, 
      enum: ['income', 'expense'], 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
      // e.g., 'Grant', 'Individual Donation', 'Merchandise', 'Logistics', 'Tax', 'Operations'
    },
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: 'KES' 
    },
    date: { 
      type: Date, 
      required: true, 
      default: Date.now 
    },
    description: { 
      type: String, 
      required: true 
    },
    donorName: { 
      type: String 
    },
    donorEmail: { 
      type: String 
    },
    receiptUrl: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ['completed', 'voided'], 
      default: 'completed' 
    },
    paymentMethod: { 
      type: String, 
      required: true 
      // e.g., 'M-Pesa', 'Bank Transfer', 'Cash', 'Stripe'
    },
    referenceNumber: { 
      type: String 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);