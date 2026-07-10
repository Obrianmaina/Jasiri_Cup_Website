'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle"; 

import { 
  Home, Wallet, FileText, Layout, BarChart, ShoppingBag, 
  HelpCircle, Palette, Newspaper, Users, User
} from "lucide-react";

const baseNavLinks = [
  { href: "/admin/dashboard", icon: <Home size={20} />, label: "Dashboard" },
  { href: "/admin/dashboard/team", icon: <Users size={20} />, label: "Team" },
  { href: "/admin/finances", icon: <Wallet size={20} />, label: "Finances" },
  { href: "/admin/blog", icon: <FileText size={20} />, label: "Blog" },
  { href: "/admin/pages", icon: <Layout size={20} />, label: "Pages" },
  { href: "/admin/impact", icon: <BarChart size={20} />, label: "Impact" },
  { href: "/admin/products", icon: <ShoppingBag size={20} />, label: "Products" },
  { href: "/admin/faq", icon: <HelpCircle size={20} />, label: "FAQ" },
  { href: "/admin/brand", icon: <Palette size={20} />, label: "Brand OS" },
  { href: "/admin/newsletter", icon: <Newspaper size={20} />, label: "Newsletter" },
];

const greetings = [
  'Hello', 'Hi', 'Hey', 'Jambo', 'Habari', 'Hujambo', 'Bonjour', 'Salut', 
  'Hola', 'Buenos días', 'Ciao', 'Buongiorno', 'Hallo', 'Guten Tag', 
  'Olá', 'Namaste', 'Ni Hao', 'Konnichiwa', 'Annyeong', 'Merhaba', 
  'Shalom', 'Salaam', 'As-salamu alaykum', 'Sawubona', 'Molo', 'Dumela', 
  'Ahoj', 'Hej', 'Goddag', 'Hei', 'Zdravo', 'Privet', 'Xin chào', 
  'Sawasdee', 'Selamat', 'Kia Ora', 'Yassas', 'Halo', 'Aloha'
];

function AdminDashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession(); 
  
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  const userName = session?.user?.name || 'Admin';
  const userImage = session?.user?.image;

  const navLinks = baseNavLinks;

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

            <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors shrink-0 ${
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

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{greeting},</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{userName}</span>
              </div>
              
              <Link 
                href="/admin/dashboard/profile" 
                title="Profile Settings"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 overflow-hidden transition-all shadow-sm shrink-0"
              >
                {userImage ? (
                  <Image src={userImage} alt={userName} width={36} height={36} className="object-cover w-full h-full" />
                ) : (
                  <User size={18} className="text-gray-500 dark:text-gray-400" />
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors shrink-0"
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminDashboardContent>{children}</AdminDashboardContent>
    </SessionProvider>
  );
}