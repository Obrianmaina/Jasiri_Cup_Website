import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const routes = [
    '',
    '/product',
    '/impact',
    '/stories',
    '/blog',
    '/team',
    '/volunteer',
    '/partners',
    '/press',
    '/donate',
    '/get-in-touch',
    '/order'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}