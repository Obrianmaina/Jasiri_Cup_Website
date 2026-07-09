import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ImpactCounter } from '@/components/impact/ImpactCounter';
import { ImpactCards } from '@/components/impact/ImpactMap'; 
import { TestimonialsSection, Testimonial } from '@/components/impact/TestimonialsSection';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Impact | JasiriCup',
  description: 'See the real-world impact of JasiriCup.',
};

export const revalidate = 60;

interface MapCounty {
  name: string;
  region: string;
  girls: number;
  color: string;
  image?: string; 
  imageAttribution?: string;
}

interface ImpactPageContent {
  hero: { subtitle: string; title: string; description: string; };
  testimonials: Testimonial[];
  map: { title: string; subtitle: string; expansionNote: string; counties: MapCounty[]; };
}

interface ImpactStats {
  cupsDonated: number;
  girlsImpacted: number;
  schoolsReached: number;
  countiesReached: number;
  periodsManaged: number;
  volunteersActive: number;
}

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Our Impact', href: '/impact' }];

async function getImpactPageData() {
  try {
    await connectDB();

    const [siteData, statsData] = await Promise.all([
      SiteContent.findOne({ page: 'impact', section: 'main' }).lean() as { content?: ImpactPageContent } | null,
      SiteContent.findOne({ page: 'impact', section: 'stats' }).lean() as { content?: ImpactStats } | null
    ]);

    const content = siteData?.content || null;
    
    // Default stats to 0 instead of fake numbers
    let stats: ImpactStats = { cupsDonated: 0, girlsImpacted: 0, schoolsReached: 0, countiesReached: 0, periodsManaged: 0, volunteersActive: 0 };
    
    if (statsData?.content) {
      stats = { ...stats, ...statsData.content };
    }

    return { stats, content };
  } catch (error) {
    console.error("Error fetching impact data:", error);
    return { 
      stats: { cupsDonated: 0, girlsImpacted: 0, schoolsReached: 0, countiesReached: 0, periodsManaged: 0, volunteersActive: 0 }, 
      content: null 
    };
  }
}

export default async function ImpactPage() {
  const { stats, content } = await getImpactPageData();

  if (!content) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Impact Data Compiling</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We are currently aggregating our latest field data and impact metrics. Please check back soon to see the numbers.
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    { value: stats.cupsDonated, label: 'Cups Donated', description: 'Safe, reusable menstrual cups', icon: '🩸', color: 'from-purple-500 to-purple-700' },
    { value: stats.girlsImpacted, label: 'Girls Impacted', description: 'Young women managing their periods safely', icon: '👩🏾', color: 'from-green-500 to-emerald-700' },
    { value: stats.schoolsReached, label: 'Schools Reached', description: 'Partner schools receiving cups', icon: '🏫', color: 'from-blue-500 to-blue-700' },
    { value: stats.countiesReached, label: 'Counties Covered', description: 'Kenyan counties where JasiriCup is active', icon: '📍', color: 'from-amber-500 to-orange-600' },
    { value: stats.periodsManaged, label: 'Periods Managed', description: 'Estimated periods handled with JasiriCup', icon: '📅', color: 'from-pink-500 to-rose-600' },
    { value: stats.volunteersActive, label: 'Active Volunteers', description: 'Community members supporting the mission', icon: '🤝', color: 'from-teal-500 to-cyan-600' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />

      <section className="text-center mb-16 mt-4">
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          {content.hero.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {content.hero.description}
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-20">
        {statCards.map((stat) => (
          <ImpactCounter key={stat.label} {...stat} />
        ))}
      </section>

      <TestimonialsSection testimonials={content.testimonials} />
      
      <ImpactCards mapData={content.map} />

      <section className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Help Us Reach More Girls</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          A single donation can provide a cup that lasts up to 10 years, keeping a girl in school.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/donate" className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-colors shadow-lg">
            Donate a Cup Today
          </a>
          <a href="/get-in-touch" className="inline-flex items-center justify-center border-2 border-purple-600 text-purple-700 dark:text-purple-400 dark:border-purple-400 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
            Partner With Us
          </a>
        </div>
      </section>
    </div>
  );
}