'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('jasiricup-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('jasiricup-cookie-consent', 'true');
    setShowBanner(false);
  };

  const declineCookies = () => {
    // For GDPR, declining means only essential cookies are used
    localStorage.setItem('jasiricup-cookie-consent', 'essential-only');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 sm:p-6 z-[100] border-t border-gray-800 shadow-2xl">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300 max-w-3xl">
          <p>
            We use cookies to improve your experience, analyze site traffic, and support our mission. 
            By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
            Read our <Link href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link> to learn more.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={declineCookies}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Essential Only
          </button>
          <button 
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};