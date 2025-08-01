import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this user.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  role: {
    type: String,
    required: false, // e.g., "Team Member", "Founder"
  },
  description: {
    type: String,
    required: false,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  image: {
    type: String, // This field will store the Cloudinary URL for the user's image
    required: false,
  },
  // Add other user/team member specific fields
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
