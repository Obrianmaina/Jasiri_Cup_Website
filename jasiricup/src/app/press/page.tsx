import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

// 1. Define strict types for the Press data and the API response
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

interface SiteContentSection {
  section: string;
  content?: PressContent;
}

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Press', href: '/press' }];

const fallbackPress: PressContent = {
  coverage: [{ outlet: 'Nation Africa', headline: 'Kenyan startup fights period poverty', date: 'March 2024', url: '#', logo: '📰' }],
  downloads: [{ name: 'Press Kit (ZIP)', desc: 'Logos, photos, brand guidelines', icon: '📁', file: '#' }]
};

async function getPressData(): Promise<PressContent> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/site-content?page=press`, { 
      next: { revalidate: 300 } 
    });
    
    if (res.ok) {
      const { data } = await res.json();
      // Apply the strict type to the find method
      const main = data.find((d: SiteContentSection) => d.section === 'main');
      if (main?.content) return main.content;
    }
  } catch (err) {
    console.error("Failed to fetch press data:", err);
  }
  return fallbackPress;
}

export default async function PressPage() {
  const { coverage, downloads } = await getPressData();
  const activeCoverage = coverage?.length ? coverage : fallbackPress.coverage;
  const activeDownloads = downloads?.length ? downloads : fallbackPress.downloads;

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      <section className="text-center mb-16 mt-4">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Media Centre
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Press & Media</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">Resources for journalists covering menstrual health in Kenya.</p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">In the News</h2>
        <div className="space-y-4">
          {/* Apply the strict PressCoverage type to the map method */}
          {activeCoverage.map((item: PressCoverage, i: number) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all group">
              <div className="text-3xl flex-shrink-0">{item.logo}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400">{item.outlet}</div>
                <div className="font-semibold text-gray-900 dark:text-white truncate">{item.headline}</div>
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500">{item.date}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Downloadable Assets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Apply the strict PressDownload type to the map method */}
          {activeDownloads.map((d: PressDownload, i: number) => (
            <a key={i} href={d.file} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all group">
              <div className="text-3xl flex-shrink-0">{d.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white">{d.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{d.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}