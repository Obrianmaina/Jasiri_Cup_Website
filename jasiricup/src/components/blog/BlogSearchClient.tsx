'use client';
import { useState } from 'react';
import { BlogPostCard } from './BlogPostCard';
import { useLanguage } from '@/components/common/LanguageToggle';

// 1. Defined right here at the top!
interface BlogPostTranslation {
  title?: string;
  content?: string;
  metaDescription?: string;
}

interface BlogPost {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  linkHref: string;
  translations?: Record<string, BlogPostTranslation>;
}

interface BlogSearchClientProps {
  posts: BlogPost[];
  error: string | null;
}

export const BlogSearchClient = ({ posts, error }: BlogSearchClientProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { lang } = useLanguage();

  const filteredPosts = posts.filter(post => {
    const currentTitle = lang === 'en' ? post.title : (post.translations?.[lang]?.title || post.title);
    const currentDesc = lang === 'en' ? post.description : (post.translations?.[lang]?.metaDescription || post.description);

    return currentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
           currentDesc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white transition-colors">
          Latest Posts
        </h2>
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
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
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No matching articles found.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};