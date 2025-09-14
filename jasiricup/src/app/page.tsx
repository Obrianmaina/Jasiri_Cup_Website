// src/app/page.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { ImpactStoryCard } from "@/components/home/ImpactStoryCard";
import { AboutSection } from "@/components/home/AboutSection";
import { VisionMissionCards } from "@/components/home/VisionMissionCards";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import React, { useState, useEffect } from 'react';

// Helper function to strip HTML tags from content
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

// Helper function to truncate a string to the nearest word boundary
const truncateDescription = (text: string, maxLength: number): string => {
  const plainText = stripHtmlTags(text);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
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

const DEFAULT_BANNER_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png";

export default function HomePage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fallback banner data in case no blog posts are available
  const fallbackBannerData = [
    {
      id: "fallback-1",
      imageSrc: "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png",
      alt: "Empowering Girls Through Education Banner",
      title: "Empowering Girls Through Education",
      description: "This initiative targets girls in rural areas (ASAL regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.",
      linkHref: "/blog"
    },
    {
      id: "fallback-2",
      imageSrc: "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-5_ljvnx3.png",
      alt: "Building Sustainable Futures Banner",
      title: "Building Sustainable Futures",
      description: "We focus on long-term solutions, providing resources and support to foster self-sufficiency and community growth in underserved areas.",
      linkHref: "/blog"
    },
    {
      id: "fallback-3",
      imageSrc: "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-1_dmdt6w.png",
      alt: "Community Engagement & Support Banner",
      title: "Community Engagement & Support",
      description: "Our programs thrive on active community participation, ensuring that solutions are culturally relevant and effectively meet local needs.",
      linkHref: "/blog"
    }
  ];

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch blog posts on component mount
  useEffect(() => {
    if (!mounted) return;
    
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog`, {
          method: "GET",
          next: { tags: ["blog-posts"] },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }

        const data = await response.json();
        
        console.log('Home page: API returned', data.data?.length || 0, 'posts');

        // Filter published posts and get top 3 most recent
        const publishedPosts = data.data
          .filter((post: BlogPostResponse) => post.status === 'published')
          .sort((a: BlogPostResponse, b: BlogPostResponse) => {
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
          })
          .slice(0, 3); // Take only top 3 for banner rotation

        console.log('Home page: Using', publishedPosts.length, 'published posts for banner');

        const formattedPosts = publishedPosts.map((post: BlogPostResponse) => ({
          id: post._id,
          imageSrc: (post.heroImage && post.heroImage.trim()) ? post.heroImage : DEFAULT_BANNER_IMAGE,
          title: post.title,
          description: truncateDescription(post.content, 180),
          linkHref: `/blog/${post.slug}`,
        }));

        // Use blog posts if we have them, otherwise use fallback
        if (formattedPosts.length > 0) {
          setBlogPosts(formattedPosts);
          console.log('Home page: Set banner posts:', formattedPosts.map(p => p.title));
        } else {
          // Convert fallback data to BlogPost format
          const fallbackPosts = fallbackBannerData.map(banner => ({
            id: banner.id,
            imageSrc: banner.imageSrc,
            title: banner.title,
            description: banner.description,
            linkHref: banner.linkHref,
          }));
          setBlogPosts(fallbackPosts);
          console.log('Home page: Using fallback banner data');
        }

      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load latest posts');
        
        // Use fallback data on error
        const fallbackPosts = fallbackBannerData.map(banner => ({
          id: banner.id,
          imageSrc: banner.imageSrc,
          title: banner.title,
          description: banner.description,
          linkHref: banner.linkHref,
        }));
        setBlogPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [mounted]);

  // Set up banner rotation only after component is mounted and we have posts
  useEffect(() => {
    if (!mounted || blogPosts.length <= 1) return;

    console.log(`Home page: Starting banner rotation with ${blogPosts.length} posts`);

    const intervalId = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % blogPosts.length;
        console.log(`Banner rotating from ${prevIndex} to ${nextIndex}: ${blogPosts[nextIndex]?.title}`);
        return nextIndex;
      });
    }, 5000);

    return () => {
      console.log('Home page: Clearing banner rotation interval');
      clearInterval(intervalId);
    };
  }, [mounted, blogPosts.length]);

  // Get current banner
  const currentBanner = blogPosts.length > 0 ? blogPosts[currentBannerIndex] : null;

  // Define breadcrumb items for the Home page
  const homeBreadcrumbs = [{ label: 'Home', href: '/' }];

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-4">
        <div className="flex py-4">
          <nav className="flex py-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <span className="text-sm font-medium text-gray-500">
                  Home
                </span>
              </li>
            </ol>
          </nav>
        </div>
        <div className="relative bg-gray-100 rounded-lg p-6 mb-6 flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading latest stories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-8">
        <Breadcrumbs items={homeBreadcrumbs} />
        <div className="relative bg-gray-100 rounded-lg p-6 mb-6 flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading latest stories...</p>
          </div>
        </div>
      </div>
    );
  }

  // Ensure current banner has a valid image
  const bannerImageSrc = currentBanner?.imageSrc && currentBanner.imageSrc.trim()
    ? currentBanner.imageSrc 
    : DEFAULT_BANNER_IMAGE;

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-4">
      <Breadcrumbs items={homeBreadcrumbs} />

      {/* Hero Section - Dynamic Banner with Recent Blog Posts - Mobile Optimized */}
      <section className="relative bg-gray-100 rounded-lg mb-6 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Text Content */}
          <div className="w-full lg:w-2/3 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 leading-tight">
              {currentBanner?.title || "Welcome to JasiriCup"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              {currentBanner?.description || "Empowering women through education and sustainable menstrual products."}
            </p>
            <Link href={currentBanner?.linkHref || "/blog"} passHref>
              <button className="bg-violet-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-purple-700 transition-colors text-sm sm:text-base">
                Read More
              </button>
            </Link>
          </div>
          
          {/* Image */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[280px] aspect-square rounded-lg shadow-lg overflow-hidden">
              <Image
                src={bannerImageSrc}
                alt={currentBanner?.title || "JasiriCup Banner"}
                fill
                style={{ objectFit: 'cover' }}
                priority={currentBannerIndex === 0}
                sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 280px"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
        
        {/* Pagination Dots - Show only if we have multiple posts */}
        {blogPosts.length > 1 && (
          <div className="flex justify-center space-x-2 pb-4 sm:pb-6">
            {blogPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log(`Manual banner switch to index ${index}: ${blogPosts[index]?.title}`);
                  setCurrentBannerIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentBannerIndex ? 'bg-violet-600' : 'bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm sm:text-base">
          <p>{error}. Showing default content.</p>
        </div>
      )}

      {/* About JasiriCup Section - Mobile Optimized */}
      <AboutSection imageUrl="https://res.cloudinary.com/dsvexizbx/image/upload/v1754082804/about-jasiricup_y8uq1m.png" />

      {/* Vision & Mission Section - Already mobile responsive */}
      <VisionMissionCards />
    </div>
  );
}