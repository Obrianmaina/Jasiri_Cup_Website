// src/app/blog/[articleSlug]/page.tsx
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

  console.log('Article page: Loading article with slug:', articleSlug);

  let articleData = null;
  
  try {
    // Call the new slug-based API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/slug/${articleSlug}`, {
      method: 'GET',
      next: { revalidate: 60 }
    });

    console.log('Article page: API response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Article page: Article not found, calling notFound()');
        notFound();
      }
      throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const data = await response.json();
    console.log('Article page: API response:', data.success ? 'Success' : 'Failed');
    
    if (data.success) {
      articleData = data.data;
      console.log('Article page: Loaded article:', articleData.title);
      
      // Ensure the article has required fields
      if (!articleData.title || !articleData.content) {
        throw new Error('Article missing required fields');
      }
    } else {
      throw new Error(data.error || 'Failed to fetch article');
    }
  } catch (err) {
    console.error('Article page: Error fetching article:', err);
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

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && articleData && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-sm">
          <p><strong>Article Debug:</strong></p>
          <p>Slug: {articleSlug}</p>
          <p>Title: {articleData.title}</p>
          <p>Status: {articleData.status}</p>
          <p>Published: {articleData.publishedDate}</p>
          <p>Has content: {!!articleData.content}</p>
          <p>Content length: {articleData.content?.length || 0} characters</p>
        </div>
      )}

      {/* Article */}
      <div className="w-full max-w-4xl mx-auto">
        <ArticleContent article={articleData} />
      </div>
    </div>
  );
}