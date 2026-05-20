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
  image?: string;
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold tracking-wider uppercase text-sm mb-4">
            Educational Resources
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            {guide.title}
          </h1>
          {guide.intro && (
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {guide.intro}
            </p>
          )}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {guide.sections?.map((section, idx) => {
            // Layout Logic based on requested structure
            const isMiddleFullWidth = idx === 4;
            const isLastItem = idx === guide.sections.length - 1;
            const isFullWidth = isMiddleFullWidth || (isLastItem && idx > 6);
            
            // Check if this is the 5th item split layout requirement
            const useSplitLayout = isMiddleFullWidth && section.bullets && section.bullets.length > 0;

            return (
              <section 
                key={idx}
                className={`
                  bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 
                  p-6 sm:p-8 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700/50 
                  transition-all duration-300 flex flex-col
                  ${isFullWidth ? 'md:col-span-2' : 'col-span-1'}
                `}
              >
                {useSplitLayout ? (
                  // Split Layout (Top: Heading, Left: Para + Bullets, Right: Image, Bottom: Post Content)
                  <div className="flex flex-col h-full">
                    {section.heading && (
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-purple-600 dark:bg-purple-500 rounded-full block"></span>
                        {section.heading}
                      </h2>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-6">
                      {/* Left: Paragraph + Bullets */}
                      <div className="flex flex-col gap-6">
                        {section.content && (
                          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                            {section.content}
                          </p>
                        )}
                        
                        {section.bullets && section.bullets.length > 0 && (
                          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                            <ul className="list-disc pl-5 space-y-3">
                              {section.bullets.map((bullet, i) => (
                                <li key={i} className="text-gray-700 dark:text-gray-300 marker:text-purple-500">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Right: Image */}
                      {section.image && (
                        <div className="w-full h-full min-h-[250px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                          <img 
                            src={section.image} 
                            alt={section.heading || 'Guide illustration'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom: Post Content */}
                    {section.postContent && (
                      <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                          {section.postContent}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Standard Bento Layout (Top: Image -> Heading -> Content -> Bullets -> PostContent)
                  <div className="flex flex-col h-full flex-grow">
                    {section.image && (
                      <div className="w-full h-48 md:h-56 mb-6 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 shadow-sm border border-gray-100 dark:border-gray-700 group">
                        <img 
                          src={section.image} 
                          alt={section.heading || 'Guide illustration'} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    {section.heading && (
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-purple-600 dark:bg-purple-500 rounded-full block"></span>
                        {section.heading}
                      </h2>
                    )}

                    {section.content && (
                      <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mb-4 flex-grow">
                        {section.content}
                      </p>
                    )}

                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="list-disc pl-5 space-y-2 mb-4 mt-2">
                        {section.bullets.map((bullet, i) => (
                          <li key={i} className="text-gray-600 dark:text-gray-400 marker:text-purple-500">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.postContent && (
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                          {section.postContent}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}