import React from 'react';
import Image from 'next/image';

interface ArticleContentProps {
  article: {
    title: string;
    heroImage: string;
    content: string;
  };
}

export const ArticleContent = ({ article }: ArticleContentProps) => {
  return (
    <article className="bg-white rounded-lg p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">{article.title}</h1>
      <div className="mb-8 flex justify-center">
        {/*
          The hero image is now a responsive banner.
          `w-full` makes it fill the container, and `h-80` sets a fixed height.
          `object-cover` ensures the image fills the container while maintaining its aspect ratio,
          effectively cropping it from the center to fit.
          The `fill` prop is used in place of fixed width/height for this banner-style.
        */}
        <div className="relative w-full h-80 overflow-hidden rounded-lg shadow-lg">
          <Image
            src={article.heroImage}
            alt={article.title}
            fill // This makes the image fill the parent container
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
