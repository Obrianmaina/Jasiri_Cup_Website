import mongoose, { Document } from 'mongoose';
import slugify from 'slugify';

// Document interface for typing `this` in hooks and virtuals
interface IBlogPost extends Document {
  title: string;
  slug: string;
  author: string;
  heroImage: string;
  content: string;
  blocks: ContentBlock[];
  metaDescription: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedDate: Date | null;
  featured: boolean;
  viewCount: number;
  ipAddress: string;
  lastModifiedBy: string;
}

// Typed interfaces to replace `any`
interface ContentBlock {
  type: string;
  content?: string;
  [key: string]: unknown;
}

interface BlogPostDocument {
  ipAddress?: string;
  __v?: number;
  [key: string]: unknown;
}

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for this blog post.'],
      maxlength: [200, 'Title cannot be more than 200 characters'],
      trim: true,
      validate: {
        validator: function(title: string) {
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
          if (!url) return true;
          return /^https:\/\/res\.cloudinary\.com\//.test(url) || /^data:image\//.test(url);
        },
        message: 'Invalid image URL, only Cloudinary URLs are allowed'
      }
    },
    content: {
      type: String,
      required: [true, 'Please provide content for this blog post.'],
      maxlength: [50000, 'Content cannot be more than 50,000 characters']
    },
    blocks: {
      type: Array,
      default: [],
      validate: {
        validator: function(blocks: ContentBlock[]) {
          return blocks.length <= 100;
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
    ipAddress: {
      type: String,
      default: '',
      validate: {
        validator: function(ip: string) {
          if (!ip) return true;
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
      transform: function(_doc: unknown, ret: BlogPostDocument) {
        delete ret.ipAddress;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function(_doc: unknown, ret: BlogPostDocument) {
        delete ret.ipAddress;
        delete ret.__v;
        return ret;
      }
    }
  }
);

BlogPostSchema.pre('validate', function (this: IBlogPost, next) {
  if (this.title && !this.slug) {
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    if (baseSlug.length > 100) {
      baseSlug = baseSlug.substring(0, 100);
    }
    this.slug = baseSlug;
  }

  if (this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }

  if (this.status === 'draft') {
    this.publishedDate = null;
  }

  next();
});

BlogPostSchema.pre('save', async function (this: IBlogPost, next) {
  if (!this.isModified('slug')) return next();

  const originalSlug = this.slug;
  let counter = 1;

  while (await mongoose.models.BlogPost.findOne({
    slug: this.slug,
    _id: { $ne: this._id }
  })) {
    this.slug = `${originalSlug}-${counter}`;
    counter++;

    if (counter > 1000) {
      return next(new Error('Unable to generate unique slug'));
    }
  }

  next();
});

// Updated to clean up markdown characters for better reading time calculation
BlogPostSchema.virtual('readingTime').get(function (this: IBlogPost) {
  if (!this.content) return 0;

  // Stripping basic markdown characters
  const text = this.content.replace(/[#*`>_[\]()]/g, '');
  const wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  return Math.max(1, readingTime);
});

// Updated to clean up markdown characters for plain text excerpt
BlogPostSchema.virtual('excerpt').get(function (this: IBlogPost) {
  if (!this.content) return '';

  // Stripping basic markdown characters for a cleaner preview
  const text = this.content.replace(/[#*`>_[\]()]/g, '');
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
});

BlogPostSchema.index({ status: 1, publishedDate: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ featured: -1, publishedDate: -1 });
BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ createdAt: -1 });

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

BlogPostSchema.methods.incrementViews = function() {
  this.viewCount = (this.viewCount || 0) + 1;
  return this.save({ validateBeforeSave: false });
};

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);