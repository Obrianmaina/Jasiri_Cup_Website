// src/app/page.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { AboutSection } from "@/components/home/AboutSection";
import { VisionMissionCards } from "@/components/home/VisionMissionCards";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import React, { useState, useEffect } from 'react';

// Helper function to strip HTML tags and Markdown formatting
const stripFormatting = (text: string): string => {
  if (!text) return '';
  // Remove HTML tags
  let cleanText = text.replace(/<[^>]*>/g, '');
  // Remove basic Markdown characters (headers, bold, italic, links, etc.)
  cleanText = cleanText.replace(/[#*`>_[\]()]/g, '');
  // Clean up any extra whitespace left behind
  return cleanText.replace(/\s+/g, ' ').trim();
};

const truncateDescription = (text: string, maxLength: number): string => {
  const plainText = stripFormatting(text);
  if (plainText.length <= maxLength) return plainText;
  const truncatedText = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  return lastSpaceIndex > -1 ? truncatedText.substring(0, lastSpaceIndex) + '...' : truncatedText + '...';
};

interface BlogPostResponse {
  _id: string;
  heroImage: string;
  title: string;
  content: string;
  slug: string;
  publishedDate: string;
  status: string;
}

interface BannerPost {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  linkHref: string;
}

interface HomeContent {
  about: { title: string; content: string; imageSrc: string };
  vision: { title: string; content: string };
  mission: { title: string; content: string };
}

const DEFAULT_BANNER_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png";

const FALLBACK_HOME: HomeContent = {
  about: {
    title: 'About JasiriCup',
    content: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
    imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082804/about-jasiricup_y8uq1m.png'
  },
  vision: {
    title: 'Jasiri Initiative Vision',
    content: 'Empowering girls through sustainable menstrual solutions and comprehensive education.'
  },
  mission: {
    title: 'Jasiri Initiative Mission',
    content: 'To provide safe, eco-friendly menstrual products and health resources to underserved communities.'
  }
};

export default function HomePage() {
  const [blogPosts, setBlogPosts] = useState<BannerPost[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent>(FALLBACK_HOME);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [blogRes, contentRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog`, { method: "GET" }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/site-content?page=home`, { method: "GET" })
        ]);

        // Handle Blog Data
        if (blogRes.ok) {
          const blogData = await blogRes.json();
          const publishedPosts = blogData.data
            .filter((post: BlogPostResponse) => post.status === 'published')
            .sort((a: BlogPostResponse, b: BlogPostResponse) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
            .slice(0, 3);

          if (publishedPosts.length > 0) {
            setBlogPosts(publishedPosts.map((post: BlogPostResponse) => ({
              id: post._id,
              imageSrc: (post.heroImage && post.heroImage.trim()) ? post.heroImage : DEFAULT_BANNER_IMAGE,
              title: post.title,
              description: truncateDescription(post.content, 180),
              linkHref: `/blog/${post.slug}`,
            })));
          } else {
            setBlogPosts([{ id: "fallback-1", imageSrc: DEFAULT_BANNER_IMAGE, title: "Empowering Girls", description: "Providing resources for self-sufficiency.", linkHref: "/blog" }]);
          }
        }

        // Handle Home Page CMS Data
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          const mainSection = contentData.data?.find((d: { section: string }) => d.section === 'main');
          if (mainSection?.content) {
            setHomeContent({ ...FALLBACK_HOME, ...mainSection.content });
          }
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        setBlogPosts([{ id: "fallback-1", imageSrc: DEFAULT_BANNER_IMAGE, title: "Empowering Girls", description: "Providing resources.", linkHref: "/blog" }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || blogPosts.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % blogPosts.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [mounted, blogPosts.length]);

  const currentBanner = blogPosts.length > 0 ? blogPosts[currentBannerIndex] : null;
  const homeBreadcrumbs = [{ label: 'Home', href: '/' }];

  if (!mounted || loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-8">
        <Breadcrumbs items={homeBreadcrumbs} />
        <div className="relative bg-gray-100 rounded-lg p-6 mb-6 flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  const bannerImageSrc = currentBanner?.imageSrc && currentBanner.imageSrc.trim() ? currentBanner.imageSrc : DEFAULT_BANNER_IMAGE;

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-4">
      <Breadcrumbs items={homeBreadcrumbs} />
      
      {/* Hero Section */}
      <section className="relative bg-gray-100 rounded-lg mb-6 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          <div className="w-full lg:w-2/3 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 leading-tight">
              {currentBanner?.title || "Welcome to JasiriCup"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              {currentBanner?.description}
            </p>
            <Link href={currentBanner?.linkHref || "/blog"} passHref>
              <button className="bg-violet-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-purple-700 transition-colors">
                Read More
              </button>
            </Link>
          </div>
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[280px] aspect-square rounded-lg shadow-lg overflow-hidden">
              <Image src={bannerImageSrc} alt={currentBanner?.title || "Banner"} fill style={{ objectFit: 'cover' }} priority={currentBannerIndex === 0} sizes="(max-width: 768px) 280px, 280px" className="rounded-lg" />
            </div>
          </div>
        </div>
        {blogPosts.length > 1 && (
          <div className="flex justify-center space-x-2 pb-4 sm:pb-6">
            {blogPosts.map((_, index) => (
              <button key={index} onClick={() => setCurrentBannerIndex(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentBannerIndex ? 'bg-violet-600' : 'bg-gray-400'}`} aria-label={`Go to slide ${index + 1}`} />
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <AboutSection 
        title={homeContent.about.title} 
        content={homeContent.about.content} 
        imageUrl={homeContent.about.imageSrc} 
      />

      {/* Vision & Mission Cards */}
      <VisionMissionCards 
        vision={homeContent.vision} 
        mission={homeContent.mission} 
      />
    </div>
  );
}