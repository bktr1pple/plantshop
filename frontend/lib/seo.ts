import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site-url';

const DESCRIPTION_MAX_LENGTH = 160;

/**
 * Open Graph для конкретної сторінки. Next НЕ домерджує поля openGraph
 * з root layout (обʼєкт заміняється цілком), тому locale/siteName
 * додаємо тут, щоб вони не губилися на сторінках із власним OG.
 */
export function buildOpenGraph(input: {
  url: string;
  title: string;
  description: string;
  images?: string[];
}): NonNullable<Metadata['openGraph']> {
  return {
    type: 'website',
    locale: 'uk_UA',
    siteName: 'PlantShop',
    url: input.url,
    title: input.title,
    description: input.description,
    ...(input.images ? { images: input.images } : {}),
  };
}

/**
 * Одна нормалізована фраза для meta description: без переносів рядків,
 * обрізана по межі слова до ~160 символів.
 */
export function toMetaDescription(
  value: string | null | undefined,
  fallback: string,
): string {
  const normalized = value?.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return fallback;
  }

  if (normalized.length <= DESCRIPTION_MAX_LENGTH) {
    return normalized;
  }

  const cut = normalized.slice(0, DESCRIPTION_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length)}…`;
}

/**
 * Зображення рослин бувають абсолютними (керовані медіа бекенда)
 * або відносними (статичні файли фронтенда) — для OG/JSON-LD потрібен
 * абсолютний URL.
 */
export function toAbsoluteImageUrl(src: string): string {
  return /^https?:\/\//i.test(src) ? src : absoluteUrl(src);
}
