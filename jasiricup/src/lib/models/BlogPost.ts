import mongoose from 'mongoose';
import slugify from 'slugify';

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for this blog post.'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: true,
    },
    heroImage: {
      type: String, // Cloudinary or any image URL
    },
    content: {
      type: String, // HTML output from your BlockEditor
      required: [true, 'Please provide content for this blog post.'],
    },
    blocks: {
      type: Array, // Optional: structured block data from BlockEditor
      default: [],
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

// 🔥 Auto-generate slug from title if not provided
BlogPostSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
