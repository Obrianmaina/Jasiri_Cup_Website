'use client';
import { useState } from 'react';

export interface Testimonial {
  quote: string;
  name: string;
  location: string;
  role: string;
  avatar: string;
}

export const TestimonialsSection = ({ testimonials }: { testimonials: Testimonial[] }) => {
  const [active, setActive] = useState(0);

  // Fallback UI when there are no testimonials
  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Voices of Change</h2>
          <p className="text-gray-500 dark:text-gray-400">Real stories from girls, parents, and educators</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="bg-purple-100 dark:bg-purple-900/40 p-5 rounded-full mb-5">
            <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Testimonials Updating</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            We are currently collecting the latest stories and feedback from our community. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  const t = testimonials[active] || testimonials[0];

  return (
    <section className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Voices of Change</h2>
        <p className="text-gray-500 dark:text-gray-400">Real stories from girls, parents, and educators across Kenya</p>
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 rounded-3xl p-8 sm:p-12 border border-purple-100 dark:border-purple-800/50 mb-6 relative overflow-hidden transition-colors">
          <div className="absolute top-6 left-8 text-8xl font-black text-purple-200 dark:text-purple-800/50 leading-none select-none">
            &ldquo;
          </div>
          <div className="relative z-10">
            <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-100 leading-relaxed mb-8 italic font-medium">
              {t.quote}
            </p>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{t.avatar}</div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t.role} • {t.location}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === active ? 'w-8 bg-purple-600 dark:bg-purple-400' : 'w-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-purple-400'
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 mt-6">
          {testimonials.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`p-3 rounded-xl text-center transition-all duration-200 border-2 ${
                i === active ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:border-purple-300'
              }`}
            >
              <div className="text-2xl mb-1">{item.avatar}</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.name.split(' ')[0]}</div>
              <div className="text-[10px] text-gray-400 truncate">{item.location.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};