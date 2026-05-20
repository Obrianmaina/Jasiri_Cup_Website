// src/components/common/Header.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle, useLanguage } from "@/components/common/LanguageToggle";

export const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  // Standalone Links (Home & Product)
  const standaloneLinks = [
    { name: t('home'), href: '/' },
  ];

  // Grouped Navigation Links
  const navGroups = [
    {
      label: "Product",
      links: [
        { name: t('product'), href: '/product' },
        { name: 'Guide', href: '/guide' }, // <--- Added Guide here
        { name: 'FAQS', href: '/faq' },
      ]
    },
    {
      label: "About Us",
      links: [
        { name: t('team'), href: '/team' },
        { name: 'Partners', href: '/partners' },
      ]
    },
    {
      label: "Impact & Media",
      links: [
        { name: t('impact'), href: '/impact' },
        { name: t('stories'), href: '/stories' },
        { name: t('blog'), href: '/blog' },
        { name: 'Press', href: '/press' },
      ]
    },
    {
      label: "Get Involved",
      links: [
        { name: 'Volunteer', href: '/volunteer' },
        { name: 'Newsletter', href: '/newsletter' },
      ]
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative z-[100] transition-colors duration-300">
      
      {/* 1. TOP UTILITY BAR (STAFF LOGIN) */}
      <div className="bg-gray-900 dark:bg-black text-white py-1.5 px-4">
        <div className="container mx-auto flex justify-end">
          <Link 
            href="/admin/dashboard" 
            className="text-[10px] sm:text-xs font-bold tracking-widest uppercase hover:text-purple-400 transition-colors flex items-center gap-2"
          >
            Staff Login
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="bg-white dark:bg-gray-900 py-3 sm:py-4 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <nav className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 mr-4">
            <Image
              src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/logo_jrc0mv.png"
              alt="JasiriCup Logo"
              width={120}
              height={40}
              priority
              className="block dark:hidden max-w-[120px] h-auto"
            />
            <Image
              src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png"
              alt="JasiriCup Logo Dark"
              width={120}
              height={40}
              priority
              className="hidden dark:block max-w-[120px] h-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center justify-center flex-1">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-2 space-x-6 transition-colors duration-300">
              
              {/* Standalone Links */}
              {standaloneLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative text-sm font-semibold transition-colors duration-200 ${
                      isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transform translate-y-2"></span>
                    )}
                  </Link>
                );
              })}

              {/* Dropdown Groups */}
              {navGroups.map((group) => {
                const isActive = group.links.some(link => pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));
                
                return (
                  <div key={group.label} className="relative group">
                    <button className={`relative flex items-center gap-1.5 text-sm font-semibold transition-colors py-1 ${
                      isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}>
                      {group.label}
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:-rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transform translate-y-2"></span>
                      )}
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top -translate-y-2 group-hover:translate-y-0 z-[100] overflow-hidden">
                      <div className="py-2">
                        {group.links.map(link => (
                          <Link 
                            key={link.name} 
                            href={link.href} 
                            className={`block px-5 py-2.5 text-sm transition-colors ${
                              pathname === link.href 
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-purple-600 dark:hover:text-purple-400 font-medium'
                            }`}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden xl:flex items-center space-x-3 shrink-0">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/get-in-touch" className="bg-green-500 text-white px-6 py-2.5 text-sm font-bold rounded-full hover:bg-green-600 transition-colors shadow-sm">
              {t('getInTouch')}
            </Link>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="xl:hidden flex items-center space-x-3">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
              aria-label="Toggle menu"
            >
              <span className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </nav>

        {/* 3. MOBILE MENU OVERLAY */}
        {isMobileMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-xl z-[100] border-t border-gray-100 dark:border-gray-800 transition-colors duration-300 max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              
              {/* Mobile Standalone Links */}
              {standaloneLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-base font-bold transition-colors duration-200 py-3 rounded-lg px-4 mb-2 ${
                      isActive ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white border-l-4 border-green-500 pl-3' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Mobile Grouped Links */}
              {navGroups.map((group) => (
                <div key={group.label} className="mb-4">
                  <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-4">
                    {group.label}
                  </div>
                  <div className="flex flex-col space-y-1 border-l-2 border-gray-100 dark:border-gray-800 ml-5 pl-2">
                    {group.links.map(link => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                          pathname === link.href 
                            ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* Mobile Actions */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/get-in-touch"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors text-center font-bold"
                >
                  {t('getInTouch')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};