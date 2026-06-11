import type { MetadataRoute } from 'next';
import type { Plant } from '@/app/types/plant';
import { getSiteUrl } from '@/lib/site-url';

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? 'http://localhost:3001';

// Перегенеровуємо sitemap раз на годину, щоб нові рослини потрапляли без перебудови.
export const revalidate = 3600;

function toLastModified(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

async function fetchAllPlants(): Promise<Plant[]> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/plants?all=true`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as Plant[]) : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const plants = await fetchAllPlants();

  const latestPlantUpdate = plants
    .map((plant) => toLastModified(plant.updatedAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/plants`,
      lastModified: latestPlantUpdate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/landscape-design`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const plantPages: MetadataRoute.Sitemap = plants.map((plant) => ({
    url: `${siteUrl}/plants/${plant.id}`,
    lastModified: toLastModified(plant.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...plantPages];
}
