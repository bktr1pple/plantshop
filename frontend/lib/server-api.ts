import type { Plant } from '@/app/types/plant';
import {
  defaultSiteSettings,
  type SiteSettings,
} from '@/lib/site-settings';

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? 'http://localhost:3001';

export async function fetchServerPlants(): Promise<Plant[]> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/plants?all=true`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    return (await res.json()) as Plant[];
  } catch {
    return [];
  }
}

export async function fetchServerPublicSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/site-settings/public`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return defaultSiteSettings;
    }

    const data = (await res.json()) as Partial<SiteSettings>;

    return {
      ...defaultSiteSettings,
      ...data,
    };
  } catch {
    return defaultSiteSettings;
  }
}
