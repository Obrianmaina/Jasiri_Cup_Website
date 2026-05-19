import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer'],
  },
  category: {
    type: String,
    enum: ['General', 'Product', 'Donation', 'Volunteer'],
    default: 'General',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

export default mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);