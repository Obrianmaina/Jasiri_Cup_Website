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

// Revalidate every 60 seconds instead of force-dynamic for instant page loads
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

const fallbackContent: ImpactPageContent = {
  hero: {
    subtitle: "Real Change, Real Numbers",
    title: "Our Impact Across Kenya",
    description: "Every cup donated keeps a girl in school. Here is what we have achieved together and why we are just getting started."
  },
  testimonials: [
    { quote: 'Before JasiriCup, I missed school every month. Now I never miss a single day.', name: 'Amina W.', location: 'Garissa County', role: 'Form 3', avatar: '👩🏾' },
  ],
  map: {
    title: "Where We Work",
    subtitle: "Active in multiple counties across Kenya",
    expansionNote: "Expanding to 5 new counties in 2025",
    counties: [
      {
        name: 'Garissa',
        region: 'North Eastern',
        girls: 2400,
        color: 'purple',
        image: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-5_ljvnx3.png',
        imageAttribution: 'By <a href="//commons.wikimedia.org/wiki/User:Bahnfrend" class="underline">Bahnfrend</a> - Own work, CC BY-SA 4.0'
      },
      {
        name: 'Nairobi',
        region: 'Central',
        girls: 4200,
        color: 'green',
        image: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/happy_girl-5_ljvnx3.png'
      }
    ]
  }
};

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Our Impact', href: '/impact' }];

async function getImpactPageData() {
  try {
    await connectDB();

    // Query BOTH the main content and the admin stats directly from MongoDB in parallel
    const [siteData, statsData] = await Promise.all([
      SiteContent.findOne({ page: 'impact', section: 'main' }).lean() as { content?: ImpactPageContent } | null,
      SiteContent.findOne({ page: 'impact', section: 'stats' }).lean() as { content?: ImpactStats } | null
    ]);

    const content = siteData?.content || fallbackContent;
    
    // Default fallback stats
    let stats: ImpactStats = { cupsDonated: 5000, girlsImpacted: 12000, schoolsReached: 45, countiesReached: 8, periodsManaged: 60000, volunteersActive: 120 };
    
    // If admin stats exist in the DB, override the defaults
    if (statsData?.content) {
      stats = { ...stats, ...statsData.content };
    }

    return { stats, content };
  } catch (error) {
    console.error("Error fetching impact data:", error);
    return { 
      stats: { cupsDonated: 5000, girlsImpacted: 12000, schoolsReached: 45, countiesReached: 8, periodsManaged: 60000, volunteersActive: 120 }, 
      content: fallbackContent 
    };
  }
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