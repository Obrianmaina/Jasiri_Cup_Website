// src/app/blog/page.tsx
import Image from "next/image";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

// Helper function to strip HTML tags from content
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

// Helper function to truncate a string to the nearest word boundary
const truncateDescription = (text: string, maxLength: number): string => {
  const plainText = stripHtmlTags(text);
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
  isFeatured?: boolean;
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
    const allPosts = data.data.map((post: BlogPostResponse) => ({
      id: post._id,
      imageSrc: (post.heroImage && post.heroImage.trim()) ? post.heroImage : DEFAULT_IMAGE,
      title: post.title,
      description: truncateDescription(post.content, 150),
      linkHref: `/blog/${post.slug}`,
    }));

    featuredPost = allPosts.find((post: any) => {
      const originalPost = data.data.find((p: BlogPostResponse) => p._id === post.id);
      return originalPost?.isFeatured;
    }) || null;

    if (!featuredPost && allPosts.length > 0) {
      const sortedPosts = data.data.sort((a: BlogPostResponse, b: BlogPostResponse) => {
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      });
      const mostRecentPost = sortedPosts[0];
      if (mostRecentPost) {
        featuredPost = {
          id: mostRecentPost._id,
          imageSrc: (mostRecentPost.heroImage && mostRecentPost.heroImage.trim()) ? mostRecentPost.heroImage : DEFAULT_HERO_IMAGE,
          title: mostRecentPost.title,
          description: truncateDescription(mostRecentPost.content, 200),
          linkHref: `/blog/${mostRecentPost.slug}`,
        };
      }
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
    linkHref: "#"
  };

  const heroContent = featuredPost || defaultHero;

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Dynamic Hero Section */}
      <section className="relative bg-gray-100 rounded-lg p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 pr-0 md:pr-8 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
            {heroContent.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            {heroContent.description}
          </p>
          <a
            href={heroContent.linkHref}
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors"
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
          />
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">
          Latest Posts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {error && <p className="text-red-500 text-center col-span-full">{error}</p>}
          {blogPosts.length > 0 ? (
            blogPosts.map(post => (
              <BlogPostCard
                key={post.id}
                imageSrc={post.imageSrc}
                title={post.title}
                description={post.description}
                linkHref={post.linkHref}
              />
            ))
          ) : (
            !error && <p className="text-gray-500 text-center col-span-full">No blog posts found.</p>
          )}
        </div>
      </section>
    </div>
  );
}