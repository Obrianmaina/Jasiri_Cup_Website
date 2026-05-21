// src/app/press/page.tsx
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';
import { Palette } from 'lucide-react'; // 1. Added the icon import

export const revalidate = 60;

interface PressCoverage {
  outlet: string;
  headline: string;
  date: string;
  url: string;
  logo: string;
}

interface PressDownload {
  name: string;
  desc: string;
  icon: string;
  file: string;
}

interface PressContent {
  coverage: PressCoverage[];
  downloads?: PressDownload[]; 
}

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Press', href: '/press' }];

async function getPressData(): Promise<PressContent | null> {
  try {
    await connectDB();
    const siteData = await SiteContent.findOne({ page: 'press', section: 'main' }).lean() as { content?: PressContent } | null;
    if (siteData?.content) {
      return siteData.content;
    }
  } catch (err) {
    console.error("Failed to fetch press data:", err);
  }
  return null;
}

export default async function PressPage() {
  const pressData = await getPressData();
  const coverage = pressData?.coverage || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <section className="text-center mb-16 mt-4">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 transition-colors">
          Media Centre
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">Press & Media</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto transition-colors">
          Resources for journalists, partners, and media covering menstrual health in Kenya.
        </p>
      </section>

      {/* Media Coverage Section */}
      {coverage.length > 0 ? (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">In the News</h2>
          <div className="space-y-4">
            {coverage.map((item: PressCoverage, i: number) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-1">
                  <img 
                    src={item.logo || 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/logo_jrc0mv.png'} 
                    alt={item.outlet} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400">{item.outlet}</div>
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{item.headline}</div>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">{item.date}</div>
              </a>
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center mb-16 border-b border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">Media coverage will be updated here soon.</p>
        </div>
      )}

      {/* Brand Assets & Guidelines Entry Point */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">Brand Assets</h2>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 border border-purple-100 dark:border-slate-700 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">JaSiriCup Brand OS</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Access our official brand guidelines, high-resolution logos, typography rules, and document templates. To maintain the integrity of our visual identity, we provide access upon request.
            </p>
            <Link 
              href="/brand/request" 
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
            >
              Request Brand Access
            </Link>
          </div>
          <div className="flex-shrink-0 hidden md:flex items-center justify-center">
            <div className="w-40 h-40 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shadow-xl border border-purple-100 dark:border-slate-700 transition-transform hover:scale-105 duration-300 group">
              {/* 2. Replaced the emoji span with the Lucide icon */}
              <Palette size={64} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}