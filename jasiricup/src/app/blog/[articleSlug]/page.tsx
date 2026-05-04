// src/app/blog/[articleSlug]/page.tsx
import Image from 'next/image';
import { ArticleContent } from '@/components/blog/ArticleContent';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface ArticlePageProps {
  params: {
    articleSlug: string;
  };
}

async function fetchArticle(slug: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/slug/${slug}`,
    { method: 'GET', next: { revalidate: 60 } },
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data.success ? data.data : null;
}

// ─── Dynamic SEO metadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { articleSlug } = params;
  const article = await fetchArticle(articleSlug);

  if (!article) {
    return { title: 'Article Not Found | JasiriCup' };
  }

  const description =
    article.metaDescription ||
    article.content?.replace(/[#*`>_[\]()]/g, '').slice(0, 160) + '...';

  return {
    title: `${article.title} | JasiriCup Blog`,
    description,
    keywords: article.tags?.join(', '),
    authors: article.author ? [{ name: article.author }] : undefined,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.publishedDate,
      authors: article.author ? [article.author] : undefined,
      images: article.heroImage
        ? [
            {
              url: article.heroImage,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
      siteName: 'JasiriCup',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.heroImage ? [article.heroImage] : [],
    },
    alternates: {
      canonical: `/blog/${articleSlug}`,
    },
  };
}

// ─── Page component ────────────────────────────────────────────────────────────
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleSlug } = params;
  const articleData = await fetchArticle(articleSlug);

  if (!articleData || !articleData.title || !articleData.content) {
    notFound();
  }

  // Increment view count (fire and forget)
  fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/slug/${articleSlug}`,
    { method: 'GET', cache: 'no-store' },
  ).catch(() => {});

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: articleData.title, href: `/blog/${articleSlug}` },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-16 py-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="w-full max-w-4xl mx-auto">
        <ArticleContent article={articleData} />
      </div>
    </div>
  );
}