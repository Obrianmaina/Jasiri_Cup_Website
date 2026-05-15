import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';

// Revalidate instead of force-dynamic so the page loads instantly and preserves the theme state
export const revalidate = 60;

interface Partner {
  name: string;
  county: string;
  girls: number;
  type: string;
  since: string;
  image?: string; 
}

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Partners', href: '/partners' }];

const typeColors: Record<string, string> = {
  school: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ngo: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  research: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  government: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
};

const fallbackPartners: Partner[] = [
  { name: 'Iftin Girls Secondary', county: 'Garissa', girls: 240, type: 'School', since: '2022' },
  { name: 'Kenya Red Cross', county: 'National', girls: 0, type: 'NGO', since: '2022' }
];

async function getPartners(): Promise<Partner[]> {
  try {
    await connectDB();
    
    const siteData = await SiteContent.findOne({ 
      page: 'partners', 
      section: 'main' 
    }).lean() as { content?: { partners?: Partner[] } } | null;

    if (siteData?.content?.partners && siteData.content.partners.length > 0) {
      return siteData.content.partners;
    }
  } catch (err) {
    console.error("Failed to fetch partners directly from DB:", err);
  } 
  
  return fallbackPartners;
}

export default async function PartnersPage() {
  const partners = await getPartners();

  const schools = partners.filter((p: Partner) => p.type?.trim().toLowerCase() === 'school');
  const orgs = partners.filter((p: Partner) => p.type?.trim().toLowerCase() !== 'school');

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      
      <section className="text-center mb-16 mt-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
          Our Partner Network
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Collaborating with schools, organizations, and government bodies to keep girls in school and provide sustainable menstrual health solutions.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
          School Partners
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((p: Partner, i: number) => {
            const normalizedType = p.type?.trim().toLowerCase();
            return (
              <div key={i} className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col h-full">
                
                {/* Logo Header Area */}
                {p.image ? (
                  <div className="w-full h-40 bg-white flex items-center justify-center p-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
                    <img 
                      src={p.image} 
                      alt={`${p.name} logo`} 
                      className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ) : (
                  // Subtle top accent bar if there is no image
                  <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-green-500 opacity-70"></div>
                )}
                
                {/* Content Area */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${typeColors[normalizedType] || 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {p.type}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                    {p.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {p.county}
                    </span>
                    {p.since && <span>Est. {p.since}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
          Organisational Partners
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((p: Partner, i: number) => {
            const normalizedType = p.type?.trim().toLowerCase();
            return (
              <div key={i} className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col h-full">
                
                {/* Logo Header Area */}
                {p.image ? (
                  <div className="w-full h-40 bg-white flex items-center justify-center p-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
                    <img 
                      src={p.image} 
                      alt={`${p.name} logo`} 
                      className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ) : (
                  <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-green-500 opacity-70"></div>
                )}
                
                {/* Content Area */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${typeColors[normalizedType] || 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {p.type}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                    {p.name}
                  </h3>
                  
                  {(p.county || p.since) && (
                     <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                       {p.county && (
                         <span className="flex items-center gap-1.5">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                           {p.county}
                         </span>
                       )}
                       {p.since && <span>Est. {p.since}</span>}
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}