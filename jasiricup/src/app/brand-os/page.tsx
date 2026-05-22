// src/app/brand-os/page.tsx
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
import SiteContent from '@/lib/models/SiteContent';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Download, CheckCircle, Type, ImageIcon, Palette, LayoutTemplate, Smile } from 'lucide-react';
import { ContactForm } from '@/components/contact/ContactForm';

interface BrandTrait { name: string; description: string; }
interface ToneDef { name: string; hex: string; }
interface ColorDef { name: string; hex: string; tones?: ToneDef[]; }
interface GradientDef { name: string; from: string; via: string; to: string; }
interface LogoDef { name: string; url: string; type: string; }
interface PhotoDef { url: string; caption: string; }
interface EmojiDef { icon: string; usage: string; }
interface AssetDownload { name: string; desc: string; icon: string; file: string; } // NEW

interface GuideContent {
  title: string;
  intro: string;
  originStory: { title: string; content: string; };
  voice: { description: string; traits: BrandTrait[]; };
  typography: { primaryFont: string; description: string; };
  emojiSystem?: { description: string; howToUse: string; items: EmojiDef[]; };
  logos: { placementRules: string; items: LogoDef[]; };
  colors: { description: string; primary: ColorDef[]; gradients: GradientDef[]; };
  photography: { direction: string; targetDemographic: string; images: PhotoDef[]; };
  logoUsage?: { images: PhotoDef[] }; 
  smiley?: { core: PhotoDef[]; inAction: PhotoDef[] };
  downloads?: AssetDownload[]; // NEW
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
  
  const accessRecord = await BrandAccess.findOne({ 
    accessToken: token, 
    status: 'approved' 
  }).lean<{ expiresAt?: Date | string }>();
  
  if (!accessRecord) return <AccessDenied />;

  if (accessRecord.expiresAt && new Date(accessRecord.expiresAt) < new Date()) {
    return <AccessExpired />;
  }

  const siteData = await SiteContent.findOne({ page: 'brand-os', section: 'main' }).lean<{ content: GuideContent }>();
  
