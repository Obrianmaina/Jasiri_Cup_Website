import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this blog post.'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug for this blog post.'],
    unique: true,
  },
  author: {
    type: String,
    required: false,
  },
  heroImage: {
    type: String, // This field will store the Cloudinary URL for the hero image
    required: false,
  },
  content: {
    type: String, // HTML content of the blog post
    required: [true, 'Please provide content for this blog post.'],
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  // Add other blog post-specific fields as needed
});

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
