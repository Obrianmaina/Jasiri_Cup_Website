'use client'; 

import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle"; 

export const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Product', href: '/product' },
    { name: 'Blog', href: '/blog' },
    { name: 'Team', href: '/team' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-900 py-4 relative transition-colors duration-300">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
  {/* Displays ONLY in Light Mode */}
  <Image
    src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/logo_jrc0mv.png"
    alt="JasiriCup Logo"
    width={120}
    height={40}
    priority
    className="block dark:hidden" 
  />

  {/* Displays ONLY in Dark Mode */}
  <Image
    src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png" 
    alt="JasiriCup Logo Dark"
    width={120}
    height={40}
    priority
    className="hidden dark:block" 
  />
</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-8 py-2 space-x-8 transition-colors duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative font-medium transition-colors duration-200
                ${pathname === link.href 
                  ? 'text-gray-800 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }
              `}
            >
              {link.name}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transform translate-y-2"></span>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Button container */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle /> 
          
          <Link href="/admin/dashboard" passHref>
            <Button variant="secondary" size="small">
              Admin
            </Button>
          </Link>
          <Link href="/get-in-touch" className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors">
            Get In Touch
          </Link>
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle /> 
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            ></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-50 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col space-y-4 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium transition-colors duration-200 py-2
                    ${pathname === link.href 
                       ? 'text-gray-800 dark:text-white border-l-4 border-green-500 pl-4' 
                       : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 pl-4'
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Link href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="secondary" size="small" className="w-full">
                  Admin
                </Button>
              </Link>
              <Link 
                 href="/get-in-touch" 
                 onClick={() => setIsMobileMenuOpen(false)}
                className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors text-center font-medium"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};