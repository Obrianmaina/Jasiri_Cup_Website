// src/components/blog/ArticleContent.tsx
import React from 'react';
import Image from 'next/image';

interface ArticleContentProps {
  article: {
    title: string;
    heroImage: string;
    content: string;
  };
}

const DEFAULT_HERO_IMAGE = "https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/forest_ganolr.png";

export const ArticleContent = ({ article }: ArticleContentProps) => {
  const heroImageSource = article.heroImage && article.heroImage.trim() ? article.heroImage : DEFAULT_HERO_IMAGE;
  
  return (
    <article className="bg-white rounded-lg p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">{article.title}</h1>
      <div className="mb-8 flex justify-center">
        <div className="relative w-full h-80 overflow-hidden rounded-lg shadow-lg">
          <Image
            src={heroImageSource}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed mx-auto"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
};