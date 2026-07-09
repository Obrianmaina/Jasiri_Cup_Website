import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';
import type { Metadata } from 'next';

export const revalidate = 60;

// Define strict types for the Story data
interface Story {
  id: number | string;
  name: string;
  age: number;
  county: string;
  school: string;
  image: string;
  headline: string;
  story: string;
  quote: string;
  impact: string[];
}

export const metadata: Metadata = {
  title: 'Impact Stories | JasiriCup',
  description: 'Real stories of girls whose lives changed when they received a JasiriCup.',
};

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Stories', href: '/stories' }];

// Fetch directly from the database instead of using the API
async function getStories(): Promise<Story[]> {
  try {
    await connectDB();
    const siteData = await SiteContent.findOne({ page: 'stories', section: 'main' }).lean() as { content?: { stories?: Story[] } } | null;
    
    if (siteData?.content?.stories && siteData.content.stories.length > 0) {
      return siteData.content.stories;
    }
  } catch (err) {
    console.error("Failed to fetch stories:", err);
  }
  return []; // Return empty array instead of fallback
}

export default async function StoriesPage() {
  const stories = await getStories();
  
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <section className="text-center mb-16 mt-4">
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">
          Stories of Impact
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
          Behind every cup donated is a girl with a name, a dream, and a future. These are their stories.
        </p>
      </section>

      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Stories Being Compiled</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            We are currently gathering and writing the latest impact stories from our partner schools. Check back soon to read about the lives changed by JasiriCup.
          </p>
        </div>
      ) : (
        <section className="space-y-16 mb-20">
          {stories.map((s: Story, i: number) => (
            <article key={s.id || i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}>
              <div className="w-full md:w-2/5 flex-shrink-0">
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                  {s.image && <Image src={s.image} alt={s.name} fill className="object-cover" />}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-full px-4 py-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                    {s.county} County
                  </div>
                </div>
              </div>
              <div className="w-full md:w-3/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">{s.school}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Age {s.age}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{s.headline}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{s.story}</p>
                <blockquote className="border-l-4 border-purple-500 pl-5 mb-6 italic text-gray-700 dark:text-gray-200 text-lg">
                  &ldquo;{s.quote}&rdquo;
                  <footer className="text-sm not-italic font-bold text-purple-600 dark:text-purple-400 mt-2">- {s.name}</footer>
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  {s.impact?.map((chip: string) => (
                    <span key={chip} className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">{chip}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}