import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

// 1. Define strict types for the Partner data and the API response
interface Partner {
  name: string;
  county: string;
  girls: number;
  type: string;
  since: string;
}

interface SiteContentSection {
  section: string;
  content?: {
    partners: Partner[];
  };
}

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Partners', href: '/partners' }];

const typeColors: Record<string, string> = { 
  School: 'bg-purple-100 text-purple-700', 
  NGO: 'bg-green-100 text-green-700', 
  Research: 'bg-blue-100 text-blue-700', 
  Government: 'bg-amber-100 text-amber-700' 
};

const fallbackPartners: Partner[] = [
  { name: 'Iftin Girls Secondary', county: 'Garissa', girls: 240, type: 'School', since: '2022' },
  { name: 'Kenya Red Cross', county: 'National', girls: 0, type: 'NGO', since: '2022' }
];

async function getPartners(): Promise<Partner[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/site-content?page=partners`, { 
      next: { revalidate: 300 } 
    });
    
    if (res.ok) {
      const { data } = await res.json();
      // Apply the strict type to the find method
      const main = data.find((d: SiteContentSection) => d.section === 'main');
      if (main?.content?.partners?.length && main.content.partners.length > 0) {
        return main.content.partners;
      }
    }
  } catch (err) {
    console.error("Failed to fetch partners:", err);
  }
  return fallbackPartners;
}

export default async function PartnersPage() {
  const partners = await getPartners();
  
  // Apply the strict Partner type to the filter methods
  const schools = partners.filter((p: Partner) => p.type === 'School');
  const orgs = partners.filter((p: Partner) => p.type !== 'School');

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      <section className="text-center mb-16 mt-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Our Partner Network</h1>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">School Partners</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Apply the strict Partner type to the map method */}
          {schools.map((p: Partner, i: number) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeColors[p.type] || 'bg-gray-100'}`}>{p.type}</span>
              <h3 className="font-bold mt-3 text-gray-900 dark:text-white">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.county} - Since {p.since}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Organisational Partners</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Apply the strict Partner type to the map method */}
          {orgs.map((p: Partner, i: number) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeColors[p.type] || 'bg-gray-100'}`}>{p.type}</span>
              <h3 className="font-bold mt-3 text-gray-900 dark:text-white">{p.name}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}