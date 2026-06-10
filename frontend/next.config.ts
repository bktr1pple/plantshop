import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
let apiOrigin = 'http://localhost:3001';

try {
  apiOrigin = new URL(apiUrl).origin;
} catch {
  // Runtime API validation remains the deployment responsibility.
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"} https://www.google.com https://www.gstatic.com https://www.recaptcha.net`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${apiOrigin} https://www.google.com https://www.recaptcha.net${isProduction ? '' : ' ws: wss:'}`,
  `img-src 'self' data: blob: https: ${apiOrigin}`,
  "font-src 'self' data:",
  "frame-src https://www.google.com https://www.recaptcha.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isProduction ? 'upgrade-insecure-requests' : '',
]
  .filter(Boolean)
  .join('; ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin-allow-popups',
  },
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  images: {
    qualities: [75, 85],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;
