'use client';
// src/components/common/LanguageToggle.tsx
// Simple EN <-> SW toggle stored in localStorage + a React context.
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
  partners:    { en: 'Partners',     sw: 'Washirika' },
  press:       { en: 'Press',        sw: 'Wanahabari' },
  volunteer:   { en: 'Volunteer',    sw: 'Kujitolea' },
  donate:      { en: 'Donate',       sw: 'Changia' },
  getInTouch:  { en: 'Get In Touch', sw: 'Wasiliana Nasi' },

  // General Actions / UI
  readMore:    { en: 'Read More',    sw: 'Soma Zaidi' },
  learnMore:   { en: 'Learn More',   sw: 'Jifunza Zaidi' },
  orderNow:    { en: 'Order Now',    sw: 'Agiza Sasa' },
  donateToday: { en: 'Donate Today', sw: 'Changia Leo' },
  loading:     { en: 'Loading...',   sw: 'Inapakia...' },
  success:     { en: 'Success!',     sw: 'Imefaulu!' },
  error:       { en: 'Error',        sw: 'Hitilafu' },
  required:    { en: 'Required',     sw: 'Inahitajika' },
  close:       { en: 'Close',        sw: 'Funga' },

  // Product Page
  howToUse:          { en: 'How to Use',            sw: 'Jinsi ya Kutumia' },
  resourcesDownloads:{ en: 'Resources & Downloads', sw: 'Rasilimali na Vipakuliwa' },
  getYoursToday:     { en: 'Get Yours Today',       sw: 'Pata Yako Leo' },
  preparation:       { en: 'Preparation',           sw: 'Maandalizi' },
  insertion:         { en: 'Insertion',             sw: 'Kuingiza' },
  removal:           { en: 'Removal',               sw: 'Kuondoa' },

  // Impact Page
  realChange:      { en: 'Real Change, Real Numbers', sw: 'Mabadiliko Halisi, Nambari Halisi' },
  cupsDonated:     { en: 'Cups Donated',              sw: 'Vikombe Vilivyotolewa' },
  girlsImpacted:   { en: 'Girls Impacted',            sw: 'Wasichana Waliofikiwa' },
  schoolsReached:  { en: 'Schools Reached',           sw: 'Shule Zilizofikiwa' },
  countiesCovered: { en: 'Counties Covered',          sw: 'Kaunti Zilizofikiwa' },
  periodsManaged:  { en: 'Periods Managed',           sw: 'Hedhi Zilizodhibitiwa' },
  activeVolunteers:{ en: 'Active Volunteers',         sw: 'Wanaojitolea' },
  helpUsReach:     { en: 'Help Us Reach More Girls',  sw: 'Tusaidie Kufikia Wasichana Zaidi' },

  // Stories Page
  realPeople:      { en: 'Real People, Real Change',  sw: 'Watu Halisi, Mabadiliko Halisi' },
  storiesOfImpact: { en: 'Stories of Impact',         sw: 'Hadithi za Athari' },
  age:             { en: 'Age',                       sw: 'Umri' },

  // Team Page
  empoweringQuote: { en: '"Empowering girls, one cup at a time."', sw: '"Kuwawezesha wasichana, kikombe kimoja kwa wakati."' },
  theTeam:         { en: 'The JasiriCup Team', sw: 'Timu ya JasiriCup' },

  // Partners Page
  togetherFurther: { en: 'Together We Go Further',    sw: 'Pamoja Tunafika Mbali Zaidi' },
  partnerNetwork:  { en: 'Our Partner Network',       sw: 'Mtandao wa Washirika Wetu' },
  partnerSchools:  { en: 'Partner Schools',           sw: 'Shule Washirika' },
  becomePartner:   { en: 'Partner With JasiriCup',    sw: 'Shirikiana na JasiriCup' },
  downloadPack:    { en: 'Download Partnership Pack', sw: 'Pakua Mwongozo wa Ubia' },

  // Press Page
  mediaCentre:     { en: 'Media Centre',              sw: 'Kituo cha Habari' },
  pressMedia:      { en: 'Press & Media',             sw: 'Vyombo vya Habari' },
  inTheNews:       { en: 'In the News',               sw: 'Kwenye Habari' },
  downloadAssets:  { en: 'Downloadable Assets',       sw: 'Rasilimali za Kupakua' },
  keyFacts:        { en: 'Key Facts for Journalists', sw: 'Ukweli Muhimu kwa Wanahabari' },

  // Volunteer Page
  volunteerWithUs: { en: 'Volunteer With Us',       sw: 'Jitolee Pamoja Nasi' },
  volunteerRoles:  { en: 'Volunteer Roles',         sw: 'Majukumu ya Kujitolea' },
  applyToVolunteer:{ en: 'Apply to Volunteer',      sw: 'Tuma Maombi ya Kujitolea' },
  timeCommitment:  { en: 'Time Commitment',         sw: 'Muda Unaohitajika' },
  location:        { en: 'Location',                sw: 'Eneo' },

  // Order Page
  placeOrder:    { en: 'Place Your Order',  sw: 'Weka Oda Yako' },
  yourInfo:      { en: 'Your Information',  sw: 'Taarifa Zako' },
  selectProduct: { en: 'Select Product',    sw: 'Chagua Bidhaa' },
  selectColor:   { en: 'Select Color',      sw: 'Chagua Rangi' },
  selectSize:    { en: 'Select Size',       sw: 'Chagua Ukubwa' },
  quantity:      { en: 'Quantity',          sw: 'Idadi' },
  customNotes:   { en: 'Custom Notes',      sw: 'Maelezo ya Ziada' },
  addAnother:    { en: 'Add Another Item',  sw: 'Ongeza Bidhaa Nyingine' },
  submitOrder:   { en: 'Submit Order',      sw: 'Tuma Oda' },
  outOfStock:    { en: 'Out of stock',      sw: 'Imeisha Stokini' },

  // Donate page
  keepGirlInSchool: { en: 'Keep a Girl in School', sw: 'Mwache Msichana Aendelee Shuleni' },
  donateACup:       { en: 'Donate a Cup',          sw: 'Changia Kikombe' },
  mpesa:            { en: 'M-Pesa',                sw: 'M-Pesa' },
  card:             { en: 'Card',                  sw: 'Kadi' },

  // Newsletter
  stayConnected: { en: 'Stay Connected',     sw: 'Endelea Kuunganika' },
  getUpdates:    { en: 'Get Impact Updates', sw: 'Pata Taarifa za Athari' },
  subscribe:     { en: 'Subscribe Free',     sw: 'Jiandikishe Bure' },
  yourEmail:     { en: 'your@email.com',     sw: 'barua.pepe@mfano.com' },

  // Contact
  sendMessage:  { en: 'Send Message',  sw: 'Tuma Ujumbe' },
  fullName:     { en: 'Full Name',     sw: 'Jina Kamili' },
  subject:      { en: 'Subject/Topic', sw: 'Mada' },
  message:      { en: 'Message',       sw: 'Ujumbe' },

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