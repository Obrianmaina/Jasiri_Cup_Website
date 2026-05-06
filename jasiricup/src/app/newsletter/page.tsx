import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { NewsletterSignup } from '@/components/common/NewsletterSignup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe to Our Newsletter | JasiriCup',
  description: 'Join the JasiriCup community and get monthly updates on our impact across Kenya.',
};

export default function NewsletterPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Newsletter', href: '/newsletter' }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="max-w-4xl mx-auto mt-8 mb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Join Our Community
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Be the first to hear about our latest impact stories, upcoming events, and new ways to support girls across Kenya.
          </p>
        </div>

        {/* Utilizing your existing banner variant for a bold, high-conversion look */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
          <NewsletterSignup variant="banner" />
        </div>
      </div>
    </div>
  );
}