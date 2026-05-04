// src/app/blog/page.tsx
import Image from "next/image";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BlogSearchClient } from "@/components/blog/BlogSearchClient"; 

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

interface BlogPostResponse {
  _id: string;
  heroImage: string;
  title: string;
  content: string;
  slug: string;
  author?: string;
  publishedDate: string;
  featured?: boolean;
  status: string;
}

const DEFAULT_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/forest_ganolr.png";
const DEFAULT_HERO_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png";

export default async function BlogPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
  ];

  let blogPosts: BlogPost[] = [];
  let featuredPost: BlogPost | null = null;
  let error: string | null = null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog`, {
      method: "GET",
      next: { tags: ["blog-posts"] },
    });

    if (!response.ok) throw new Error('Failed to fetch blog posts');
    const data = await response.json();
    
    const publishedPosts = data.data
      .filter((post: BlogPostResponse) => post.status === 'published')
      .sort((a: BlogPostResponse, b: BlogPostResponse) => {
        const dateA = new Date(a.publishedDate).getTime();
        const dateB = new Date(b.publishedDate).getTime();
        return dateB - dateA; 
      });

    const allPosts = publishedPosts.map((post: BlogPostResponse) => ({
      id: post._id,
      imageSrc: (post.heroImage && post.heroImage.trim()) ? post.heroImage : DEFAULT_IMAGE,
      title: post.title,
      description: truncateDescription(post.content, 150),
      linkHref: `/blog/${post.slug}`,
    }));

    const featuredPostData = publishedPosts.find((post: BlogPostResponse) => post.featured === true);
    
    if (featuredPostData) {
      featuredPost = {
        id: featuredPostData._id,
        imageSrc: (featuredPostData.heroImage && featuredPostData.heroImage.trim()) 
          ? featuredPostData.heroImage 
          : DEFAULT_HERO_IMAGE,
        title: featuredPostData.title,
        description: truncateDescription(featuredPostData.content, 200),
        linkHref: `/blog/${featuredPostData.slug}`,
      };
    } 
    else if (publishedPosts.length > 0) {
      const latestPost = publishedPosts[0];
      featuredPost = {
        id: latestPost._id,
        imageSrc: (latestPost.heroImage && latestPost.heroImage.trim()) 
          ? latestPost.heroImage 
          : DEFAULT_HERO_IMAGE,
        title: latestPost.title,
        description: truncateDescription(latestPost.content, 200),
        linkHref: `/blog/${latestPost.slug}`,
      };
    }

    if (featuredPost) {
      blogPosts = allPosts.filter((post: BlogPost) => post.id !== featuredPost!.id);
    } else {
      blogPosts = allPosts;
    }

  } catch (err) {
    console.error('Error fetching blog posts:', err);
    error = 'Failed to load blog posts. Please try again later.';
  }

  const defaultHero = {
    title: "Sustainable Periods",
    description: "This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.",
    imageSrc: DEFAULT_HERO_IMAGE,
    linkHref: "/blog"
  };

  const heroContent = featuredPost || defaultHero;

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Dynamic Hero Section */}
      <section className="relative bg-gray-100 dark:bg-gray-800/50 rounded-lg p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-center justify-between transition-colors duration-300">
        <div className="w-full md:w-1/2 pr-0 md:pr-8 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800 dark:text-white transition-colors">
            {heroContent.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 transition-colors">
            {heroContent.description}
          </p>
          <a
            href={heroContent.linkHref}
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
          >
            Read More
          </a>
        </div>
        <div className="w-full md:w-1/2 mt-6 md:mt-0 flex justify-center md:justify-end">
          <Image
            src={heroContent.imageSrc}
            alt={`${heroContent.title} Hero Image`}
            width={250}
            height={400}
            className="rounded-lg shadow-lg max-w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section>
        <BlogSearchClient posts={blogPosts} error={error} />
      </section>
    </div>
  );
}