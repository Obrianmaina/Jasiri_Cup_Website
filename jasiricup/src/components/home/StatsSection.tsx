// src/components/home/StatsSection.tsx
import Link from 'next/link';

interface StatItem {
  label: string;
  value: string;
}

interface StatsSectionProps {
  stats: StatItem[];
  ctaTitle: string;
  ctaDescription: string;
}

export const StatsSection = ({ stats, ctaTitle, ctaDescription }: StatsSectionProps) => {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-[#1AA75B] to-purple-600 dark:from-green-700 dark:to-purple-900 rounded-2xl p-8 lg:p-12 mb-12 shadow-lg transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
        
        {/* Left 2/3: Stat Tiles */}
        {/* UPDATED: Changed grid-cols-2 to grid-cols-1 so they stack on mobile */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm transform hover:scale-105 transition-all duration-300 border border-transparent dark:border-gray-700"
            >
              <h4 className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400 mb-2">
                {stat.value}
              </h4>
              <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Right 1/3: Call to Action */}
        <div className="w-full lg:w-1/3 text-white text-center lg:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
            {ctaTitle}
          </h3>
          <p className="text-sm sm:text-base mb-8 text-green-50 dark:text-gray-200 opacity-90 leading-relaxed">
            {ctaDescription}
          </p>
          <Link 
            href="/order" 
            className="inline-block bg-white text-purple-700 dark:bg-gray-900 dark:text-purple-400 font-bold px-8 py-3.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
          >
            Donate Today
          </Link>
        </div>

      </div>
    </section>
  );
};