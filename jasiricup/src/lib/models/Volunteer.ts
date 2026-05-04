import mongoose, { Document } from 'mongoose';

interface IVolunteer extends Document {
  name: string;
  email: string;
  phone: string;
  roles: string[];
  message: string;
  status: 'pending' | 'contacted';
}

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  roles: [{ type: String }],
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'contacted'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.Volunteer || mongoose.model<IVolunteer>('Volunteer', VolunteerSchema);