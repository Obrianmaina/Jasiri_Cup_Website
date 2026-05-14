import mongoose, { Document, Model } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  name?: string;
  active: boolean;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    active: {
      type: Boolean,
      default: true, // Set to false when they unsubscribe
    },
    source: {
      type: String,
      default: 'website',
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent Mongoose from compiling the model multiple times in Next.js development
const Subscriber: Model<ISubscriber> = 
  mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);

export default Subscriber;