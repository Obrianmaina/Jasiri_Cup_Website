'use client';
// src/components/common/LanguageToggle.tsx

import { createContext, useContext, ReactNode } from 'react';

export type Lang = 'en';

// We keep the English strings so your UI does not break
export const translations: Record<string, Record<Lang, string>> = {
  home:        { en: 'Home' },
  product:     { en: 'Product' },
  blog:        { en: 'Blog' },
  team:        { en: 'Team' },
  impact:      { en: 'Our Impact' },
  stories:     { en: 'Stories' },
  partners:    { en: 'Partners' },
  press:       { en: 'Press' },
  volunteer:   { en: 'Volunteer' },
  donate:      { en: 'Donate' },
  getInTouch:  { en: 'Get In Touch' },

  readMore:    { en: 'Read More' },
  learnMore:   { en: 'Learn More' },
 
  orderNow:    { en: 'Order Now' },
  donateToday: { en: 'Donate Today' },
  loading:     { en: 'Loading...' },
  success:     { en: 'Success!' },
  error:       { en: 'Error' },
  required:    { en: 'Required' },
  close:       { en: 'Close' },

  howToUse:          { en: 'How to Use' },
  resourcesDownloads:{ en: 'Resources & Downloads' },
  getYoursToday:     { en: 'Get Yours Today' },
  preparation:       { en: 'Preparation' },
  insertion:         { en: 'Insertion' },
  removal:           { en: 'Removal' },

  realChange:      { en: 'Real Change, Real Numbers' },
  cupsDonated:     { en: 'Cups Donated' },
  girlsImpacted:   { en: 'Girls Impacted' },
  schoolsReached:  { en: 'Schools Reached' },
  countiesCovered: { en: 'Counties Covered' },
  periodsManaged:  { en: 'Periods Managed' },
  activeVolunteers:{ en: 'Active Volunteers' },
  helpUsReach:     { en: 'Help Us Reach More Girls' },

  realPeople:      { en: 'Real People, Real Change' },
  storiesOfImpact: { en: 'Stories of Impact' },
  age:             { en: 'Age' },

  empoweringQuote: { en: '"Empowering girls, one cup at a time."' },
  theTeam:         { en: 'The JasiriCup Team' },

  togetherFurther: { en: 'Together We Go Further' },
  partnerNetwork:  { en: 'Our Partner Network' },
  partnerSchools:  { en: 'Partner Schools' },
  becomePartner:   { en: 'Partner With JasiriCup' },
  downloadPack:    { en: 'Download Partnership Pack' },

  mediaCentre:     { en: 'Media Centre' },
  pressMedia:      { en: 'Press & Media' },
  inTheNews:       { en: 'In the News' },
  downloadAssets:  { en: 'Downloadable Assets' },
  keyFacts:        { en: 'Key Facts for Journalists' },

  volunteerWithUs: { en: 'Volunteer With Us' },
  volunteerRoles:  { en: 'Volunteer Roles' },
  applyToVolunteer:{ en: 'Apply to Volunteer' },
  timeCommitment:  { en: 'Time Commitment' },
  location:        { en: 'Location' },

  placeOrder:    { en: 'Place Your Order' },
  yourInfo:      { en: 'Your Information' },
  selectProduct: { en: 'Select Product' },
  selectColor:   { en: 'Select Color' },
  selectSize:    { en: 'Select Size' },
  quantity:      { en: 'Quantity' },
  customNotes:   { en: 'Custom Notes' },
  addAnother:    { en: 'Add Another Item' },
  submitOrder:   { en: 'Submit Order' },
  outOfStock:    { en: 'Out of stock' },

  keepGirlInSchool: { en: 'Keep a Girl in School' },
  donateACup:       { en: 'Donate a Cup' },
  mpesa:            { en: 'M-Pesa' },
  card:             { en: 'Card' },

  stayConnected: { en: 'Stay Connected' },
  getUpdates:    { en: 'Get Impact Updates' },
  subscribe:     { en: 'Subscribe Free' },
  yourEmail:     { en: 'your@email.com' },

  sendMessage:  { en: 'Send Message' },
  fullName:     { en: 'Full Name' },
  subject:      { en: 'Subject/Topic' },
  message:      { en: 'Message' },

  allRightsReserved: { en: 'All rights reserved.' },
  empoweringGirls: { en: 'Empowering girls, one cup at a time.' }
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations[key]?.en ?? key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const t = (key: string): string => {
    return translations[key]?.en ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang: 'en', setLang: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// Returning null removes the dropdown from your Navbar/Footer completely
export const LanguageToggle = () => {
  return null;
};