'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle"; 
import { 
  Home, 
  Wallet, 
  FileText, 
  Layout, 
  BarChart, 
  ShoppingBag, 
  Mail, 
  HelpCircle, 
  Palette 
} from "lucide-react";

const navLinks = [
  { href: "/admin/dashboard", icon: <Home size={20} />, label: "Dashboard" },
  { href: "/admin/finances", icon: <Wallet size={20} />, label: "Finances" },
  { href: "/admin/blog", icon: <FileText size={20} />, label: "Blog" },
  { href: "/admin/pages", icon: <Layout size={20} />, label: "Pages" },
  { href: "/admin/impact", icon: <BarChart size={20} />, label: "Impact" },
  { href: "/admin/products", icon: <ShoppingBag size={20} />, label: "Products" },
  { href: "/admin/messages", icon: <Mail size={20} />, label: "Messages" },
  { href: "/admin/faq", icon: <HelpCircle size={20} />, label: "FAQ" },
  { href: "/admin/brand", icon: <Palette size={20} />, label: "Brand OS" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-bold text-purple-900 dark:text-green-500 tracking-tight">
                Admin Console
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                      isActive
                        ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    {link.icon}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}