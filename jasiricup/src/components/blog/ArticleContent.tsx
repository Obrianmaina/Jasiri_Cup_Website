// src/components/blog/ArticleContent.tsx
import React from 'react';
import Image from 'next/image';

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
    <article className="bg-white rounded-lg p-8">
      {/* Article Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
          {article.title}
        </h1>
        
        {/* Article Meta */}
        <div className="text-gray-500 text-sm mb-6 flex items-center justify-center space-x-4">
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
      <div 
        className="article-content max-w-none text-gray-700 leading-relaxed mx-auto"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Debug info in development */}
      {/*process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-sm">
          <h4 className="font-bold">Content Debug:</h4>
          <p>Raw HTML length: {article.content?.length || 0}</p>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Raw HTML Content</summary>
            <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-48">
              {article.content}
            </pre>
          </details>
        </div>
      )*/}
    </article>
  );
};