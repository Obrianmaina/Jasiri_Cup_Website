// src/lib/models/SiteContent.ts
import mongoose, { Document } from 'mongoose';

interface ISiteContent extends Document {
  page: string;
  section: string;
  content: Record<string, unknown>;
  updatedAt: Date;
}

const SiteContentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: [true, 'Page identifier is required'],
      trim: true,
      maxlength: [100, 'Page identifier cannot exceed 100 characters'],
    },
    section: {
      type: String,
      required: [true, 'Section identifier is required'],
      trim: true,
      maxlength: [100, 'Section identifier cannot exceed 100 characters'],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Content is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique page+section combinations
SiteContentSchema.index({ page: 1, section: 1 }, { unique: true });

export default mongoose.models.SiteContent || mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);