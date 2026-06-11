import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/logout',
          '/forbidden',
          '/auth-unavailable',
          '/signin',
          '/register',
          '/verify-email',
          '/reset-password',
          '/forgot-password',
          '/verify-login-code',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
