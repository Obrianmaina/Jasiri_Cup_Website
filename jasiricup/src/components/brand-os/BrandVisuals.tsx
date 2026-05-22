import { Palette, LayoutTemplate, ImageIcon } from 'lucide-react';
import { GuideContent } from '@/types/brand-os';

export function BrandColors({ colors }: { colors: GuideContent['colors'] }) {
  return (
    <section>
      <div className="max-w-3xl mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-4"><Palette className="text-yellow-500 shrink-0" /> Color Strategy</h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">{colors?.description}</p>
      </div>
      
      <h3 className="text-lg sm:text-xl font-bold mb-6">Primary Palette & Tones</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
        {colors?.primary?.map((color, idx) => (
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
        {colors?.gradients?.map((grad, idx) => {
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
  );
}

export function BrandLogos({ logos, logoUsage }: { logos: GuideContent['logos'], logoUsage: GuideContent['logoUsage'] }) {
  return (
    <>
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-4">Logo System</h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-3xl">{logos?.placementRules}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {logos?.items?.map((logo, idx) => (
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
      
      <section className="mt-16 sm:mt-24">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8"><LayoutTemplate className="text-blue-500 shrink-0" /> Logo in Action</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {logoUsage?.images?.map((img, idx) => {
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
    </>
  );
}

export function BrandSmiley({ smiley }: { smiley: GuideContent['smiley'] }) {
  return (
    <>
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8">Our Smiley</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {smiley?.core?.slice(0, 2).map((img, idx) => (
            <div key={idx} className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col border border-slate-200 dark:border-slate-800">
              <img src={img.url} alt={img.caption || 'Our Smiley'} className="w-full h-auto object-contain" />
            </div>
          ))}
          <div className="rounded-3xl shadow-sm flex items-center justify-center p-8 bg-[#1AA75B] min-h-[150px]">
             <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Smiley</h3>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-24">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8">Smiley In Action</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {smiley?.inAction?.map((img, idx) => {
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
    </>
  );
}

export function BrandPhotography({ photography }: { photography: GuideContent['photography'] }) {
  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8"><ImageIcon className="text-emerald-500 shrink-0" /> Photography Direction</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-6 sm:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
          <h3 className="font-bold text-lg sm:text-xl mb-3 text-emerald-800 dark:text-emerald-400">Images in Action</h3>
          <p className="text-emerald-700 dark:text-emerald-500/80 text-sm sm:text-base leading-relaxed">{photography?.direction}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/50">
          <h3 className="font-bold text-lg sm:text-xl mb-3 text-blue-800 dark:text-blue-400">Target Demographic</h3>
          <p className="text-blue-700 dark:text-blue-500/80 text-sm sm:text-base leading-relaxed">{photography?.targetDemographic}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
        {photography?.images?.map((img, idx) => {
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
  );
}