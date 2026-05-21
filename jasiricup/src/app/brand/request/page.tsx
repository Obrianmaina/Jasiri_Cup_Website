// src/app/brand/request/page.tsx
import BrandAccessForm from '@/components/brand/BrandAccessForm';

export const metadata = {
  title: 'Request Brand Access | JaSiriCup',
  description: 'Request access to the official JaSiriCup Brand Operating System.',
};

export default function BrandRequestPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <BrandAccessForm />
      </div>
    </div>
  );
}