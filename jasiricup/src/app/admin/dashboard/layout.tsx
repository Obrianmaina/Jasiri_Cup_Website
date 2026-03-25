// src/app/admin/dashboard/layout.tsx
import Link from "next/link";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm md:min-h-screen">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-purple-700 tracking-tight">Jasiri Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-purple-700 bg-purple-50 transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/blog" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            Blog Posts
          </Link>
          <Link 
            href="/admin/products" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            Products
          </Link>
          <Link 
            href="/admin/messages" 
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            Messages
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
          <div className="text-sm font-medium text-gray-500 hidden sm:block">
            Welcome back, Admin
          </div>
          <div className="flex flex-1 sm:flex-none justify-end items-center gap-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full border-2 border-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Page Content - Width restricted and mobile padded */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}