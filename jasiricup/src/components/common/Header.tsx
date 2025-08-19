'use client'; // Mark as a Client Component to use hooks like usePathname

import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState } from 'react'; // Add useState for mobile menu state
import { Button } from "@/components/ui/Button";

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
    <header className="bg-white py-4 relative">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/logo_jrc0mv.png"
            alt="JasiriCup Logo"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-8 py-2 space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200
                ${pathname === link.href ? 'text-gray-800' : ''}
              `}
            >
              {link.name}
              {/* Green underline for active link */}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transform translate-y-2"></span>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Button container - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/admin/dashboard" passHref>
            <Button variant="secondary" size="small">
              Admin
            </Button>
          </Link>
          <Link href="/get-in-touch" className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors">
            Get In Touch
          </Link>
        </div>

        {/* Mobile Hamburger Menu Button - Visible only on mobile */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          ></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay - Only visible when menu is open */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-50 border-t border-gray-200">
          <div className="container mx-auto px-4 py-6">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-4 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu when link is clicked
                  className={`text-lg font-medium transition-colors duration-200 py-2
                    ${pathname === link.href 
                      ? 'text-gray-800 border-l-4 border-green-500 pl-4' 
                      : 'text-gray-700 hover:text-purple-600 pl-4'
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Buttons */}
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
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