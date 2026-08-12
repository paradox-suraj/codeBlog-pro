import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const getAppUrl = () => {
  let url = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? "http://localhost:3000";
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }
  return url;
};

const APP_URL = getAppUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch published posts
  const posts = await db.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  });

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${APP_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Fetch categories
  const categories = await db.category.findMany({
    select: { slug: true },
  });

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${APP_URL}/search?q=${category.slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${APP_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...postUrls, ...categoryUrls];
}
