// src/app/brand-os/page.tsx
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Download, CheckCircle2 } from 'lucide-react'; // Ensure lucide-react is installed

export const metadata = {
  title: 'Brand Operating System | JaSiriCup',
  description: 'Official brand guidelines and asset downloads for JaSiriCup.',
};

export default async function BrandOSPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ token?: string }> 
}) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token;

  if (!token) {
    return <AccessDenied />;
  }

  await dbConnect();
  
  // Verify the token exists and is approved
  const accessRecord = await BrandAccess.findOne({ 
    accessToken: token, 
    status: 'approved' 
  });

  if (!accessRecord) {
    return <AccessDenied />;
  }

  // Update last accessed time asynchronously
  BrandAccess.updateOne({ _id: accessRecord._id }, { lastAccessedAt: new Date() }).exec();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 py-24 text-center">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            JaSiriCup Brand OS
          </h1>
          <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
            Joy, empowerment, and approachability. Welcome to the visual foundation of our bold initiative.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        
        {/* Core Identity */}
        <section>
          <h2 className="text-3xl font-bold mb-8 border-b pb-4 dark:border-slate-800">Who We Are</h2>
          <div className="grid md:grid-cols-2 gap-12 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            <div>
              <p className="mb-4">
                The name JaSiriCup reflects our diverse roots. It is a fusion of &quot;Ja&quot; (German for yes) and &quot;Siri&quot; (Swahili for secret). Together, they form &quot;Jasiri&quot;, which translates to bold in Swahili.
              </p>
              <p>
                Our voice is uplifting, inclusive, and deeply rooted in community connection. We use first-person plural language and avoid overly formal constraints.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Voice Principles</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={20} /> Inclusive & Collective</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={20} /> Empowering & Optimistic</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={20} /> Authentic & Accessible</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Typography & Colors */}
        <section className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-8 border-b pb-4 dark:border-slate-800">Typography</h2>
            <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-6xl font-bold mb-4 font-sans">Aa</div>
              <h3 className="text-2xl font-bold mb-2">Montserrat</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Our foundational typeface. Modern, highly legible, and friendly across all communications.
              </p>
              <div className="space-y-4">
                <p className="font-light text-xl">Montserrat Light</p>
                <p className="font-normal text-xl">Montserrat Regular</p>
                <p className="font-bold text-xl">Montserrat Bold</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8 border-b pb-4 dark:border-slate-800">Color System</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-yellow-400 rounded-xl flex items-end p-4 shadow-sm">
                  <span className="font-bold text-yellow-900">Primary Yellow</span>
                </div>
                <div className="h-32 bg-pink-500 rounded-xl flex items-end p-4 shadow-sm">
                  <span className="font-bold text-white">Primary Pink</span>
                </div>
              </div>
              <div className="h-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-xl flex items-end p-4 shadow-sm">
                <span className="font-bold text-white">Brand Gradient</span>
              </div>
            </div>
          </div>
        </section>

        {/* Downloads Hub */}
        <section className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Asset Downloads</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Access the official templates and logo files. Please ensure you follow the placement and styling guidelines when utilizing these assets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <DownloadCard 
              title="Logo Pack" 
              description="Primary, secondary, and monochrome logo variations in SVG and PNG formats."
              token={token}
              endpoint="logos"
            />
            <DownloadCard 
              title="Word Template" 
              description="Official letterheads and document structures."
              token={token}
              endpoint="word"
            />
            <DownloadCard 
              title="PowerPoint Template" 
              description="Slide decks configured with brand gradients and Montserrat typography."
              token={token}
              endpoint="powerpoint"
            />
          </div>
        </section>

      </main>
    </div>
  );
}

// Sub-component for Access Denied State
function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Access Denied</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          You do not have permission to view the Brand OS. Your token may be invalid, expired, or you have not been approved yet.
        </p>
        {/* Update this link here */}
        <Link href="/brand/request">
          <Button className="w-full">Request Access</Button>
        </Link>
      </div>
    </div>
  );
}

// Sub-component for Download Cards
function DownloadCard({ title, description, token, endpoint }: { title: string, description: string, token: string, endpoint: string }) {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="mt-auto pt-6">
        <a href={`/api/brand/download?asset=${endpoint}&token=${token}`}>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <Download size={16} /> Download
          </Button>
        </a>
      </div>
    </div>
  );
}