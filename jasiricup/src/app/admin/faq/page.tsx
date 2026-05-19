import { Metadata } from "next";
import Link from "next/link";
import FAQsClient from "./FAQsClient";

export const metadata: Metadata = {
  title: "Manage FAQs | Admin Dashboard",
  description: "Add, edit, and manage frequently asked questions.",
};

export default function FAQsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6 md:space-y-8">
      {/* Back to Dashboard Arrow */}
      <div>
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Manage FAQs
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
              Create and update the frequently asked questions displayed on the public site.
            </p>
          </div>
        </div>
      </div>

      <FAQsClient />
    </div>
  );
}