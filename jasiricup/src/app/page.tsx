// src/app/page.tsx
import { AboutSection } from "@/components/home/AboutSection";
import { VisionMissionCards } from "@/components/home/VisionMissionCards";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { StatsSection } from "@/components/home/StatsSection";
import { HeroBanner } from "@/components/home/HeroBanner";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import SiteContent from "@/lib/models/SiteContent";

// Tell Next.js to revalidate this page's cache periodically so it stays fast
export const revalidate = 60; 

// Helper function to strip HTML tags and Markdown formatting
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

const DEFAULT_BANNER_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082805/impact-story-hero_ilth4o.png";

const FALLBACK_HOME: HomeContent = {
  about: {
    title: 'About JasiriCup',
    content: 'This initiative targets girls in rural areas...',
    imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082804/about-jasiricup_y8uq1m.png'
  },
  vision: {
    title: 'Jasiri Initiative Vision',
    content: 'Empowering girls through sustainable menstrual solutions...'
  },
  mission: {
    title: 'Jasiri Initiative Mission',
    content: 'To provide safe, eco-friendly menstrual products...'
  },
  stats: {
    title: "Help Us Reach More Girls",
    description: "Your contribution directly funds menstrual cups and health education for girls across Kenya.",
    numbers: [
      { label: "Cups Donated", value: "5,000+" },
      { label: "Girls Impacted", value: "12,000" },
      { label: "Schools Reached", value: "45" }
    ]
  }
};

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

// Fetch data directly on the server
async function getHomeData() {
  try {
    await connectDB();
    
    // Tell TypeScript exactly what the Mongoose .lean() queries are returning
    const [postsRes, contentRes] = await Promise.all([
      BlogPost.find({ status: 'published' })
        .sort({ publishedDate: -1 })
        .limit(3)
        .lean() as unknown as IBlogPostDoc[],
      SiteContent.findOne({ page: 'home', section: 'main' })
        .lean() as unknown as ISiteContentDoc | null
    ]);

    let banners = [];
    if (postsRes && postsRes.length > 0) {
      banners = postsRes.map((post: IBlogPostDoc) => ({
        id: post._id.toString(),
        imageSrc: post.heroImage?.trim() ? post.heroImage : DEFAULT_BANNER_IMAGE,
        title: post.title,
        description: truncateDescription(post.content, 180),
        linkHref: `/blog/${post.slug}`,
      }));
    } else {
      banners = [{ id: "fallback-1", imageSrc: DEFAULT_BANNER_IMAGE, title: "Empowering Girls", description: "Providing resources for self-sufficiency.", linkHref: "/blog" }];
    }

    // TypeScript now safely recognizes that contentRes has an optional 'content' property
    const homeContent = contentRes?.content 
      ? { ...FALLBACK_HOME, ...contentRes.content } as HomeContent
      : FALLBACK_HOME;

    return { banners, homeContent };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return { 
      banners: [{ id: "fallback-1", imageSrc: DEFAULT_BANNER_IMAGE, title: "Empowering Girls", description: "Providing resources.", linkHref: "/blog" }], 
      homeContent: FALLBACK_HOME 
    };
  }
}

export default async function HomePage() {
  // All data is gathered before the HTML is sent to the user
  const { banners, homeContent } = await getHomeData();
  const homeBreadcrumbs = [{ label: 'Home', href: '/' }];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-4">
      <Breadcrumbs items={homeBreadcrumbs} />
      
      <HeroBanner banners={banners} />

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
    </div>
  );
}