// src/app/brand/request/page.tsx
import BrandAccessForm from '@/components/brand/BrandAccessForm';
import { Lock, FileBadge2, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Request Brand Access | JaSiriCup',
  description: 'Request temporary access to JaSiriCup brand guidelines and assets.',
};

export default function BrandRequestPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        
        {/* Left Side: Context & Rules */}
        <div className="space-y-6 sm:space-y-8 order-2 lg:order-1 mt-8 lg:mt-0">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 sm:mb-6 leading-tight">
              Access the JaSiriCup <span className="text-purple-600 dark:text-purple-400">Brand OS</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Our brand is our most valuable asset. To ensure it is used correctly and beautifully across all touchpoints, we control access to our master files, logos, and typography.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-xl shrink-0 mt-1">
                <Lock className="text-purple-600 dark:text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-1">Time-Bound Access</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">Approved links automatically expire after 30 days to ensure you are always using the most up-to-date assets.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-xl shrink-0 mt-1">
                <FileBadge2 className="text-blue-600 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-1">Full Brand Guidelines</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">Gain entry to our interactive Brand OS containing color codes, exact typography rules, and logo placement guides.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-xl shrink-0 mt-1">
                <ShieldCheck className="text-green-600 dark:text-green-400 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-1">Asset Downloads</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">Download high-resolution vector logos (SVG/PNG), PowerPoint templates, and official document letterheads.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="flex justify-center lg:justify-end order-1 lg:order-2 w-full">
          <div className="w-full max-w-md">
            <BrandAccessForm />
          </div>
        </div>

      </div>
    </div>
  );
}