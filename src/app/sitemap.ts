import { MetadataRoute } from 'next';
import { getAllApprovedDirectoryItems } from '@/lib/server-db';

const BASE_URL = 'https://sd-dehapa-hub.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 2. Dynamic Programmatic SEO Pages via REST Bypass
  const allItems = await getAllApprovedDirectoryItems();

  const uniquePaths = new Set<string>();

  allItems.forEach(item => {
    const country = (item.country || 'india').toLowerCase().replace(/\s+/g, '-');
    const state = (item.state || 'odisha').toLowerCase().replace(/\s+/g, '-');
    const district = (item.district || 'any').toLowerCase().replace(/\s+/g, '-');
    const category = (item.type || 'doctor').toLowerCase().replace(/\s+/g, '-');

    // Add full 4-tier path
    uniquePaths.add(`/directory/${country}/${state}/${district}/${category}`);
    // Add 3-tier path (District level, any category)
    uniquePaths.add(`/directory/${country}/${state}/${district}`);
    // Add 2-tier path (State level)
    uniquePaths.add(`/directory/${country}/${state}`);
    // Add Category specific state level path
    uniquePaths.add(`/directory/${country}/${state}/any/${category}`);
  });

  const dynamicRoutes: MetadataRoute.Sitemap = Array.from(uniquePaths).map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
