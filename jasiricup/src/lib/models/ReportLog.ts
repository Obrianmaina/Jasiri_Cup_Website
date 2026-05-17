// src/lib/models/ReportLog.ts
import mongoose from 'mongoose';

const ReportLogSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    periodLabel: { type: String, required: true },
    preparedBy: { type: String, required: true },
    totalIncome: { type: Number, required: true, default: 0 },
    totalExpense: { type: Number, required: true, default: 0 },
    netBalance: { type: Number, required: true, default: 0 },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.ReportLog || mongoose.model('ReportLog', ReportLogSchema);