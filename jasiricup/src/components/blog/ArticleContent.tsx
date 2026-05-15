'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { ShareButtons } from '@/components/blog/ShareButtons';
import Link from 'next/link';
import { useLanguage } from '@/components/common/LanguageToggle';

interface ArticleContentProps {
  article: {
    title: string;
    heroImage: string;
    content: string;
    author?: string;
    publishedDate?: string;
    slug?: string;
    tags?: string[];
    translations?: Record<string, { title?: string; content?: string; metaDescription?: string; }>;
  };
}

const DEFAULT_HERO_IMAGE = 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754082792/forest_ganolr.png';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    a: ['href', 'title', 'target', 'rel'],
  },
};

export const ArticleContent = ({ article }: ArticleContentProps) => {
  const { lang } = useLanguage();
  const [articleUrl, setArticleUrl] = useState('');

  // Use useEffect to set the URL only after mounting on the client.
  // This prevents the server/client HTML mismatch error.
  useEffect(() => {
    setArticleUrl(`${window.location.origin}/blog/${article.slug}`);
  }, [article.slug]);

  const displayTitle = (lang === 'en' ? article.title : (article.translations?.[lang]?.title || article.title)) || '';
  const displayContent = (lang === 'en' ? article.content : (article.translations?.[lang]?.content || article.content)) || '';
  const heroImageSource = article.heroImage && article.heroImage.trim() ? article.heroImage : DEFAULT_HERO_IMAGE;
  
  const formattedDate = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg p-8 transition-colors duration-300 shadow-sm border border-transparent dark:border-gray-700">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 leading-tight transition-colors">
          {displayTitle}
        </h1>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex items-center justify-center gap-4 flex-wrap transition-colors">
          {article.author && <span>By {article.author}</span>}
          {formattedDate && (
            <>
              {article.author && <span>•</span>}
              <span>{formattedDate}</span>
            </>
          )}
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="mb-8 flex justify-center">
        <div className="relative w-full h-80 max-w-4xl overflow-hidden rounded-lg shadow-lg">
          <Image src={heroImageSource} alt={displayTitle} fill className="object-cover" priority />
        </div>
      </div>

      <div className="article-content max-w-none text-gray-700 dark:text-gray-300 leading-relaxed mx-auto prose transition-colors duration-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}>
          {displayContent}
        </ReactMarkdown>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Share this article</p>
        {/* Only render share buttons once we have a URL to share */}
        {articleUrl && <ShareButtons title={displayTitle} url={articleUrl} />}
      </div>

      <div className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 sm:p-8 rounded-2xl text-center border border-purple-100 dark:border-purple-800/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Want more stories like this?</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 max-w-md mx-auto">
          Join our community to get monthly impact updates and news straight to your inbox.
        </p>
        <Link href="/newsletter" className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors">
          Subscribe for Free
        </Link>
      </div>
    </article>
  );
};