// src/app/page.tsx
import { AboutSection } from "@/components/home/AboutSection";
import { VisionMissionCards } from "@/components/home/VisionMissionCards";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { StatsSection } from "@/components/home/StatsSection";
import { HeroBanner } from "@/components/home/HeroBanner";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import SiteContent from "@/lib/models/SiteContent";

export const revalidate = 60; 

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
  return lastSpaceIndex > -1 ? truncatedText.substring(0, lastSpaceIndex) + '...' : truncatedText + '...';
};

interface HomeContent {
  about: { title: string; content: string; imageSrc: string };
  vision: { title: string; content: string };
  mission: { title: string; content: string };
  stats: {
    title: string;
    description: string;
    numbers: { label: string; value: string }[];
  };
}

interface IBlogPostDoc {
  _id: { toString: () => string };
  heroImage?: string;
  title: string;
  content: string;
  slug: string;
}

interface ISiteContentDoc {
  content?: Partial<HomeContent>;
}

interface BannerData {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  linkHref: string;
}

// Add this line right here!
const DEFAULT_BANNER_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png";

async function getHomeData() {
  try {
    await connectDB();
    
    const [postsRes, contentRes] = await Promise.all([
      BlogPost.find({ status: 'published' })
        .sort({ publishedDate: -1 })
        .limit(3)
        .lean() as unknown as IBlogPostDoc[],
      SiteContent.findOne({ page: 'home', section: 'main' })
        .lean() as unknown as ISiteContentDoc | null
    ]);

    // 2. Explicitly tell TypeScript that this array holds BannerData objects
    let banners: BannerData[] = [];
    
    if (postsRes && postsRes.length > 0) {
      banners = postsRes.map((post: IBlogPostDoc) => ({
        id: post._id.toString(),
        imageSrc: post.heroImage?.trim() ? post.heroImage : "",
        title: post.title,
        description: truncateDescription(post.content, 180),
        linkHref: `/blog/${post.slug}`,
      }));
    } else {
      // THE FIX: Provide a default, permanent welcome slide if there are no blog posts
      banners = [{
        id: "default-welcome-banner",
        imageSrc: DEFAULT_BANNER_IMAGE,
        title: "Welcome to JasiriCup",
        description: "Empowering girls through sustainable menstrual solutions and comprehensive education. Discover our mission to keep girls in school.",
        linkHref: "/product", // Redirects to the product page instead of a non-existent blog
      }];
    }

    const homeContent = contentRes?.content ? (contentRes.content as HomeContent) : null;

    return { banners, homeContent };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { banners: [], homeContent: null };
  }
}

export default async function HomePage() {
  const { banners, homeContent } = await getHomeData();
  const homeBreadcrumbs = [{ label: 'Home', href: '/' }];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-4">
      <Breadcrumbs items={homeBreadcrumbs} />
      
      {banners.length > 0 && <HeroBanner banners={banners} />}

      {homeContent ? (
        <>
          <AboutSection 
            title={homeContent.about.title} 
            content={homeContent.about.content} 
            imageUrl={homeContent.about.imageSrc} 
          />
          <VisionMissionCards 
            vision={homeContent.vision} 
            mission={homeContent.mission} 
          />
          {homeContent.stats && homeContent.stats.numbers && (
            <StatsSection 
              stats={homeContent.stats.numbers}
              ctaTitle={homeContent.stats.title}
              ctaDescription={homeContent.stats.description}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to JasiriCup</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We are currently updating our homepage content. Please check back shortly to learn more about our mission and initiatives.
          </p>
        </div>
      )}
    </div>
  );
}