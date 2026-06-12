import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

// Єдиний хардкод у файлі — безпечний локальний фолбек для першого запуску
// без .env. Усе інше керується змінними оточення, нічого не вписується сюди.
const DEFAULT_API_URL = 'http://localhost:3001';

function toOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    // Некоректний URL у .env — ігноруємо; валідація лишається за деплоєм.
    return null;
  }
}

// Origin бекенд-API для CSP береться з NEXT_PUBLIC_API_URL (.env).
const apiOrigin = toOrigin(process.env.NEXT_PUBLIC_API_URL) ?? DEFAULT_API_URL;

// У dev дозволяємо в CSP і заданий origin, і локальні дефолти, щоб сайт
// працював і через localhost, і через LAN-IP (наприклад з телефону)
// без жодних правок коду — достатньо виставити NEXT_PUBLIC_API_URL у .env.
// Додаткові origin можна перелічити через кому в NEXT_PUBLIC_EXTRA_API_ORIGINS.
const extraOrigins = (process.env.NEXT_PUBLIC_EXTRA_API_ORIGINS ?? '')
  .split(',')
  .map((value) => toOrigin(value))
  .filter((value): value is string => Boolean(value));

const apiOrigins = Array.from(
  new Set(
    isProduction
      ? [apiOrigin, ...extraOrigins]
      : [apiOrigin, DEFAULT_API_URL, 'http://127.0.0.1:3001', ...extraOrigins],
  ),
);

const apiOriginList = apiOrigins.join(' ');

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"} https://www.google.com https://www.gstatic.com https://www.recaptcha.net`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${apiOriginList} https://www.google.com https://www.recaptcha.net${isProduction ? '' : ' ws: wss:'}`,
  `img-src 'self' data: blob: https: ${apiOriginList}`,
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
  turbopack: {
    root: process.cwd(),
  },
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
