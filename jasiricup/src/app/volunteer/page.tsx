import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { VolunteerForm } from '@/components/volunteer/VolunteerForm';

// 1. Define strict types for the Volunteer Roles and API response
interface VolunteerRole {
  icon: string;
  title: string;
  desc: string;
  commitment: string;
  location: string;
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
      // Apply the strict type to the find method
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Apply the strict VolunteerRole type to the map method */}
          {roles.map((r: VolunteerRole, i: number) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border">
              <div className="text-3xl mb-3">{r.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{r.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{r.desc}</p>
              <div className="text-xs text-gray-500">
                <p>Time: {r.commitment}</p>
                <p>Location: {r.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Apply to Volunteer</h2>
        {/* Apply the strict VolunteerRole type here as well */}
        <VolunteerForm roles={roles.map((r: VolunteerRole) => r.title)} />
      </section>
    </div>
  );
}