  // Fallback to 'guide' if 'brand-os' isn't found (for backwards compatibility if needed)
  let content = siteData?.content;
  if (!content) {
    const fallbackData = await SiteContent.findOne({ page: 'guide', section: 'main' }).lean<{ content: GuideContent }>();
    content = fallbackData?.content || getFallbackContent();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-10 sm:pb-20">
      
      {/* Hero Section */}
      <div className="bg-slate-900 dark:bg-black text-white pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 mb-10 sm:mb-16 shadow-sm">
        <div className="max-w-6xl mx-auto mt-8">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-700 via-green-400 to-purple-900">
            {content.title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-medium opacity-90 max-w-2xl leading-relaxed">
            {content.intro}
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 space-y-16 sm:space-y-24 w-full overflow-hidden">
        
        {/* Origin & Voice */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3"><LayoutTemplate className="text-pink-500 shrink-0" /> {content.originStory?.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">{content.originStory?.content}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">How We Express Ourselves</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm sm:text-base">{content.voice?.description}</p>
            <ul className="space-y-4">
              {content.voice?.traits?.map((trait, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                  <div className="text-sm sm:text-base">
                    <span className="font-bold text-slate-900 dark:text-white">{trait.name}: </span>
                    <span className="text-slate-600 dark:text-slate-400">{trait.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Colors & Gradients */}
        <section>
          <div className="max-w-3xl mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-4"><Palette className="text-yellow-500 shrink-0" /> Color Strategy</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">{content.colors?.description}</p>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold mb-6">Primary Palette & Tones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
            {content.colors?.primary?.map((color, idx) => (
              <div key={idx} className="group rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="h-32 sm:h-40 w-full transition-transform group-hover:scale-105 origin-bottom" style={{ backgroundColor: color.hex }}></div>
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-lg sm:text-xl mb-1">{color.name}</h4>
                  <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase">{color.hex}</p>
                </div>
                {color.tones && color.tones.length > 0 && (
                  <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 flex-1">
                    <h5 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Acceptable Tones</h5>
                    <div className="space-y-3 sm:space-y-4">
                      {color.tones.map((tone, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-inner border border-black/10 dark:border-white/10 shrink-0" style={{ backgroundColor: tone.hex }}></div>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mb-0.5">{tone.name}</p>
                            <p className="text-slate-500 font-mono text-[10px] sm:text-xs uppercase">{tone.hex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <h3 className="text-lg sm:text-xl font-bold mb-6">Gradients</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {content.colors?.gradients?.map((grad, idx) => {
              const bgGradient = grad.via ? `linear-gradient(to right, ${grad.from}, ${grad.via}, ${grad.to})` : `linear-gradient(to right, ${grad.from}, ${grad.to})`;
              return (
                <div key={idx} className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex items-end p-4 sm:p-6 h-40 sm:h-48 relative group" style={{ background: bgGradient }}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  <div className="bg-white/95 dark:bg-slate-950/95 px-4 py-3 rounded-xl backdrop-blur-md relative z-10 w-full shadow-sm">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1 truncate">{grad.name}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-mono truncate">
                      {grad.from} &rarr; {grad.via ? `${grad.via} \u2192 ` : ''}{grad.to}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Typography */}
        <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6"><Type className="text-blue-500 shrink-0" /> Typography</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed mb-6">{content.typography?.description}</p>
              <div className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-xs sm:text-sm">
                Primary Font: <span className="font-bold text-purple-600 dark:text-purple-400 break-all">{content.typography?.primaryFont}</span>
              </div>
            </div>
            <div className="border-l-4 border-purple-500 pl-6 sm:pl-8 py-2 overflow-hidden">
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">Aa<br/>Bb<br/>Cc</h1>
              <p className="text-lg sm:text-xl">The quick brown fox jumps over the lazy dog.</p>
            </div>
          </div>
        </section>

        {/* Emoji System */}
        {content.emojiSystem && (
          <section className="bg-yellow-50 dark:bg-yellow-900/10 p-6 sm:p-8 md:p-12 rounded-3xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8"><Smile className="text-yellow-500 shrink-0" /> Our Emoji System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-12">
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-yellow-800 dark:text-yellow-500">Why We Love Them</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">{content.emojiSystem.description}</p>
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-yellow-800 dark:text-yellow-500">How We Use Them</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">{content.emojiSystem.howToUse}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {content.emojiSystem.items?.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm border border-yellow-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <span className="text-4xl sm:text-5xl mb-2 sm:mb-3" role="img" aria-label={item.usage}>{item.icon}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider leading-tight">{item.usage}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Logos */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-4">Logo System</h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-3xl">{content.logos?.placementRules}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {content.logos?.items?.map((logo, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 sm:gap-6 shadow-sm">
                <div className="h-20 sm:h-24 w-full flex items-center justify-center bg-gray-200 dark:bg-slate-600 rounded-xl overflow-hidden p-3 sm:p-4">
                  <img src={logo.url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-base sm:text-lg truncate">{logo.name}</h4>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full">
                    {logo.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Logo Usage / Logo In Action */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8"><LayoutTemplate className="text-blue-500 shrink-0" /> Logo in Action</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {content.logoUsage?.images?.map((img, idx) => {
              const isWide = (idx % 4 === 0) || (idx % 4 === 3);
              return (
                <div key={idx} className={`relative rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm flex flex-col ${isWide ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  <img src={img.url} alt={img.caption || 'Logo Usage'} className="w-full h-auto object-cover" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent pt-8 sm:pt-12">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{img.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Our Smiley */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8">Our Smiley</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {content.smiley?.core?.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col border border-slate-200 dark:border-slate-800">
                <img src={img.url} alt={img.caption || 'Our Smiley'} className="w-full h-auto object-contain" />
              </div>
            ))}
            <div className="rounded-3xl shadow-sm flex items-center justify-center p-8 bg-[#1AA75B] min-h-[150px]">
               <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Smiley</h3>
            </div>
          </div>
        </section>

        {/* Smiley In Action */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8">Smiley In Action</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {content.smiley?.inAction?.map((img, idx) => {
              const isWide = (idx % 5 === 3);
              return (
                <div key={idx} className={`relative rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm flex flex-col ${isWide ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  <img src={img.url} alt={img.caption || 'Smiley In Action'} className="w-full h-auto object-cover" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent pt-8 sm:pt-12">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{img.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Photography */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8"><ImageIcon className="text-emerald-500 shrink-0" /> Photography Direction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
              <h3 className="font-bold text-lg sm:text-xl mb-3 text-emerald-800 dark:text-emerald-400">Images in Action</h3>
              <p className="text-emerald-700 dark:text-emerald-500/80 text-sm sm:text-base leading-relaxed">{content.photography?.direction}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/50">
              <h3 className="font-bold text-lg sm:text-xl mb-3 text-blue-800 dark:text-blue-400">Target Demographic</h3>
              <p className="text-blue-700 dark:text-blue-500/80 text-sm sm:text-base leading-relaxed">{content.photography?.targetDemographic}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {content.photography?.images?.map((img, idx) => {
              const isWide = (idx % 4 === 0) || (idx % 4 === 3);
              return (
                <div key={idx} className={`group relative rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm h-[200px] sm:h-[250px] md:h-[300px] ${isWide ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  <img src={img.url} alt={img.caption || 'Brand Imagery'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent pt-8 sm:pt-12">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{img.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Queries / Contact Form */}
        <section className="mt-16 sm:mt-24">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Brand Queries</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-lg leading-relaxed">
              Have questions about logo usage, color pairings, or need approval for a specific design? Reach out to our brand team.
            </p>
          </div>
          <div className="px-2 sm:px-0">
             <ContactForm />
          </div>
        </section>

      </main>
      
      {/* NEW ASSET HUB / FOOTER
        - Dynamically maps through content.downloads
        - Fully mobile responsive with padding and flex-wrap 
      */}
      {content.downloads && content.downloads.length > 0 && (
        <div className="px-4 sm:px-6 md:px-12 mt-16 sm:mt-24">
          <footer className="max-w-6xl mx-auto bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 sm:p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
            <div className="text-center md:text-left w-full md:w-auto">
              <h4 className="text-2xl sm:text-3xl font-bold mb-2">Downloadable Assets</h4>
              <p className="opacity-70 text-sm sm:text-lg">Official logos, templates, and typography packs.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-end gap-3 sm:gap-4 w-full md:w-auto">
              {content.downloads.map((asset, idx) => (
                <a key={idx} href={`/api/brand/download?asset=${asset.file}&token=${token}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 hover:bg-white/20 text-white flex items-center justify-center gap-2 h-12 px-6">
                    <span className="text-lg">{asset.icon}</span> {asset.name}
                  </Button>
                </a>
              ))}
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-500 mb-3 sm:mb-4">Access Denied</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">You do not have permission to view this page. Please request access through our brand portal.</p>
        <Link href="/brand/request"><Button className="w-full h-12 rounded-xl font-bold">Request Access</Button></Link>
      </div>
    </div>
  );
}

function AccessExpired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-500 mb-3 sm:mb-4">Link Expired</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">Your 30-day access to the Brand OS has expired. If you still need access to our assets, please submit a new request.</p>
        <Link href="/brand/request"><Button className="w-full h-12 rounded-xl font-bold">Request New Access</Button></Link>
      </div>
    </div>
  );
}

function getFallbackContent(): GuideContent {
  return {
    title: "JaSiriCup Brand OS",
    intro: "Joy, empowerment, and approachability. Welcome to the visual foundation of our bold initiative.",
    originStory: { title: "The Origin of Our Name", content: "Our brand identity is built on joy, empowerment, and approachability..." },
    voice: { description: "The way we sound is a direct extension of our visual warmth...", traits: [] },
    typography: { primaryFont: "Montserrat", description: "We use Montserrat as our foundational typeface..." },
    logos: { placementRules: "For video content, maintain clear and consistent logo placement...", items: [] },
    colors: { description: "We rely on a dynamic mix of vibrant Primary Colors and energetic Gradients...", primary: [], gradients: [] },
    photography: { direction: "Our photographic style is authentic and radiant...", targetDemographic: "The subjects featured in our imagery are young people...", images: [] },
    smiley: { core: [], inAction: [] },
    downloads: []
  };
}