// src/app/admin/dashboard/layout.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/admin/blog", label: "Blog Posts", icon: "📝" },
  { href: "/admin/pages", label: "Page Content", icon: "🗂️" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/messages", label: "Messages", icon: "✉️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-bold text-purple-700 tracking-tight">
                Jasiri Admin
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || 
                  (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* View site link */}
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-purple-300"
              >
                <span>🌐</span>
                <span>View Site</span>
              </Link>

              {/* Admin avatar */}
              <div className="w-8 h-8 bg-purple-100 rounded-full border-2 border-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm">
                A
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>↩</span>
                <span>Logout</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || 
                  (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <span>🌐</span>
                  <span>View Site</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <span>↩</span>
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}