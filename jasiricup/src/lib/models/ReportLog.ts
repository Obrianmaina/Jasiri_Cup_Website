// src/lib/models/ReportLog.ts
import mongoose from 'mongoose';

const ReportLogSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    periodLabel: { type: String, required: true },
    preparedBy: { type: String, required: true },
    generatedByEmail: { type: String, required: true }, // ADDED: Now Mongoose will save the email
    totalIncome: { type: Number, required: true, default: 0 },
    totalExpense: { type: Number, required: true, default: 0 },
    netBalance: { type: Number, required: true, default: 0 },
    // Add these to your Mongoose Schema definition
  preparedBySignature: { type: String, required: false },
  authorizedSignatorySignature: { type: String, required: false },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.ReportLog || mongoose.model('ReportLog', ReportLogSchema);