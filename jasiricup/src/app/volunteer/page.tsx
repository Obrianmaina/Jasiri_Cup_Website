import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { VolunteerForm } from '@/components/volunteer/VolunteerForm';

interface VolunteerRole {
  icon: string;
  title: string;
  desc: string;
  commitment: string;
  location: string;
  image?: string; // Added image field
}

interface SiteContentSection {
  section: string;
  content?: {
    roles: VolunteerRole[];
  };
}

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Volunteer', href: '/volunteer' }];

const fallbackRoles: VolunteerRole[] = [
  { icon: '🏃', title: 'Field Distributor', desc: 'Help deliver cups.', commitment: '1 weekend/month', location: 'On-site' }
];

async function getRoles(): Promise<VolunteerRole[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/site-content?page=volunteer`, { 
      next: { revalidate: 300 } 
    });
    
    if (res.ok) {
      const { data } = await res.json();
      const main = data.find((d: SiteContentSection) => d.section === 'main');
      if (main?.content?.roles?.length && main.content.roles.length > 0) {
        return main.content.roles;
      }
    }
  } catch (err) {
    console.error("Failed to fetch volunteer roles:", err);
  }
  return fallbackRoles;
}

export default async function VolunteerPage() {
  const roles = await getRoles();

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      <section className="text-center mb-16 mt-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Volunteer With Us</h1>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Volunteer Roles</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((r: VolunteerRole, i: number) => (
            <div key={i} className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
              
              {/* Conditional Background Image with Gradient Fade */}
              {r.image && (
                <div className="absolute inset-0 z-0 flex justify-end">
                  <div className="relative w-full sm:w-2/3 h-full">
                    {/* Standard img tag prevents Next.js unconfigured domain errors */}
                    <img src={r.image} alt="" className="absolute inset-0 w-full h-full object-cover object-right opacity-90 transition-transform duration-700 group-hover:scale-105" />
                    {/* The gradient mask blending the image into the background color */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent"></div>
                  </div>
                </div>
              )}

              {/* Text Content (Pulled forward via z-index) */}
              <div className="relative z-10 p-6 sm:p-8 sm:w-3/4">
                <div className="text-4xl mb-4 drop-shadow-sm">{r.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{r.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed font-medium">{r.desc}</p>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                  <p><span className="font-bold text-gray-800 dark:text-gray-200">Time:</span> {r.commitment}</p>
                  <p><span className="font-bold text-gray-800 dark:text-gray-200">Location:</span> {r.location}</p>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Apply to Volunteer</h2>
        <VolunteerForm roles={roles.map((r: VolunteerRole) => r.title)} />
      </section>
    </div>
  );
}