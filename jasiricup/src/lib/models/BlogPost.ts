import mongoose from 'mongoose';
import slugify from 'slugify';

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for this blog post.'],
      maxlength: [200, 'Title cannot be more than 200 characters'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    author: {
      // Made flexible - can be either a string or leave it as string for simplicity
      type: String,
      default: 'Anonymous',
      trim: true,
    },
    heroImage: {
      type: String, // Cloudinary or any image URL
      default: '',
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
      maxlength: [200, 'Meta description cannot be more than 200 characters'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags) {
          return tags.length <= 10; // Maximum 10 tags
        },
        message: 'Cannot have more than 10 tags'
      }
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
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    }
  },
  { 
    timestamps: true, // Adds createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🔥 Auto-generate slug from title if not provided
BlogPostSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// 🔥 Ensure slug uniqueness by adding number suffix if needed
BlogPostSchema.pre('save', async function (next) {
  if (!this.isModified('slug')) return next();
  
  let originalSlug = this.slug;
  let counter = 1;
  
  // Check if slug already exists
  while (await mongoose.models.BlogPost.findOne({ slug: this.slug, _id: { $ne: this._id } })) {
    this.slug = `${originalSlug}-${counter}`;
    counter++;
  }
  
  next();
});

// 🔥 Virtual for reading time estimation
BlogPostSchema.virtual('readingTime').get(function() {
  if (!this.content) return 0;
  
  // Remove HTML tags and count words
  const text = this.content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
  
  return readingTime;
});

// 🔥 Index for better performance
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1, publishedDate: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ featured: -1, publishedDate: -1 });

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);