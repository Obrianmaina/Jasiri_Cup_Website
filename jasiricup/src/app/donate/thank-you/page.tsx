// src/app/donate/thank-you/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thank You | JasiriCup',
  description: 'Thank you for your donation to JasiriCup.',
};

// 1. CHANGE: Make the component async and type searchParams as a Promise
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  // 2. CHANGE: await the searchParams before using them
  const resolvedParams = await searchParams;
  const ref = resolvedParams.ref ?? '';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated checkmark */}
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-12 h-12 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Thank You! 💜
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
          Your donation is making a real difference. A girl somewhere in Kenya
          will now manage her periods with dignity — and stay in school.
        </p>
        {ref && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
            Reference: <span className="font-mono font-bold">{ref}</span>
          </p>
        )}

        <div className="bg-gradient-to-br from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 rounded-2xl p-6 mb-8 border border-purple-100 dark:border-purple-800/50">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            What happens next?
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left list-none">
            <li>✉️ Receipt sent to your email</li>
            <li>📦 Cup procured and dispatched to a partner school</li>
            <li>🎓 Girl trained on use and hygiene</li>
            <li>📊 Impact reported in our quarterly update</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/impact"
            className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          >
            See Our Impact
          </Link>
          <Link
            href="/donate"
            className="inline-flex items-center justify-center border-2 border-green-500 text-green-700 dark:text-green-400 px-6 py-3 rounded-full font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            Donate Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center text-gray-500 dark:text-gray-400 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}