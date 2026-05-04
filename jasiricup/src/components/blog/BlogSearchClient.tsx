'use client';
import { useState } from 'react';
import { BlogPostCard } from './BlogPostCard';

// 1. Define the exact shape of a blog post based on what BlogPostCard expects
interface BlogPost {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  linkHref: string;
}

// 2. Replace any[] with BlogPost[]
interface BlogSearchClientProps {
  posts: BlogPost[];
  error: string | null;
}

export const BlogSearchClient = ({ posts, error }: BlogSearchClientProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          filteredPosts.map(post => (
            <BlogPostCard 
              key={post.id} 
              imageSrc={post.imageSrc}
              title={post.title}
              description={post.description}
              linkHref={post.linkHref}
            />
          ))
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