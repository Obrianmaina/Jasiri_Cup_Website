// src/app/press/page.tsx
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';

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
  downloads: PressDownload[];
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
  const downloads = pressData?.downloads || [];
  
  const isEmpty = coverage.length === 0 && downloads.length === 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <section className="text-center mb-16 mt-4">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 transition-colors">
          Media Centre
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">Press & Media</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto transition-colors">Resources for journalists covering menstrual health in Kenya.</p>
      </section>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Media Kit Updating</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            We are currently updating our press releases and brand assets. Please check back shortly for the latest media resources.
          </p>
        </div>
      ) : (
        <>
          {coverage.length > 0 && (
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
          )}

          {downloads.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">Downloadable Assets</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {downloads.map((d: PressDownload, i: number) => (
                  <a key={i} href={d.file} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
                    <div className="text-3xl flex-shrink-0">{d.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white">{d.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{d.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}