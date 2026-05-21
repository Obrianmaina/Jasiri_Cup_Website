// src/app/brand-os/page.tsx
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
import SiteContent from '@/lib/models/SiteContent';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Download, CheckCircle, Palette } from 'lucide-react';

// Define the structure for your Guide content
interface GuideSection {
  heading: string;
  content: string;
  bullets: string[];
  image?: string;
}

interface GuideContent {
  title: string;
  intro: string;
  sections: GuideSection[];
}

export const metadata = {
  title: 'Brand Operating System | JaSiriCup',
  description: 'Official brand guidelines and asset downloads for JaSiriCup.',
};

export default async function BrandOSPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ token?: string }> 
}) {
  const { token } = await searchParams;

  if (!token) return <AccessDenied />;

  await dbConnect();
  
  // 1. Verify Access
  const accessRecord = await BrandAccess.findOne({ 
    accessToken: token, 
    status: 'approved' 
  }).lean();

  if (!accessRecord) return <AccessDenied />;

  // 2. Fetch Dynamic Content from SiteContent model
  const siteData = await SiteContent.findOne({ page: 'guide', section: 'main' }).lean<{ content: GuideContent }>();
  const content = siteData?.content || { 
    title: "JaSiriCup Brand OS", 
    intro: "Joy, empowerment, and approachability. Welcome to the visual foundation of our bold initiative.", 
    sections: [] 
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 p-6 md:p-12">
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-[2rem] p-12 md:p-20 text-white shadow-xl">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">{content.title}</h1>
        <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl">{content.intro}</p>
      </div>

      {/* Bento Grid Layout */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.sections.map((section: GuideSection, idx: number) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Palette className="text-pink-500" /> {section.heading}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{section.content}</p>
            
            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-3 mb-6">
                {section.bullets.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-medium">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
            )}
            
            {section.image && (
              <img src={section.image} className="rounded-2xl w-full h-48 object-cover" alt={section.heading} />
            )}
          </div>
        ))}
      </main>
      
      {/* Asset Hub */}
      <footer className="max-w-6xl mx-auto mt-16 bg-slate-900 dark:bg-slate-800 rounded-3xl p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h4 className="text-2xl font-bold mb-2">Downloadable Assets</h4>
          <p className="opacity-70">Official logos, templates, and typography packs.</p>
        </div>
        <div className="flex gap-4">
          <DownloadButton token={token} endpoint="logos" label="Logo Pack" />
          <DownloadButton token={token} endpoint="word" label="Word Template" />
          <DownloadButton token={token} endpoint="powerpoint" label="PPT Template" />
        </div>
      </footer>
    </div>
  );
}

function DownloadButton({ token, endpoint, label }: { token: string, endpoint: string, label: string }) {
  return (
    <a href={`/api/brand/download?asset=${endpoint}&token=${token}`}>
      <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white flex items-center gap-2">
        <Download size={16} /> {label}
      </Button>
    </a>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-slate-600 mb-8">You do not have permission to view this page. Please request access.</p>
        <Link href="/brand/request"><Button className="w-full">Request Access</Button></Link>
      </div>
    </div>
  );
}