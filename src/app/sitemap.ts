import type { MetadataRoute } from 'next';
import { publicApi, safe } from '@/lib/api';
import { SITE_URL } from '@/lib/format';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const empty = { items: [], total: 0 };
  const [posts, trips, milestones] = await Promise.all([
    safe(() => publicApi.posts(1, 50), empty),
    safe(() => publicApi.trips(1, 50), empty),
    safe(() => publicApi.milestones(1, 50), empty),
  ]);

  const staticRoutes = ['', '/blog', '/trips', '/career'].map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: 'weekly' as const }));
  const entry = (prefix: string) => (c: { slug: string; updatedAt: string }) => ({
    url: `${SITE_URL}/${prefix}/${c.slug}`,
    lastModified: c.updatedAt,
  });

  return [
    ...staticRoutes,
    ...posts.items.map(entry('blog')),
    ...trips.items.map(entry('trips')),
    ...milestones.items.map(entry('career')),
  ];
}
