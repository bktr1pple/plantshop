const DEFAULT_SITE_URL = 'http://localhost:3000';

/**
 * Канонічний публічний origin сайту для metadataBase, canonical,
 * sitemap, robots і JSON-LD. Жодного хардкоду продакшн-домену:
 * значення береться лише з NEXT_PUBLIC_SITE_URL.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    return DEFAULT_SITE_URL;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

/** Абсолютна адреса сторінки відносно канонічного origin. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, getSiteUrl()).toString();
}
