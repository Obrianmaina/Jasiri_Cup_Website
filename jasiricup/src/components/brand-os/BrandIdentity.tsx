import { LayoutTemplate, CheckCircle, Type, Smile } from 'lucide-react';
import { GuideContent } from '@/types/brand-os';

export function BrandHero({ title, intro }: { title: string, intro: string }) {
  return (
    <div className="bg-slate-900 dark:bg-black text-white pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 mb-10 sm:mb-16 shadow-sm">
      <div className="max-w-6xl mx-auto mt-8">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-700 via-green-400 to-purple-900">
          {title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-medium opacity-90 max-w-2xl leading-relaxed">
          {intro}
        </p>
      </div>
    </div>
  );
}

export function BrandOriginAndVoice({ originStory, voice }: { originStory: GuideContent['originStory'], voice: GuideContent['voice'] }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3"><LayoutTemplate className="text-pink-500 shrink-0" /> {originStory?.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">{originStory?.content}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl sm:text-2xl font-bold mb-4">How We Express Ourselves</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm sm:text-base">{voice?.description}</p>
        <ul className="space-y-4">
          {voice?.traits?.map((trait, idx) => (
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
  );
}

export function BrandTypography({ typography }: { typography: GuideContent['typography'] }) {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6"><Type className="text-blue-500 shrink-0" /> Typography</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed mb-6">{typography?.description}</p>
          <div className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-xs sm:text-sm">
            Primary Font: <span className="font-bold text-purple-600 dark:text-purple-400 break-all">{typography?.primaryFont}</span>
          </div>
        </div>
        <div className="border-l-4 border-purple-500 pl-6 sm:pl-8 py-2 overflow-hidden">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">Aa<br/>Bb<br/>Cc</h1>
          <p className="text-lg sm:text-xl">The quick brown fox jumps over the lazy dog.</p>
        </div>
      </div>
    </section>
  );
}

export function BrandEmojis({ emojiSystem }: { emojiSystem: NonNullable<GuideContent['emojiSystem']> }) {
  return (
    <section className="bg-yellow-50 dark:bg-yellow-900/10 p-6 sm:p-8 md:p-12 rounded-3xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm">
      <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6 sm:mb-8"><Smile className="text-yellow-500 shrink-0" /> Our Emoji System</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-12">
        <div>
          <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-yellow-800 dark:text-yellow-500">Why We Love Them</h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">{emojiSystem.description}</p>
        </div>
        <div>
          <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-yellow-800 dark:text-yellow-500">How We Use Them</h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">{emojiSystem.howToUse}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {emojiSystem.items?.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm border border-yellow-100 dark:border-slate-800 hover:shadow-md transition-shadow">
            <span className="text-4xl sm:text-5xl mb-2 sm:mb-3" role="img" aria-label={item.usage}>{item.icon}</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider leading-tight">{item.usage}</span>
          </div>
        ))}
      </div>
    </section>
  );
}