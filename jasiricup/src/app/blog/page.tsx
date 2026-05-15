// src/app/blog/page.tsx
import Image from "next/image";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BlogSearchClient } from "@/components/blog/BlogSearchClient";
import connectDB from "@/lib/dbConnect";
import BlogPostModel from "@/lib/models/BlogPost";

export const revalidate = 60; // Cache for 60 seconds for instant loading

const stripFormatting = (text: string): string => {
  if (!text) return '';
  let cleanText = text.replace(/<[^>]*>/g, '');
  cleanText = cleanText.replace(/[#*`>_[\]()]/g, '');
  return cleanText.replace(/\s+/g, ' ').trim();
};

const truncateDescription = (text: string, maxLength: number): string => {
  const plainText = stripFormatting(text);
  if (plainText.length <= maxLength) return plainText;
  const truncatedText = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  return lastSpaceIndex > -1
    ? truncatedText.substring(0, lastSpaceIndex) + '...'
    : truncatedText + '...';
};

interface BlogPost {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  linkHref: string;
}

// Internal Interface for Mongoose response
interface IBlogPostDoc {
  _id: { toString: () => string };
  heroImage?: string;
  title: string;
  content: string;
  slug: string;
  publishedDate: Date;
  featured?: boolean;
}

const DEFAULT_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/forest_ganolr.png";
const DEFAULT_HERO_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png";

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
];

async function getBlogData() {
  try {
    await connectDB();
    const publishedPosts = await BlogPostModel.find({ status: 'published' })
      .sort({ publishedDate: -1 })
      .lean() as unknown as IBlogPostDoc[];

    return publishedPosts;
  } catch (error) {
    console.error('Error fetching blog posts directly from DB:', error);
    return [];
  }
}

export default async function BlogPage() {
  const rawPosts = await getBlogData();

  // Handle the Empty State if no articles are published
  if (!rawPosts || rawPosts.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-8 md:px-16 py-8">
        <Breadcrumbs items={breadcrumbs} />
        
        <div className="flex flex-col items-center justify-center py-24 text-center mt-8">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {/* Edit/Pencil Icon indicating authorship */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Articles in Progress</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Our team is currently authoring new stories and insights. Please check back soon for the latest updates on our impact, education, and initiatives.
          </p>
        </div>
      </div>
    );
  }

  // If we have posts, process them as normal
  const allPosts: BlogPost[] = rawPosts.map((post) => ({
    id: post._id.toString(),
    imageSrc: post.heroImage?.trim() ? post.heroImage : DEFAULT_IMAGE,
    title: post.title,
    description: truncateDescription(post.content, 150),
    linkHref: `/blog/${post.slug}`,
  }));

  // Find the featured post, or default to the newest post
  const featuredDoc = rawPosts.find((post) => post.featured === true) || rawPosts[0];
  
  const featuredPost: BlogPost = {
    id: featuredDoc._id.toString(),
    imageSrc: featuredDoc.heroImage?.trim() ? featuredDoc.heroImage : DEFAULT_HERO_IMAGE,
    title: featuredDoc.title,
    description: truncateDescription(featuredDoc.content, 200),
    linkHref: `/blog/${featuredDoc.slug}`,
  };

  // Remove the featured post from the general list so it doesn't duplicate
  const blogPosts = allPosts.filter((post) => post.id !== featuredPost.id);

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />

      <section className="relative bg-gray-100 dark:bg-gray-800/50 rounded-lg p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-center justify-between transition-colors duration-300">
        <div className="w-full md:w-1/2 pr-0 md:pr-8 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800 dark:text-white transition-colors">
            {featuredPost.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 transition-colors">
            {featuredPost.description}
          </p>
          <a
            href={featuredPost.linkHref}
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors shadow-sm"
          >
            Read Article
          </a>
        </div>
        <div className="w-full md:w-1/2 mt-8 md:mt-0 flex justify-center md:justify-end">
          <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <Image
              src={featuredPost.imageSrc}
              alt={featuredPost.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </section>

      <section>
        <BlogSearchClient posts={blogPosts} error={null} />
      </section>
    </div>
  );
}