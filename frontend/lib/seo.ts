import { absoluteUrl } from '@/lib/site-url';

const DESCRIPTION_MAX_LENGTH = 160;

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
