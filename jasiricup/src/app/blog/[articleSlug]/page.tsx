import Image from "next/image";
import { ArticleContent } from "@/components/blog/ArticleContent";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { notFound } from 'next/navigation';

interface ArticlePageProps {
  params: {
    articleSlug: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleSlug } = params;

  let articleData = null;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/${articleSlug}`, {
      method: 'GET',
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      if (response.status === 404) notFound();
      throw new Error('Failed to fetch article');
    }

    const data = await response.json();
    articleData = data.data;
  } catch (err) {
    console.error('Error fetching article:', err);
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: articleData?.title || 'Article', href: `/blog/${articleSlug}` },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-16 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Article */}
      {articleData ? (
        <div className="w-full max-w-4xl mx-auto">
          <ArticleContent article={articleData} />
        </div>
      ) : (
        <p className="text-center text-gray-500">Failed to load article content.</p>
      )}
    </div>
  );
}
