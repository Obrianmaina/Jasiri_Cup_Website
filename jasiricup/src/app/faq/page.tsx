import dbConnect from '@/lib/dbConnect';
import FAQ from '@/lib/models/FAQ';
import Accordion from '@/components/ui/Accordion';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Jasiri Cup',
  description: 'Find answers to common questions about the Jasiri Cup, our menstrual health initiatives, and how you can get involved.',
};

interface IFAQ {
  _id: { toString(): string } | string;
  question: string;
  answer: string;
  category: 'General' | 'Product' | 'Donation' | 'Volunteer';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Ensure these match the exact strings used in your admin dashboard dropdown
const CATEGORIES = ['General', 'Product', 'Donation', 'Volunteer'];

async function getFaqs(): Promise<IFAQ[]> {
  await dbConnect();
  // Sorted by newest first since we removed manual order
  const faqs = await FAQ.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return faqs as unknown as IFAQ[];
}

export default async function FAQPage() {
  const faqs = await getFaqs();

  // The SEO Schema stays flat. Search engines prefer all questions in one array.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        
        {/* JSON-LD Script for Google Search Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Header Section */}
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about the Jasiri Cup and our mission.
          </p>
        </div>

        {/* Category Render Engine */}
        {faqs.length > 0 ? (
          <div className="space-y-8 md:space-y-12">
            {CATEGORIES.map((category) => {
              // Filter FAQs for the current category in the loop
              const categoryFaqs = faqs.filter(faq => faq.category === category);
              
              // If there are no active questions in this category, do not render the block
              if (categoryFaqs.length === 0) return null;

              return (
                <div 
                  key={category} 
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 sm:p-8 md:p-10 transition-colors"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    {category} Questions
                  </h2>
                  <div className="space-y-1">
                    {categoryFaqs.map((faq) => (
                      <Accordion key={faq._id.toString()} title={faq.question}>
                        <p className="whitespace-pre-wrap">{faq.answer}</p>
                      </Accordion>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-10">
            <p className="text-center text-gray-500 dark:text-gray-400">
              FAQ content is being updated. Please check back later.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}