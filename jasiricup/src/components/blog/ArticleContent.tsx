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
    <article className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">{article.title}</h1>
      <div className="mb-8 flex justify-center">
        <Image
          src={article.heroImage}
          alt={article.title}
          width={800}
          height={450}
          className="rounded-lg shadow-lg object-cover w-full max-w-3xl"
        />
      </div>
      <div
        className="prose prose-lg max-w-none text-gray-700 leading-relaxed mx-auto"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
};
