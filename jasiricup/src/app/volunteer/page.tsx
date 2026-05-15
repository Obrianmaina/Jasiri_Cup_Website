// src/app/volunteer/page.tsx
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { VolunteerForm } from '@/components/volunteer/VolunteerForm';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';

export const revalidate = 60;

interface VolunteerRole {
  icon: string;
  title: string;
  desc: string;
  commitment: string;
  location: string;
  image?: string; 
}

const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Volunteer', href: '/volunteer' }];

async function getRoles(): Promise<VolunteerRole[]> {
  try {
    await connectDB();
    const siteData = await SiteContent.findOne({ page: 'volunteer', section: 'main' }).lean() as { content?: { roles?: VolunteerRole[] } } | null;
    
    if (siteData?.content?.roles && siteData.content.roles.length > 0) {
      return siteData.content.roles;
    }
  } catch (err) {
    console.error("Failed to fetch volunteer roles:", err);
  }
  return []; // Return empty array instead of fallbacks
}

export default async function VolunteerPage() {
  const roles = await getRoles();

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      <section className="text-center mb-16 mt-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">Volunteer With Us</h1>
      </section>

      {roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center mb-12">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full mb-6">
            <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Roles Updating</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We are currently updating our specific volunteer openings. However, we are always looking for passionate people! Feel free to fill out the general application below.
          </p>
        </div>
      ) : (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center transition-colors">Open Volunteer Roles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roles.map((r: VolunteerRole, i: number) => (
              <div key={i} className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
                {r.image && (
                  <div className="absolute inset-0 z-0 flex justify-end">
                    <div className="relative w-full sm:w-full h-full">
                      <img src={r.image} alt="" className="absolute inset-0 w-full h-full object-cover object-right opacity-30 transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent"></div>
                    </div>
                  </div>
                )}
                <div className="relative z-10 p-6 sm:p-8 sm:w-3/4">
                  <div className="text-4xl mb-4 drop-shadow-sm">{r.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{r.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed font-medium transition-colors">{r.desc}</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 transition-colors">
                    <p><span className="font-bold text-gray-800 dark:text-gray-200 transition-colors">Time:</span> {r.commitment}</p>
                    <p><span className="font-bold text-gray-800 dark:text-gray-200 transition-colors">Location:</span> {r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Volunteer Form stays active regardless of specific roles */}
      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white transition-colors">Apply to Volunteer</h2>
        <VolunteerForm roles={roles.length > 0 ? roles.map((r: VolunteerRole) => r.title) : ["General Application"]} />
      </section>
    </div>
  );
}