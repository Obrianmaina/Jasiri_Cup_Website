import mongoose from 'mongoose';
import slugify from 'slugify';
import DOMPurify from 'isomorphic-dompurify';

// Input sanitization helper
const sanitizeHtml = (content: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  } else {
    // Client-side: use DOMPurify
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target'],
      FORBID_SCRIPTS: true,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
      ALLOW_DATA_ATTR: false
    });
  }
};

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for this blog post.'],
      maxlength: [200, 'Title cannot be more than 200 characters'],
      trim: true,
      validate: {
        validator: function(title: string) {
          // Prevent potential XSS in title
          return !/[<>'"&]/.test(title);
        },
        message: 'Title contains invalid characters'
      }
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(slug: string) {
          // Validate slug format
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
        },
        message: 'Invalid slug format'
      }
    },
    author: {
      type: String,
      default: 'Admin',
      trim: true,
      maxlength: [100, 'Author name cannot be more than 100 characters'],
      validate: {
        validator: function(author: string) {
          return !/[<>'"&]/.test(author);
        },
        message: 'Author name contains invalid characters'
      }
    },
    heroImage: {
      type: String,
      default: '',
      validate: {
        validator: function(url: string) {
          if (!url) return true; // Empty is allowed
          // Only allow Cloudinary URLs or data URLs for uploads
          return /^https:\/\/res\.cloudinary\.com\//.test(url) || /^data:image\//.test(url);
        },
        message: 'Invalid image URL - only Cloudinary URLs are allowed'
      }
    },
    content: {
      type: String,
      required: [true, 'Please provide content for this blog post.'],
      maxlength: [50000, 'Content cannot be more than 50,000 characters'],
      set: function(content: string) {
        // Sanitize content before saving
        return sanitizeHtml(content);
      }
    },
    blocks: {
      type: Array,
      default: [],
      validate: {
        validator: function(blocks: any[]) {
          return blocks.length <= 100; // Limit number of blocks
        },
        message: 'Too many content blocks'
      }
    },
    metaDescription: {
      type: String,
      maxlength: [200, 'Meta description cannot be more than 200 characters'],
      trim: true,
      validate: {
        validator: function(desc: string) {
          return !desc || !/[<>'"&]/.test(desc);
        },
        message: 'Meta description contains invalid characters'
      }
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        {
          validator: function(tags: string[]) {
            return tags.length <= 10;
          },
          message: 'Cannot have more than 10 tags'
        },
        {
          validator: function(tags: string[]) {
            return tags.every(tag => 
              typeof tag === 'string' && 
              tag.length <= 50 && 
              /^[a-zA-Z0-9\s-]+$/.test(tag)
            );
          },
          message: 'Invalid tag format'
        }
      ]
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: 'Status must be either draft or published'
      },
      default: 'draft',
    },
    publishedDate: {
      type: Date,
      validate: {
        validator: function(date: Date) {
          // Published date cannot be in the future
          return !date || date <= new Date();
        },
        message: 'Published date cannot be in the future'
      }
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative']
    },
    // Security fields
    ipAddress: {
      type: String,
      default: '',
      validate: {
        validator: function(ip: string) {
          if (!ip) return true;
          // Basic IP validation
          const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
          const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
          return ipv4Regex.test(ip) || ipv6Regex.test(ip);
        },
        message: 'Invalid IP address format'
      }
    },
    lastModifiedBy: {
      type: String,
      default: 'system',
      trim: true,
      maxlength: [100, 'Last modified by cannot be more than 100 characters']
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.ipAddress;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.ipAddress;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-validation middleware
BlogPostSchema.pre('validate', function (next) {
  // Auto-generate slug from title if not provided
  if (this.title && !this.slug) {
    let baseSlug = slugify(this.title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Ensure slug is not too long
    if (baseSlug.length > 100) {
      baseSlug = baseSlug.substring(0, 100);
    }
    
    this.slug = baseSlug;
  }

  // Set published date for published posts
  if (this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }

  // Clear published date for drafts
  if (this.status === 'draft') {
    this.publishedDate = null;
  }

  next();
});

// Pre-save middleware for slug uniqueness
BlogPostSchema.pre('save', async function (next) {
  if (!this.isModified('slug')) return next();
  
  let originalSlug = this.slug;
  let counter = 1;
  
  // Ensure slug uniqueness
  while (await mongoose.models.BlogPost.findOne({ 
    slug: this.slug, 
    _id: { $ne: this._id } 
  })) {
    this.slug = `${originalSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loops
    if (counter > 1000) {
      return next(new Error('Unable to generate unique slug'));
    }
  }
  
  next();
});

// Virtual for reading time estimation
BlogPostSchema.virtual('readingTime').get(function() {
  if (!this.content) return 0;
  
  const text = this.content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
  
  return Math.max(1, readingTime); // Minimum 1 minute
});

// Virtual for excerpt
BlogPostSchema.virtual('excerpt').get(function() {
  if (!this.content) return '';
  
  const text = this.content.replace(/<[^>]*>/g, '');
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
});

// Indexes for better performance and security
BlogPostSchema.index({ status: 1, publishedDate: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ featured: -1, publishedDate: -1 });
BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ createdAt: -1 });

// Static methods for safe queries
BlogPostSchema.statics.findPublished = function() {
  return this.find({ status: 'published' })
    .sort({ publishedDate: -1 })
    .select('-ipAddress');
};

BlogPostSchema.statics.findBySlugPublished = function(slug: string) {
  return this.findOne({ 
    slug: slug, 
    status: 'published' 
  }).select('-ipAddress');
};

// Instance method to safely increment view count
BlogPostSchema.methods.incrementViews = function() {
  this.viewCount = (this.viewCount || 0) + 1;
  return this.save({ validateBeforeSave: false });
};

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);