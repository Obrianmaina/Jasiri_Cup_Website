import React from 'react';

interface StatsGridProps {
  stats: {
    publishedBlogs: number;
    draftBlogs: number;
    totalViews: number;
    totalMessages: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">Published Posts</h3>
          <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline">Live</span>
        </div>
        <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{stats.publishedBlogs}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">Draft Posts</h3>
          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline">Draft</span>
        </div>
        <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{stats.draftBlogs}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">Total Views</h3>
          <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline">All time</span>
        </div>
        <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">Messages</h3>
          {stats.totalMessages > 0 && (
            <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline">Inbox</span>
          )}
        </div>
        <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{stats.totalMessages}</p>
      </div>
    </div>
  );
}