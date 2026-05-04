import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

// 1. Define strict types for the Story data and the API response
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

interface SiteContentSection {
  section: string;
  content?: {
    stories: Story[];
  };
}

export const metadata: Metadata = {
  title: 'Impact Stories | JasiriCup',
  description: 'Real stories of girls whose lives changed when they received a JasiriCup.',
};

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Stories', href: '/stories' }];

const fallbackStories: Story[] = [
  { id: 1, name: 'Amina Wanjiru', age: 15, county: 'Garissa', school: 'Iftin Girls Secondary', image: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-5_ljvnx3.png', headline: 'From Missing School to Head Girl', story: 'Before JasiriCup, Amina missed 3-5 days every month...', quote: 'I used to count the days until my period was over.', impact: ['0 days missed', 'Head Girl', 'Top 5 in class'] },
];

async function getStories(): Promise<Story[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/site-content?page=stories`, { next: { tags: ['site-content-stories'], revalidate: 300 } });
    
    if (res.ok) {
      const { data } = await res.json();
      // Apply the strict type to the find method
      const main = data.find((d: SiteContentSection) => d.section === 'main');
      if (main?.content?.stories?.length && main.content.stories.length > 0) {
        return main.content.stories;
      }
    }
  } catch (err) {
    console.error("Failed to fetch stories:", err);
  }
  return fallbackStories;
}

export default async function StoriesPage() {
  const stories = await getStories();
  
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      <section className="text-center mb-16 mt-4">
        <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Real People, Real Change</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Stories of Impact</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Behind every cup donated is a girl with a name, a dream, and a future. These are their stories.</p>
      </section>

      <section className="space-y-16 mb-20">
        {/* Apply the strict Story type to the map method */}
        {stories.map((s: Story, i: number) => (
          <article key={s.id || i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}>
            <div className="w-full md:w-2/5 flex-shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
                <Image src={s.image || fallbackStories[0].image} alt={s.name} fill className="object-cover" />
                <div className="absolute bottom-4 left-4 bg-white/90 rounded-full px-4 py-1.5 text-xs font-bold text-gray-800">{s.county} County</div>
              </div>
            </div>
            <div className="w-full md:w-3/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase text-purple-600">{s.school}</span>
                <span className="text-xs text-gray-500">Age {s.age}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{s.headline}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{s.story}</p>
              <blockquote className="border-l-4 border-purple-500 pl-5 mb-6 italic text-gray-700 dark:text-gray-200 text-lg">
                &ldquo;{s.quote}&rdquo;
                <footer className="text-sm not-italic font-bold text-purple-600 mt-2">- {s.name}</footer>
              </blockquote>
              <div className="flex flex-wrap gap-2">
                {s.impact.map((chip: string) => (
                  <span key={chip} className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{chip}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}