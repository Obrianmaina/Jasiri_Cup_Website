'use client';
// src/components/common/LanguageToggle.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// ✅ 1. Add more languages
export type Lang = 'en' | 'sw' | 'fr' | 'de';

// ── Translation strings ────────────────────────────────────────────────────
export const translations: Record<string, Record<Lang, string>> = {
  home:        { en: 'Home', sw: 'Nyumbani', fr: 'Accueil', de: 'Startseite' },
  product:     { en: 'Product', sw: 'Bidhaa', fr: 'Produit', de: 'Produkt' },
  blog:        { en: 'Blog', sw: 'Blogu', fr: 'Blog', de: 'Blog' },
  team:        { en: 'Team', sw: 'Timu', fr: 'Équipe', de: 'Team' },
  impact:      { en: 'Our Impact', sw: 'Athari Yetu', fr: 'Notre Impact', de: 'Unsere Wirkung' },
  stories:     { en: 'Stories', sw: 'Hadithi', fr: 'Histoires', de: 'Geschichten' },
  partners:    { en: 'Partners', sw: 'Washirika', fr: 'Partenaires', de: 'Partner' },
  press:       { en: 'Press', sw: 'Wanahabari', fr: 'Presse', de: 'Presse' },
  volunteer:   { en: 'Volunteer', sw: 'Kujitolea', fr: 'Bénévole', de: 'Freiwillige' },
  donate:      { en: 'Donate', sw: 'Changia', fr: 'Faire un don', de: 'Spenden' },
  getInTouch:  { en: 'Get In Touch', sw: 'Wasiliana Nasi', fr: 'Contactez-nous', de: 'Kontakt' },

  readMore:    { en: 'Read More', sw: 'Soma Zaidi', fr: 'Lire plus', de: 'Mehr lesen' },
  learnMore:   { en: 'Learn More', sw: 'Jifunza Zaidi', fr: 'En savoir plus', de: 'Mehr erfahren' },
 
  orderNow:    { en: 'Order Now',    sw: 'Agiza Sasa', fr: 'Commander maintenant', de: 'Jetzt bestellen' },
  donateToday: { en: 'Donate Today', sw: 'Changia Leo', fr: 'Faire un don aujourd’hui', de: 'Heute spenden' },
  loading:     { en: 'Loading...',   sw: 'Inapakia...', fr: 'Chargement...', de: 'Lädt...' },
  success:     { en: 'Success!',     sw: 'Imefaulu!', fr: 'Succès !', de: 'Erfolg!' },
  error:       { en: 'Error',        sw: 'Hitilafu', fr: 'Erreur', de: 'Fehler' },
  required:    { en: 'Required',     sw: 'Inahitajika', fr: 'Requis', de: 'Erforderlich' },
  close:       { en: 'Close',        sw: 'Funga', fr: 'Fermer', de: 'Schließen' },

  // Product Page
  howToUse:          { en: 'How to Use', sw: 'Jinsi ya Kutumia', fr: 'Comment utiliser', de: 'Anwendung' },
  resourcesDownloads:{ en: 'Resources & Downloads', sw: 'Rasilimali na Vipakuliwa', fr: 'Ressources et téléchargements', de: 'Ressourcen & Downloads' },
  getYoursToday:     { en: 'Get Yours Today', sw: 'Pata Yako Leo', fr: 'Obtenez le vôtre aujourd’hui', de: 'Hol dir deins noch heute' },
  preparation:       { en: 'Preparation', sw: 'Maandalizi', fr: 'Préparation', de: 'Vorbereitung' },
  insertion:         { en: 'Insertion', sw: 'Kuingiza', fr: 'Insertion', de: 'Einführen' },
  removal:           { en: 'Removal', sw: 'Kuondoa', fr: 'Retrait', de: 'Entfernung' },

  // Impact Page
  realChange:      { en: 'Real Change, Real Numbers', sw: 'Mabadiliko Halisi, Nambari Halisi', fr: 'Un vrai changement, de vrais chiffres', de: 'Echter Wandel, echte Zahlen' },
  cupsDonated:     { en: 'Cups Donated', sw: 'Vikombe Vilivyotolewa', fr: 'Coupes données', de: 'Gespendete Cups' },
  girlsImpacted:   { en: 'Girls Impacted', sw: 'Wasichana Waliofikiwa', fr: 'Filles impactées', de: 'Erreichte Mädchen' },
  schoolsReached:  { en: 'Schools Reached', sw: 'Shule Zilizofikiwa', fr: 'Écoles atteintes', de: 'Erreichte Schulen' },
  countiesCovered: { en: 'Counties Covered', sw: 'Kaunti Zilizofikiwa', fr: 'Comtés couverts', de: 'Abgedeckte Regionen' },
  periodsManaged:  { en: 'Periods Managed', sw: 'Hedhi Zilizodhibitiwa', fr: 'Règles gérées', de: 'Bewältigte Perioden' },
  activeVolunteers:{ en: 'Active Volunteers', sw: 'Wanaojitolea', fr: 'Bénévoles actifs', de: 'Aktive Freiwillige' },
  helpUsReach:     { en: 'Help Us Reach More Girls', sw: 'Tusaidie Kufikia Wasichana Zaidi', fr: 'Aidez-nous à atteindre plus de filles', de: 'Hilf uns, mehr Mädchen zu erreichen' },

  // Stories Page
  realPeople:      { en: 'Real People, Real Change', sw: 'Watu Halisi, Mabadiliko Halisi', fr: 'De vraies personnes, un vrai changement', de: 'Echte Menschen, echter Wandel' },
  storiesOfImpact: { en: 'Stories of Impact', sw: 'Hadithi za Athari', fr: 'Histoires d’impact', de: 'Geschichten des Wandels' },
  age:             { en: 'Age', sw: 'Umri', fr: 'Âge', de: 'Alter' },

  // Team Page
  empoweringQuote: { en: '"Empowering girls, one cup at a time."', sw: '"Kuwawezesha wasichana, kikombe kimoja kwa wakati."', fr: '"Autonomiser les filles, une coupe à la fois."', de: '"Mädchen stärken, eine Tasse nach der anderen."' },
  theTeam:         { en: 'The JasiriCup Team', sw: 'Timu ya JasiriCup', fr: 'L’équipe JasiriCup', de: 'Das JasiriCup-Team' },

  // Partners Page
  togetherFurther: { en: 'Together We Go Further', sw: 'Pamoja Tunafika Mbali Zaidi', fr: 'Ensemble, nous allons plus loin', de: 'Gemeinsam kommen wir weiter' },
  partnerNetwork:  { en: 'Our Partner Network', sw: 'Mtandao wa Washirika Wetu', fr: 'Notre réseau de partenaires', de: 'Unser Partnernetzwerk' },
  partnerSchools:  { en: 'Partner Schools', sw: 'Shule Washirika', fr: 'Écoles partenaires', de: 'Partnerschulen' },
  becomePartner:   { en: 'Partner With JasiriCup', sw: 'Shirikiana na JasiriCup', fr: 'Devenez partenaire de JasiriCup', de: 'Partner von JasiriCup werden' },
  downloadPack:    { en: 'Download Partnership Pack', sw: 'Pakua Mwongozo wa Ubia', fr: 'Télécharger le pack partenariat', de: 'Partnerschaftspaket herunterladen' },

  // Press Page
  mediaCentre:     { en: 'Media Centre', sw: 'Kituo cha Habari', fr: 'Centre des médias', de: 'Medienzentrum' },
  pressMedia:      { en: 'Press & Media', sw: 'Vyombo vya Habari', fr: 'Presse et médias', de: 'Presse & Medien' },
  inTheNews:       { en: 'In the News', sw: 'Kwenye Habari', fr: 'Dans les actualités', de: 'In den Nachrichten' },
  downloadAssets:  { en: 'Downloadable Assets', sw: 'Rasilimali za Kupakua', fr: 'Ressources téléchargeables', de: 'Downloadbare Ressourcen' },
  keyFacts:        { en: 'Key Facts for Journalists', sw: 'Ukweli Muhimu kwa Wanahabari', fr: 'Faits clés pour journalistes', de: 'Wichtige Fakten für Journalisten' },

  // Volunteer Page
  volunteerWithUs: { en: 'Volunteer With Us', sw: 'Jitolee Pamoja Nasi', fr: 'Devenez bénévole', de: 'Freiwillig mitmachen' },
  volunteerRoles:  { en: 'Volunteer Roles', sw: 'Majukumu ya Kujitolea', fr: 'Rôles des bénévoles', de: 'Freiwilligenrollen' },
  applyToVolunteer:{ en: 'Apply to Volunteer', sw: 'Tuma Maombi ya Kujitolea', fr: 'Postuler comme bénévole', de: 'Als Freiwilliger bewerben' },
  timeCommitment:  { en: 'Time Commitment', sw: 'Muda Unaohitajika', fr: 'Engagement de temps', de: 'Zeitaufwand' },
  location:        { en: 'Location', sw: 'Eneo', fr: 'Lieu', de: 'Standort' },

  // Order Page
  placeOrder:    { en: 'Place Your Order', sw: 'Weka Oda Yako', fr: 'Passez votre commande', de: 'Bestellung aufgeben' },
  yourInfo:      { en: 'Your Information', sw: 'Taarifa Zako', fr: 'Vos informations', de: 'Ihre Informationen' },
  selectProduct: { en: 'Select Product', sw: 'Chagua Bidhaa', fr: 'Sélectionner un produit', de: 'Produkt auswählen' },
  selectColor:   { en: 'Select Color', sw: 'Chagua Rangi', fr: 'Choisir une couleur', de: 'Farbe auswählen' },
  selectSize:    { en: 'Select Size', sw: 'Chagua Ukubwa', fr: 'Choisir la taille', de: 'Größe auswählen' },
  quantity:      { en: 'Quantity', sw: 'Idadi', fr: 'Quantité', de: 'Menge' },
  customNotes:   { en: 'Custom Notes', sw: 'Maelezo ya Ziada', fr: 'Notes personnalisées', de: 'Individuelle Notizen' },
  addAnother:    { en: 'Add Another Item', sw: 'Ongeza Bidhaa Nyingine', fr: 'Ajouter un autre article', de: 'Weiteren Artikel hinzufügen' },
  submitOrder:   { en: 'Submit Order', sw: 'Tuma Oda', fr: 'Envoyer la commande', de: 'Bestellung absenden' },
  outOfStock:    { en: 'Out of stock', sw: 'Imeisha Stokini', fr: 'Rupture de stock', de: 'Nicht auf Lager' },

  // Donate Page
  keepGirlInSchool: { en: 'Keep a Girl in School', sw: 'Mwache Msichana Aendelee Shuleni', fr: 'Maintenir une fille à l’école', de: 'Ein Mädchen in der Schule halten' },
  donateACup:       { en: 'Donate a Cup', sw: 'Changia Kikombe', fr: 'Donner une coupe', de: 'Eine Tasse spenden' },
  mpesa:            { en: 'M-Pesa', sw: 'M-Pesa', fr: 'M-Pesa', de: 'M-Pesa' },
  card:             { en: 'Card', sw: 'Kadi', fr: 'Carte', de: 'Karte' },

  // Newsletter
  stayConnected: { en: 'Stay Connected', sw: 'Endelea Kuunganika', fr: 'Restez connecté', de: 'In Verbindung bleiben' },
  getUpdates:    { en: 'Get Impact Updates', sw: 'Pata Taarifa za Athari', fr: 'Recevez des mises à jour', de: 'Updates erhalten' },
  subscribe:     { en: 'Subscribe Free', sw: 'Jiandikishe Bure', fr: 'S’abonner gratuitement', de: 'Kostenlos abonnieren' },
  yourEmail:     { en: 'your@email.com', sw: 'barua.pepe@mfano.com', fr: 'votre@email.com', de: 'deine@email.com' },

  // Contact
  sendMessage:  { en: 'Send Message', sw: 'Tuma Ujumbe', fr: 'Envoyer le message', de: 'Nachricht senden' },
  fullName:     { en: 'Full Name', sw: 'Jina Kamili', fr: 'Nom complet', de: 'Vollständiger Name' },
  subject:      { en: 'Subject/Topic', sw: 'Mada', fr: 'Sujet', de: 'Betreff' },
  message:      { en: 'Message', sw: 'Ujumbe', fr: 'Message', de: 'Nachricht' },

  // Footer
  allRightsReserved: {
    en: 'All rights reserved.',
    sw: 'Haki zote zimehifadhiwa.',
    fr: 'Tous droits réservés.',
    de: 'Alle Rechte vorbehalten.',
  },
  empoweringGirls: {
    en: 'Empowering girls, one cup at a time.',
    sw: 'Kuwawezesha wasichana, kikombe kimoja kwa wakati.',
    fr: 'Autonomiser les filles, une coupe à la fois.',
    de: 'Mädchen stärken, eine Tasse nach der anderen.',
  }


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

    if (saved && ['en', 'sw', 'fr', 'de'].includes(saved)) {
      setLangState(saved);
    }
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

// ── Dropdown Selector ──────────────────────────────────────────────────────
export const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="appearance-none bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg pl-3 pr-8 py-1.5 border border-gray-200 dark:border-gray-700 cursor-pointer focus:ring-2 focus:ring-purple-500 outline-none"
        aria-label="Select language"
      >
        <option value="en">🇬🇧 EN</option>
        <option value="sw">🇰🇪 SW</option>
        <option value="fr">🇫🇷 FR</option>
        <option value="de">🇩🇪 DE</option>
      </select>

      {/* Custom arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};