import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';

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

async function getPartners(): Promise<Partner[]> {
  try {
    await connectDB();
    const siteData = await SiteContent.findOne({ page: 'partners', section: 'main' }).lean() as { content?: { partners?: Partner[] } } | null;
    if (siteData?.content?.partners && siteData.content.partners.length > 0) {
      return siteData.content.partners;
    }
  } catch (err) {
    console.error("Failed to fetch partners directly from DB:", err);
  } 
  return []; // Return empty array instead of fallbacks
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

      {partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Partner List Updating</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            We are currently curating and updating our list of official partners. Please check back soon!
          </p>
        </div>
      ) : (
        <>
          {schools.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                School Partners
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((p: Partner, i: number) => {
                  const normalizedType = p.type?.trim().toLowerCase();
                  return (
                    <div key={i} className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col h-full">
                      {p.image ? (
                        <div className="w-full h-40 bg-white flex items-center justify-center p-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
                          <img src={p.image} alt={`${p.name} logo`} className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-green-500 opacity-70"></div>
                      )}
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${typeColors[normalizedType] || 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{p.type}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 transition-colors duration-300">{p.name}</h3>
                        <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
          )}

          {orgs.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                Organisational Partners
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgs.map((p: Partner, i: number) => {
                  const normalizedType = p.type?.trim().toLowerCase();
                  return (
                    <div key={i} className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col h-full">
                      {p.image ? (
                        <div className="w-full h-40 bg-white flex items-center justify-center p-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
                          <img src={p.image} alt={`${p.name} logo`} className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-green-500 opacity-70"></div>
                      )}
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="mb-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${typeColors[normalizedType] || 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>{p.type}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 transition-colors duration-300">{p.name}</h3>
                        {(p.county || p.since) && (
                           <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                             {p.county && (
                               <span className="flex items-center gap-1.5">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
          )}
        </>
      )}
    </div>
  );
}