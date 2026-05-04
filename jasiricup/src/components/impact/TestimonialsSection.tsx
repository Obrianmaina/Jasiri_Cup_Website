'use client';
// src/components/impact/TestimonialsSection.tsx
import { useState } from 'react';

const testimonials = [
  {
    quote:
      'Before JasiriCup, I missed school every month. Now I never miss a single day. I even got the top score in my class last term.',
    name: 'Amina W.',
    location: 'Garissa County',
    grade: 'Form 3',
    avatar: '👧',
  },
  {
    quote:
      'My daughter used to stay home during her period. She was falling behind. The cup changed everything — she is now the head girl at her school.',
    name: 'Grace M.',
    location: 'Turkana County',
    role: 'Parent',
    avatar: '👩',
  },
  {
    quote:
      'We used to see a 30% drop in female attendance every month. Since the JasiriCup program started, attendance is consistent year-round.',
    name: 'Mr. Ochieng',
    location: 'Kisumu County',
    role: 'School Principal',
    avatar: '👨‍🏫',
  },
  {
    quote:
      'I was embarrassed and scared. The training sessions gave me confidence. Now I teach other girls in my village about menstrual health.',
    name: 'Faith K.',
    location: 'Marsabit County',
    grade: 'Form 2',
    avatar: '🧒',
  },
];

export const TestimonialsSection = () => {
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <section className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Voices of Change
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Real stories from girls, parents, and educators across Kenya
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Main quote card */}
        <div className="bg-gradient-to-br from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 rounded-3xl p-8 sm:p-12 border border-purple-100 dark:border-purple-800/50 mb-6 relative overflow-hidden transition-colors">
          {/* Decorative quote mark */}
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
                <div className="font-bold text-gray-900 dark:text-white">
                  {t.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t.grade || t.role} · {t.location}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots nav */}
        <div className="flex justify-center gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === active
                  ? 'w-8 bg-purple-600 dark:bg-purple-400'
                  : 'w-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-purple-400'
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Thumbnail row */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {testimonials.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`p-3 rounded-xl text-center transition-all duration-200 border-2 ${
                i === active
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:border-purple-300'
              }`}
            >
              <div className="text-2xl mb-1">{item.avatar}</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {item.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-gray-400 truncate">
                {item.location.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};