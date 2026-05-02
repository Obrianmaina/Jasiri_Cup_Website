// src/components/blog/ArticleContent.tsx
import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface ArticleContentProps {
  article: {
    title: string;
    heroImage: string;
    content: string;
    author?: string;
    publishedDate?: string;
  };
}

const DEFAULT_HERO_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/forest_ganolr.png";

export const ArticleContent = ({ article }: ArticleContentProps) => {
  const heroImageSource = article.heroImage && article.heroImage.trim() ? article.heroImage : DEFAULT_HERO_IMAGE;

  // Format the published date if available
  const formattedDate = article.publishedDate 
    ? new Date(article.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg p-8 transition-colors duration-300 shadow-sm border border-transparent dark:border-gray-700">
      {/* Article Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 leading-tight transition-colors">
          {article.title}
        </h1>
        
        {/* Article Meta */}
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex items-center justify-center space-x-4 transition-colors">
          {article.author && (
            <span>By {article.author}</span>
          )}
          {formattedDate && (
            <>
              {article.author && <span>•</span>}
              <span>{formattedDate}</span>
            </>
          )}
        </div>
      </header>

      {/* Hero Image */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full h-80 max-w-4xl overflow-hidden rounded-lg shadow-lg">
          <Image
            src={heroImageSource}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="article-content max-w-none text-gray-700 dark:text-gray-300 leading-relaxed mx-auto prose transition-colors duration-300">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>
    </article>
  );
};