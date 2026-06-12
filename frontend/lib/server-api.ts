import type { Plant } from '@/app/types/plant';
import {
  defaultSiteSettings,
  type SiteSettings,
} from '@/lib/site-settings';

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? 'http://localhost:3001';

export async function fetchServerPlants(
  options?: { revalidate?: number },
): Promise<Plant[]> {
  try {
    // Без revalidate лишається no-store (admin-флоу потребує свіжих даних);
    // публічні сторінки передають revalidate для ISR-кешування.
    const res = await fetch(`${INTERNAL_API_URL}/plants?all=true`, {
      ...(options?.revalidate !== undefined
        ? { next: { revalidate: options.revalidate } }
        : { cache: 'no-store' }),
    });

    if (!res.ok) {
      return [];
    }

    return (await res.json()) as Plant[];
  } catch {
    return [];
  }
}

/**
 * Завантажує одну рослину для публічної детальної сторінки.
 * 404 від бекенда → null (сторінка віддає notFound()); інші збої кидають
 * помилку, щоб тимчасова недоступність API не перетворювалась на хибний 404.
 */
export async function fetchServerPlant(
  id: number,
  options?: { revalidate?: number },
): Promise<Plant | null> {
  const res = await fetch(`${INTERNAL_API_URL}/plants/${id}`, {
    ...(options?.revalidate !== undefined
      ? { next: { revalidate: options.revalidate } }
      : { cache: 'no-store' }),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to load plant ${id}: status ${res.status}`);
  }

  return (await res.json()) as Plant;
}

export async function fetchServerPublicSiteSettings(
  options?: { revalidate?: number },
): Promise<SiteSettings> {
  try {
    // Без revalidate лишається no-store (admin-флоу потребує свіжих даних);
    // публічний layout передає revalidate, щоб сторінки могли бути static/ISR.
    const res = await fetch(`${INTERNAL_API_URL}/site-settings/public`, {
      ...(options?.revalidate !== undefined
        ? { next: { revalidate: options.revalidate } }
        : { cache: 'no-store' }),
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
