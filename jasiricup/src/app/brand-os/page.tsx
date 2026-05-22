import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
import SiteContent from '@/lib/models/SiteContent';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GuideContent } from '@/types/brand-os';

import { BrandHero, BrandOriginAndVoice, BrandTypography, BrandEmojis } from '@/components/brand-os/BrandIdentity';
import { BrandColors, BrandLogos, BrandSmiley, BrandPhotography } from '@/components/brand-os/BrandVisuals';
import { BrandQueries, AssetDownloads } from '@/components/brand-os/BrandFooter';

export const metadata = {
  title: 'Brand Operating System | JaSiriCup',
  description: 'Official brand guidelines and asset downloads for JaSiriCup.',
};

export default async function BrandOSPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) return <AccessDenied />;

  await dbConnect();
  
  const accessRecord = await BrandAccess.findOne({ 
    accessToken: token, status: 'approved' 
  }).lean<{ expiresAt?: Date | string }>();
  
  if (!accessRecord) return <AccessDenied />;

  if (accessRecord.expiresAt && new Date(accessRecord.expiresAt) < new Date()) {
    return <AccessExpired />;
  }

  const siteData = await SiteContent.findOne({ page: 'brand-os', section: 'main' }).lean<{ content: GuideContent }>();
  
  let content = siteData?.content;
  if (!content) {
    const fallbackData = await SiteContent.findOne({ page: 'guide', section: 'main' }).lean<{ content: GuideContent }>();
    content = fallbackData?.content || getFallbackContent();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-10 sm:pb-20">
      <BrandHero title={content.title} intro={content.intro} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 space-y-16 sm:space-y-24 w-full overflow-hidden">
        <BrandOriginAndVoice originStory={content.originStory} voice={content.voice} />
        <BrandColors colors={content.colors} />
        <BrandTypography typography={content.typography} />
        
        {content.emojiSystem && <BrandEmojis emojiSystem={content.emojiSystem} />}
        
        <BrandLogos logos={content.logos} logoUsage={content.logoUsage} />
        <BrandSmiley smiley={content.smiley} />
        <BrandPhotography photography={content.photography} />
        <BrandQueries />
      </main>
      
      {content.downloads && <AssetDownloads downloads={content.downloads} token={token} />}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-500 mb-3 sm:mb-4">Access Denied</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">You do not have permission to view this page. Please request access through our brand portal.</p>
        <Link href="/brand/request"><Button className="w-full h-12 rounded-xl font-bold">Request Access</Button></Link>
      </div>
    </div>
  );
}

function AccessExpired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-500 mb-3 sm:mb-4">Link Expired</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">Your 30-day access to the Brand OS has expired. If you still need access to our assets, please submit a new request.</p>
        <Link href="/brand/request"><Button className="w-full h-12 rounded-xl font-bold">Request New Access</Button></Link>
      </div>
    </div>
  );
}

function getFallbackContent(): GuideContent {
  return {
    title: "JaSiriCup Brand OS",
    intro: "Joy, empowerment, and approachability. Welcome to the visual foundation of our bold initiative.",
    originStory: { title: "The Origin of Our Name", content: "Our brand identity is built on joy, empowerment, and approachability..." },
    voice: { description: "The way we sound is a direct extension of our visual warmth...", traits: [] },
    typography: { primaryFont: "Montserrat", description: "We use Montserrat as our foundational typeface..." },
    logos: { placementRules: "For video content, maintain clear and consistent logo placement...", items: [] },
    colors: { description: "We rely on a dynamic mix of vibrant Primary Colors and energetic Gradients...", primary: [], gradients: [] },
    photography: { direction: "Our photographic style is authentic and radiant...", targetDemographic: "The subjects featured in our imagery are young people...", images: [] },
    smiley: { core: [], inAction: [] },
    downloads: []
  };
}