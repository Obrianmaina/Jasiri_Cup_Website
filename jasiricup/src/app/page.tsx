'use client'; // This component uses client-side hooks like useState and useEffect

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
  // First strip HTML tags, then truncate
  const plainText = stripHtmlTags(text);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  // Find the last space within the limit
  const truncatedText = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  // Return the truncated string up to the last space, plus an ellipsis
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
}

export default function HomePage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback banner data in case no blog posts are available
  const fallbackBannerData = [
    {
      id: 1,
      imageSrc: "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png",
      alt: "Empowering Girls Through Education Banner",
      title: "Empowering Girls Through Education",
      description: "This initiative targets girls in rural areas (ASAL regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.",
      linkHref: "/blog"
    },
    {
      id: 2,
      imageSrc: "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-5_ljvnx3.png",
      alt: "Building Sustainable Futures Banner",
      title: "Building Sustainable Futures",
      description: "We focus on long-term solutions, providing resources and support to foster self-sufficiency and community growth in underserved areas.",
      linkHref: "/blog"
    },
    {
      id: 3,
      imageSrc: "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-1_dmdt6w.png",
      alt: "Community Engagement & Support Banner",
      title: "Community Engagement & Support",
      description: "Our programs thrive on active community participation, ensuring that solutions are culturally relevant and effectively meet local needs.",
      linkHref: "/blog"
    }
  ];

  // Fetch blog posts on component mount
  useEffect(() => {
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
        
        // Sort by publishedDate (most recent first) and take only the first 3
        const sortedPosts = data.data
          .sort((a: BlogPostResponse, b: BlogPostResponse) => {
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
          })
          .slice(0, 3); // Get only the 3 most recent posts

        const formattedPosts = sortedPosts.map((post: BlogPostResponse) => ({
          id: post._id,
          imageSrc: post.heroImage || fallbackBannerData[0].imageSrc, // Fallback image if no heroImage
          title: post.title,
          description: truncateDescription(post.content, 150),
          linkHref: `/blog/${post.slug}`,
        }));

        setBlogPosts(formattedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
        // Use fallback data if fetch fails
        setBlogPosts(fallbackBannerData.map(banner => ({
          id: banner.id.toString(),
          imageSrc: banner.imageSrc,
          title: banner.title,
          description: banner.description,
          linkHref: banner.linkHref,
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Set up banner rotation
  useEffect(() => {
    if (blogPosts.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % blogPosts.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(intervalId);
  }, [blogPosts.length]);

  // Get current banner (blog post or fallback)
  const currentBanner = blogPosts.length > 0 ? blogPosts[currentBannerIndex] : fallbackBannerData[currentBannerIndex];

  // Define breadcrumb items for the Home page
  const homeBreadcrumbs = [{ label: 'Home', href: '/' }];

  if (loading) {
    return (
      <div className="container mx-auto px-16 py-8">
        <Breadcrumbs items={homeBreadcrumbs} />
        <div className="relative bg-gray-100 rounded-lg p-6 mb-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading latest stories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-16 py-4">
      {/* Add Breadcrumbs component here */}
      <Breadcrumbs items={homeBreadcrumbs} />

      {/* Hero Section - Dynamic Banner with Recent Blog Posts */}
      <section className="relative bg-gray-100 rounded-lg mb-6 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 pr-12">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              {currentBanner.title}
            </h1>
            <p className="text-base text-gray-600 mb-4">
              {currentBanner.description}
            </p>
            <Link href={currentBanner.linkHref} passHref>
              <button className="bg-violet-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors">
                Read More
              </button>
            </Link>
          </div>
          
          {/* Image Container */}
          <div className="md:w-1/2 mt-4 md:mt-0 flex justify-end">
            <div className="relative w-full max-w-xs aspect-square rounded-lg shadow-lg overflow-hidden">
              <Image
                src={currentBanner.imageSrc}
                alt={currentBanner.title}
                fill
                style={{ objectFit: 'cover' }}
                priority={currentBannerIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
                onError={(e) => {
                  console.error(`Error loading image: ${currentBanner.imageSrc}`, e);
                }}
                onLoad={() => {
                  console.log(`Image loaded successfully: ${currentBanner.imageSrc}`);
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Centered Pagination Dots at Bottom */}
        {blogPosts.length > 1 && (
          <div className="flex justify-center space-x-2 pb-6">
            {blogPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}. Showing default content.</p>
        </div>
      )}

      {/* About JasiriCup Section */}
      <AboutSection imageUrl="https://res.cloudinary.com/dsvexizbx/image/upload/v1754082804/about-jasiricup_y8uq1m.png" />

      {/* Vision & Mission Section */}
      <VisionMissionCards />
    </div>
  );
}