// src/app/impact/page.tsx
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ImpactCounter } from '@/components/impact/ImpactCounter';
import { ImpactMap } from '@/components/impact/ImpactMap';
import { TestimonialsSection } from '@/components/impact/TestimonialsSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Impact | JasiriCup',
  description:
    'See the real-world impact of JasiriCup — cups donated, girls helped, and schools reached across Kenya.',
};

export const revalidate = 3600; // Revalidate every hour

async function getImpactStats() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/impact`,
      { next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const data = await res.json();
      return data.stats;
    }
  } catch {
    // fall through to defaults
  }
  // Fallback stats
  return {
    cupsDonated: 5000,
    girlsImpacted: 12000,
    schoolsReached: 45,
    countiesReached: 8,
    periodsManaged: 60000,
    volunteersActive: 120,
  };
}

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Our Impact', href: '/impact' },
];

export default async function ImpactPage() {
  const stats = await getImpactStats();

  const statCards = [
    {
      value: stats.cupsDonated,
      label: 'Cups Donated',
      description: 'Safe, reusable menstrual cups provided free of charge',
      icon: '🌸',
      color: 'from-purple-500 to-purple-700',
    },
    {
      value: stats.girlsImpacted,
      label: 'Girls Impacted',
      description: 'Young women who can now manage their periods safely',
      icon: '👧',
      color: 'from-green-500 to-emerald-700',
    },
    {
      value: stats.schoolsReached,
      label: 'Schools Reached',
      description: 'Partner schools receiving cups and health education',
      icon: '🏫',
      color: 'from-blue-500 to-blue-700',
    },
    {
      value: stats.countiesReached,
      label: 'Counties Covered',
      description: 'Kenyan counties where JasiriCup is active',
      icon: '📍',
      color: 'from-amber-500 to-orange-600',
    },
    {
      value: stats.periodsManaged,
      label: 'Periods Managed',
      description: 'Estimated periods handled with JasiriCup',
      icon: '📊',
      color: 'from-pink-500 to-rose-600',
    },
    {
      value: stats.volunteersActive,
      label: 'Active Volunteers',
      description: 'Community members supporting the mission',
      icon: '🤝',
      color: 'from-teal-500 to-cyan-600',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero */}
      <section className="text-center mb-16 mt-4">
        <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          Real Change, Real Numbers
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          Our Impact Across Kenya
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Every cup donated keeps a girl in school. Here is what we have achieved
          together — and why we are just getting started.
        </p>
      </section>

      {/* Animated stat counters */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-20">
        {statCards.map((stat) => (
          <ImpactCounter key={stat.label} {...stat} />
        ))}
      </section>

      {/* SDG alignment */}
      <section className="bg-gradient-to-br from-purple-600 to-green-600 rounded-3xl p-8 sm:p-12 mb-20 text-white text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Aligned with UN Sustainable Development Goals
        </h2>
        <p className="text-purple-100 mb-8 max-w-xl mx-auto">
          JasiriCup directly contributes to SDG 3 (Good Health), SDG 4 (Quality
          Education), SDG 5 (Gender Equality), and SDG 10 (Reduced Inequalities).
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { num: 3, label: 'Good Health' },
            { num: 4, label: 'Quality Education' },
            { num: 5, label: 'Gender Equality' },
            { num: 10, label: 'Reduced Inequalities' },
          ].map((sdg) => (
            <div
              key={sdg.num}
              className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 min-w-[120px]"
            >
              <div className="text-3xl font-black">SDG {sdg.num}</div>
              <div className="text-sm text-purple-100 mt-1">{sdg.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Map */}
      <ImpactMap />

      {/* CTA */}
      <section className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Help Us Reach More Girls
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          A single donation can provide a cup that lasts up to 10 years — keeping
          a girl in school for her entire secondary education.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/donate"
            className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            Donate a Cup Today
          </a>
          <a
            href="/get-in-touch"
            className="inline-flex items-center justify-center border-2 border-purple-600 text-purple-700 dark:text-purple-400 dark:border-purple-400 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            Partner With Us
          </a>
        </div>
      </section>
    </div>
  );
}