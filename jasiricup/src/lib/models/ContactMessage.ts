import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the contact message.'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  topic: {
    type: String,
    required: [true, 'Please provide a topic for the contact message.'],
    maxlength: [100, 'Topic cannot be more than 100 characters'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a message for the contact message.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
