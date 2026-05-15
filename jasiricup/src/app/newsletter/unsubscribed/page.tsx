// src/app/newsletter/unsubscribed/page.tsx
// Place this file at: jasiricup/src/app/newsletter/unsubscribed/page.tsx

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribed | JasiriCup',
  description: 'You have been unsubscribed from the JasiriCup newsletter.',
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors">
          <svg
            className="w-10 h-10 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">
          You&apos;ve been unsubscribed
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-2 leading-relaxed transition-colors">
          You&apos;ve been successfully removed from the JasiriCup newsletter. You won&apos;t receive any more emails from us.
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-500 mb-10 transition-colors">
          Changed your mind? You can always re-subscribe below.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mb-8 transition-colors" />

        {/* Re-subscribe nudge */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 mb-8 border border-purple-100 dark:border-purple-800/50 transition-colors">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Still want to follow our work?
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Our newsletter shares real stories, impact updates, and ways to support girls in Kenya — no spam, ever.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors shadow-sm"
          >
            Re-subscribe
          </Link>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            href="/impact"
            className="inline-flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            See Our Impact →
          </Link>
        </div>

      </div>
    </div>
  );
}