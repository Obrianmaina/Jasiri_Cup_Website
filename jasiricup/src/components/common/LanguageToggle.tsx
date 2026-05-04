'use client';
// src/components/common/LanguageToggle.tsx
// Simple EN ↔ SW toggle stored in localStorage + a React context.
// Pages can call useLanguage() to get { lang, t } for translations.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type Lang = 'en' | 'sw';

// ── Translation strings ────────────────────────────────────────────────────
export const translations: Record<string, Record<Lang, string>> = {
  // Nav
  home:        { en: 'Home',         sw: 'Nyumbani' },
  product:     { en: 'Product',      sw: 'Bidhaa' },
  blog:        { en: 'Blog',         sw: 'Blogu' },
  team:        { en: 'Team',         sw: 'Timu' },
  impact:      { en: 'Our Impact',   sw: 'Athari Yetu' },
  stories:     { en: 'Stories',      sw: 'Hadithi' },
  donate:      { en: 'Donate',       sw: 'Changia' },
  getInTouch:  { en: 'Get In Touch', sw: 'Wasiliana Nasi' },

  // Homepage
  readMore:    { en: 'Read More',    sw: 'Soma Zaidi' },
  learnMore:   { en: 'Learn More',   sw: 'Jifunza Zaidi' },
  orderNow:    { en: 'Order Now',    sw: 'Agiza Sasa' },
  donateToday: { en: 'Donate Today', sw: 'Changia Leo' },

  // Donate page
  keepGirlInSchool: {
    en: 'Keep a Girl in School',
    sw: 'Mwache Msichana Aendelee Shuleni',
  },
  donateACup: {
    en: 'Donate a Cup',
    sw: 'Changia Kikombe',
  },
  mpesa:  { en: 'M-Pesa',  sw: 'M-Pesa' },
  card:   { en: 'Card',    sw: 'Kadi' },

  // Newsletter
  stayConnected: { en: 'Stay Connected',    sw: 'Endelea Kuunganika' },
  getUpdates:    { en: 'Get Impact Updates', sw: 'Pata Taarifa za Athari' },
  subscribe:     { en: 'Subscribe Free',     sw: 'Jiandikishe Bure' },
  yourEmail:     { en: 'your@email.com',     sw: 'barua.pepe@mfano.com' },

  // Contact
  sendMessage:  { en: 'Send Message', sw: 'Tuma Ujumbe' },
  fullName:     { en: 'Full Name',    sw: 'Jina Kamili' },
  subject:      { en: 'Subject/Topic', sw: 'Mada' },
  message:      { en: 'Message',      sw: 'Ujumbe' },

  // Footer
  allRightsReserved: {
    en: 'All rights reserved.',
    sw: 'Haki zote zimehifadhiwa.',
  },
  empoweringGirls: {
    en: 'Empowering girls, one cup at a time.',
    sw: 'Kuwawezesha wasichana, kikombe kimoja kwa wakati.',
  },
};

// ── Context ────────────────────────────────────────────────────────────────
interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('jasiricup-lang') as Lang | null;
    if (saved === 'en' || saved === 'sw') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('jasiricup-lang', l);
  };

  const t = (key: string): string => {
    if (!mounted) return translations[key]?.en ?? key;
    return translations[key]?.[lang] ?? translations[key]?.en ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// ── Toggle button ──────────────────────────────────────────────────────────
export const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
      title={lang === 'en' ? 'Switch to Kiswahili' : 'Switch to English'}
      aria-label="Toggle language"
    >
      <span className="text-base leading-none">
        {lang === 'en' ? '🇬🇧' : '🇰🇪'}
      </span>
      <span className="uppercase text-xs tracking-wider">
        {lang === 'en' ? 'SW' : 'EN'}
      </span>
    </button>
  );
};