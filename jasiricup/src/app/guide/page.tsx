import { Metadata } from 'next';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';

export const metadata: Metadata = {
  title: 'Menstrual Cup Guide | Jasiri Cup',
  description: 'A comprehensive guide to menstrual cups, materials, usage, and environmental impact.',
};

interface GuideSection {
  heading: string;
  content: string;
  bullets: string[];
  postContent?: string;
}

interface GuideContent {
  title: string;
  intro: string;
  sections: GuideSection[];
}

async function getGuideContent(): Promise<GuideContent | null> {
  try {
    await connectDB();
    const data = await SiteContent.findOne({ page: 'guide', section: 'main' }).lean() as { content: GuideContent } | null;
    
    if (data && data.content) {
      return data.content;
    }
    return null;
  } catch (error) {
    console.error("Error fetching guide content:", error);
    return null;
  }
}

export default async function GuidePage() {
  const guide = await getGuideContent();

  if (!guide || !guide.title) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guide Coming Soon</h1>
        <p className="text-gray-500 dark:text-gray-400">Our comprehensive guide is currently being updated.</p>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 py-16 md:py-24 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <span className="text-purple-600 dark:text-purple-400 font-semibold tracking-wider uppercase text-sm mb-3 block">
            Educational Resources
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {guide.title}
          </h1>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-10 md:p-14 transition-colors">
          
          {/* Intro Text */}
          {guide.intro && (
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-10">
              {guide.intro}
            </p>
          )}

          {/* Render Configurable Sections */}
          <div className="space-y-10">
            {guide.sections.map((section, idx) => (
              <section key={idx}>
                {section.heading && (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                    {section.heading}
                  </h2>
                )}
                
                {/* Top Paragraph */}
                {section.content && (
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mb-4">
                    {section.content}
                  </p>
                )}

                {/* Bullet Points */}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="text-gray-600 dark:text-gray-400">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Bottom Paragraph */}
                {section.postContent && (
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mt-4">
                    {section.postContent}
                  </p>
                )}
              </section>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}