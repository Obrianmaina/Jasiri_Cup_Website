import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ImpactCounter } from '@/components/impact/ImpactCounter';
import { ImpactMap, MapData } from '@/components/impact/ImpactMap';
import { TestimonialsSection, Testimonial } from '@/components/impact/TestimonialsSection';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Impact | JasiriCup',
  description: 'See the real-world impact of JasiriCup.',
};

export const dynamic = 'force-dynamic';

interface ImpactPageContent {
  hero: { subtitle: string; title: string; description: string; };
  testimonials: Testimonial[];
  map: MapData;
}

const fallbackContent: ImpactPageContent = {
  hero: {
    subtitle: "Real Change, Real Numbers",
    title: "Our Impact Across Kenya",
    description: "Every cup donated keeps a girl in school. Here is what we have achieved together—and why we are just getting started."
  },
  testimonials: [
    { quote: 'Before JasiriCup, I missed school every month. Now I never miss a single day.', name: 'Amina W.', location: 'Garissa County', role: 'Form 3', avatar: '👩🏾' },
  ],
  map: {
    title: "Where We Work",
    subtitle: "Active in 8 counties across Kenya, focusing on ASAL regions",
    expansionNote: "Expanding to 5 new counties in 2025: Lamu, Isiolo, Samburu, West Pokot, Tana River",
    counties: [{ name: 'Garissa', region: 'North East', girls: 2400, color: 'bg-purple-600' }]
  }
};

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Our Impact', href: '/impact' }];

async function getImpactPageData() {
  // 1. Get the dynamic stats via fetch
  const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/impact`, { next: { revalidate: 3600 } }).catch(() => null);
  let stats = { cupsDonated: 5000, girlsImpacted: 12000, schoolsReached: 45, countiesReached: 8, periodsManaged: 60000, volunteersActive: 120 };
  
  if (statsRes?.ok) {
    const data = await statsRes.json();
    if (data.stats) stats = data.stats;
  }

  // 2. Get the structural page content directly from the DB
  await connectDB();
  const siteData = await SiteContent.findOne({ page: 'impact', section: 'main' }).lean() as { content?: ImpactPageContent } | null;
  const content = siteData?.content || fallbackContent;

  return { stats, content };
}

export default async function ImpactPage() {
  const { stats, content } = await getImpactPageData();

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

      {/* Hero (Dynamically Driven) */}
      <section className="text-center mb-16 mt-4">
        <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          {content.hero.subtitle}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          {content.hero.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {content.hero.description}
        </p>
      </section>

      {/* Stats Counters */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-20">
        {statCards.map((stat) => (
          <ImpactCounter key={stat.label} {...stat} />
        ))}
      </section>

      {/* Testimonials & Map (Dynamically Driven) */}
      <TestimonialsSection testimonials={content.testimonials} />
      <ImpactMap mapData={content.map} />

      {/* CTA */}
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