# PlantShop Frontend

Next.js App Router frontend for PlantShop. It provides the public storefront, plant catalog, cart modal checkout flow, user dashboard, order history, profile settings, and admin UI for plants, orders, media, and site settings.

## Runtime

- Node.js: `24.16.0`
- Next.js: `16.2.7`
- React: `19.2.7`
- Frontend URL: `http://localhost:3000`
- Backend API URL: `http://localhost:3001`

The repository root contains `.nvmrc` and `.node-version` with the expected Node.js version.

## Setup

```bash
npm install
```

Create `frontend/.env.local` from `frontend/.env.example`.

Only public browser configuration belongs in `NEXT_PUBLIC_*` variables. Never
place backend secrets, SMTP credentials, database URLs, or JWT secrets in the
frontend environment or in an archive shared with other people.

Expected local values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
INTERNAL_API_URL=http://localhost:3001
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
```

## Development

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## Tests

```bash
npm run lint
npm test
npm run test:e2e
```

Unit and integration tests use Vitest and Testing Library. Browser smoke tests live in `frontend/e2e` and use Playwright with a mock backend configured in `frontend/playwright.config.ts`.

## Important Routes

- `/` - storefront homepage
- `/plants` - public plant catalog
- `/dashboard` - current user overview
- `/dashboard/orders` - persisted current-user orders
- `/dashboard/orders/[id]` - compatibility deep link into the order detail state
- `/dashboard/settings` - current user profile, notifications, privacy, and password settings
- `/admin` - admin overview
- `/admin/plants` - plant management
- `/admin/orders` - order management
- `/admin/media` - media management
- `/admin/settings` - site settings management
- `/auth-unavailable` - neutral state for temporary auth backend failures
- `/forbidden` - non-admin access denial page

## Auth And API Contract

The frontend treats `/auth/me` as the source of session truth and uses cookie-based backend auth. Protected route decisions are enforced in `frontend/proxy.ts`, while protected API mutations remain enforced on the backend.
