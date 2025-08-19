import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters.']
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please fill a valid email address.'
    ],
    maxlength: [254, 'Email cannot be more than 254 characters.']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required.'],
    trim: true,
    maxlength: [200, 'Topic cannot be more than 200 characters.']
  },
  message: {
    type: String,
    required: [true, 'Message is required.'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters.']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
