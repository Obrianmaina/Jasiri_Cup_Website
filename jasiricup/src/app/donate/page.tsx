// src/app/donate/page.tsx
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { DonateClient } from '@/components/donate/DonateClient';

export const metadata: Metadata = {
  title: 'Donate | JasiriCup — Keep a Girl in School',
  description:
    'Donate a menstrual cup and keep a girl in school. Every cup lasts up to 10 years. M-Pesa and card payments accepted.',
  openGraph: {
    title: 'Donate to JasiriCup',
    description: 'Keep a girl in school for 10 years with a single cup donation.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Donate', href: '/donate' },
];

export default function DonatePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      <DonateClient />
    </div>
  );
}