// src/components/blog/BlogSearchClient.tsx
'use client';
import { useState } from 'react';
import { BlogPostCard } from './BlogPostCard';
import { useLanguage } from '@/components/common/LanguageToggle';

interface BlogPostTranslation { title?: string; content?: string; metaDescription?: string; }
interface BlogPost { id: string; title: string; description: string; imageSrc: string; linkHref: string; translations?: Record<string, BlogPostTranslation>; }
interface BlogSearchClientProps { posts: BlogPost[]; error: string | null; }

export const BlogSearchClient = ({ posts, error }: BlogSearchClientProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { lang } = useLanguage();

  const filteredPosts = posts.filter(post => {
    const currentTitle = lang === 'en' ? post.title : (post.translations?.[lang]?.title || post.title);
    const currentDesc = lang === 'en' ? post.description : (post.translations?.[lang]?.metaDescription || post.description);

    return currentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
           currentDesc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const hasPosts = posts.length > 0;

  return (
    <div className="w-full max-w-full">
      {hasPosts && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 px-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white transition-colors">
            Latest Posts
          </h2>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors shadow-sm"
          />
        </div>
      )}

      {/* Added w-full max-w-full to strictly bind grid limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-full">
        {error && (
          <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
            <p>{error}</p>
          </div>
        )}
        
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => {
            const displayTitle = lang === 'en' ? post.title : (post.translations?.[lang]?.title || post.title);
            const displayDesc = lang === 'en' ? post.description : (post.translations?.[lang]?.metaDescription || post.description);
            
            return (
              <BlogPostCard 
                key={post.id} 
                imageSrc={post.imageSrc}
                title={displayTitle}
                description={displayDesc}
                linkHref={post.linkHref}
              />
            );
          })
        ) : (
          !error && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center w-full">
              {searchQuery ? (
                <>
                  <div className="bg-gray-100 dark:bg-gray-800/50 p-5 rounded-full mb-5 transition-colors">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">No matching results</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md transition-colors">We couldn&apos;t find any articles matching &quot;{searchQuery}&quot;. Try adjusting your keywords.</p>
                </>
              ) : (
                <>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-full mb-5 transition-colors">
                    <svg className="w-10 h-10 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">You are all caught up!</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md transition-colors">There are no more articles to display right now. Enjoy the featured read above.</p>
                </>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};