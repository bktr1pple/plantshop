# AGENTS.md

## Project overview
This repository is a real product codebase with two main applications:
- `frontend`: Next.js 16.2.7 App Router storefront and admin UI (native Next.js, no Vinext)
- `backend`: NestJS 11.1.26 API with Prisma 7.8/MySQL

The repository is no longer a starter/demo state. It already contains:
- real cookie-based auth/session flow
- real email verification / password reset / login challenge security flows
- a minimal real `USER` / `ADMIN` role model
- protected admin-only backend write operations
- a real `/admin` subsystem
- real current-user profile/account settings persistence
- a real persisted orders subsystem for current users and admins
- media upload/storage and cleanup logic
- backend-backed site settings/content management
- a small real backend HTTP smoke suite for critical auth/admin paths
- frontend unit/integration tests and browser E2E smoke tests

Treat the current codebase as the source of truth. Do not rely on historical assumptions once the code says otherwise.

## Working language
- Always write explanations, summaries, reports, plans, reviews, audit notes, and implementation notes in Ukrainian.
- Keep repository files in their existing language/convention unless the task explicitly requires changing them.

## Current architecture reality

### Frontend
- Main app lives in `frontend/app`.
- Public storefront routes include `/`, `/plants`, `/contact`, `/landscape-design`, `/dashboard`, `/dashboard/orders`, `/dashboard/orders/[id]`, `/dashboard/settings`, `/signin`, `/register`, `/logout`.
- Public auth/security routes also include `/verify-email` and `/reset-password`.
- Legacy compatibility entrypoints `/forgot-password` and `/verify-login-code` currently redirect back into the native auth modal flow instead of rendering detached standalone UX.
- Global unmatched routes should resolve through `frontend/app/not-found.tsx` instead of falling back to the default gray framework "Not Found" screen.
- Orders dashboard also has a deep-link detail entrypoint under `/dashboard/orders/[id]`, which resolves to the real persisted order detail view.
- Admin routes live under `frontend/app/admin`:
  - `/admin`
  - `/admin/orders`
  - `/admin/plants`
  - `/admin/media`
  - `/admin/settings`
- Admin shell/layout is implemented via:
  - `frontend/app/admin/layout.tsx`
  - `frontend/components/admin/AdminShell.tsx`
- Global client wrapper and providers are in:
  - `frontend/app/ClientWrapper.tsx`
  - `frontend/contexts/AuthContext.tsx`
  - `frontend/contexts/SiteSettingsContext.tsx`
  - `frontend/contexts/CartContext.tsx`
- Current authenticated dashboard reality:
  - `/dashboard/settings` is real and persists current-user profile/preferences through `PATCH /auth/me`
  - `/dashboard/orders` is real and loads persisted current-user order history/details from the backend
  - `/dashboard/orders/[id]` is a real detail entrypoint for a specific persisted order
  - dashboard overview must not show fake metrics or fake order history

### Backend
- Main entry point: `backend/src/main.ts`
- Root module: `backend/src/app.module.ts`
- Backend environment loading is centralized in `backend/src/config/env.ts`, which loads `backend/.env` through `dotenv` before required variables are read by runtime modules.
- Main runtime modules:
  - `backend/src/auth`
  - `backend/src/orders`
  - `backend/src/plants`
  - `backend/src/media`
  - `backend/src/site-settings`
  - `backend/src/contact`
  - `backend/src/prisma`
- Prisma schema: `backend/prisma/schema.prisma`
- Prisma 7 generates the TypeScript client into `backend/src/generated/prisma` and connects to MySQL through `@prisma/adapter-mariadb`.
- Runtime Prisma construction is centralized in `backend/src/prisma/prisma-adapter.ts`, `backend/src/prisma/create-prisma-client.ts`, and `backend/src/prisma/prisma.service.ts`.
- Upload storage root: `backend/uploads`

### Orders domain
- Prisma-backed orders now exist through:
  - `Order`
  - `OrderItem`
  - `OrderStatus`
- Current-user orders endpoints:
  - `POST /orders`
  - `GET /orders/me`
  - `GET /orders/me/:id`
- Admin orders endpoints:
  - `GET /orders/admin`
  - `GET /orders/admin/:id`
  - `PATCH /orders/admin/:id`
- Order items snapshot:
  - plant name
  - plant cover image
  - unit price
  - quantity
  - line total
- Ownership rules:
  - current-user endpoints must return only the authenticated user's orders
  - admin endpoints remain `ADMIN`-only
- Checkout/order creation reality:
  - storefront checkout currently happens through the existing cart modal flow
  - order creation requires an authenticated current user
  - guest checkout is not currently supported as a real persisted flow and must not be faked in UI or API
  - customer email is taken from the authenticated account, not from an arbitrary checkout field

### Auth/session architecture
- Registration now creates or updates a `PendingRegistration` record, sends a verification email, and returns `verification_required` without auth cookies.
- A real `User` row is created only after successful `POST /auth/verify-email`.
- Backend auth endpoints:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me`
  - `PATCH /auth/me`
  - `POST /auth/verify-email`
  - `POST /auth/resend-verification-email`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
  - `POST /auth/change-password`
  - `POST /auth/login-challenge/verify`
- Auth uses httpOnly cookies:
  - `access_token`
  - `refresh_token`
  - `trusted_login`
- Frontend auth bootstrap performs a real `/auth/me` check on mount.
- Frontend auth modal is the native surface for:
  - login
  - registration
  - forgot-password request
  - login challenge code entry
  - inline verification-required guidance/resend
- Frontend distinguishes:
  - authenticated
  - unauthorized
  - temporarily unavailable auth backend
- Login for an unverified account does not issue auth cookies; it returns `verification_required`.
- Login from an unrecognized context does not issue auth cookies until a successful email challenge verification.
- Login challenge completion is now native and inline inside the auth modal; it must not depend on public URL params like `challengeId` or `email`.
- Login challenge codes are generated with cryptographically secure randomness, bound to the current user-agent/IP context, and consumed atomically.
- Email verification, pending registration, password reset, and login challenge tokens use conditional single-use consumption so concurrent submissions cannot both succeed.
- Temporary auth/backend/network failures must not be treated as confirmed logout.
- Backend `/auth/me` should distinguish confirmed unauthorized refresh failures from transient auth/backend failures; transient refresh or auth infrastructure failures should surface as unavailable rather than forcing a false logout.
- Current client-side cabinet fetches outside `/auth/*` may confirm session state through `/auth/me` and retry once after confirmed authenticated recovery; auth endpoints themselves must not recurse through the same recovery path.
- Concurrent frontend recovery attempts share one in-flight `/auth/me` request through a module-level mutex.
- Frontend logout is confirmed-only:
  - success path clears local auth state only after confirmed backend logout or confirmed unauthorized follow-up
  - ambiguous logout failure must preserve user state and surface an honest error/unavailable signal
- `/logout` should redirect to the plain homepage after confirmed logout; it must not intentionally reopen the auth modal.
- Route protection is enforced both:
  - server-side in `frontend/proxy.ts`
  - backend-side on protected endpoints
- Current server-side proxy reality:
  - `frontend/proxy.ts` uses a tri-state protected-route policy: `authenticated` / `unauthorized` / `unavailable`
  - confirmed unauthorized state redirects to login
  - temporary auth verification failure redirects to a neutral `/auth-unavailable` entrypoint instead of being treated as confirmed logout
  - authenticated non-admin access to `/admin/*` redirects to `/forbidden`, not to the user dashboard
  - `frontend/proxy.ts` remains security-sensitive and must still be changed only in a narrowly scoped auth-policy pass
- Current trusted-login reality:
  - `trusted_login` is a long-lived httpOnly cookie with an opaque random token
  - the backend validates it via a hash match against a stable `TrustedLoginContext` record, not only against the current refresh-session lifecycle
  - `userAgentSummary` must also be compatible before the context is treated as recognized
  - if those checks fail, login falls back to email challenge instead of trusting the cookie
  - normal logout clears session cookies but preserves trusted-login recognition for the same browser context
  - password reset and dashboard password change revoke both refresh sessions and trusted-login contexts, then clear all auth cookies
- Current refresh-token lifecycle:
  - refresh JWTs carry a unique `jti` and stable `familyId`
  - the database stores a keyed HMAC digest instead of a bcrypt hash
  - lookup is O(1) by unique `jti`
  - every successful refresh rotates the token atomically and links the replaced token
  - reuse or a concurrent rotation conflict revokes the entire token family
  - applying `20260609113000_secure_refresh_token_lifecycle` intentionally logs out all existing sessions

### Role/admin model
- Role model is already implemented in the database and auth payloads.
- Current role enum is minimal and real:
  - `USER`
  - `ADMIN`
- New users default to `USER`.
- `/auth/me` returns `role`.
- `JwtStrategy` reloads the current user and role from the database for every protected backend request; a deleted, unverified, or downgraded user cannot rely on stale JWT claims.
- Backend write operations for plants require `ADMIN`.
- Frontend only shows admin entry points to `ADMIN` users.
- Admin promotion workflow exists via:
  - `backend/src/scripts/promote-admin.ts`
  - `npm run promote:admin -- user@example.com`

### Plants/catalog model
- Public read endpoints:
  - `GET /plants`, returns paginated `{ items, meta }` by default
  - `GET /plants?all=true`, returns the full array for server/admin flows that need the whole catalog
  - `GET /plants/:id`
- Public `/plants` storefront uses URL pagination with `page` and `limit`; the current default page size is `12`.
- `GET /plants` also accepts an optional `search` query parameter (trimmed, max 100 chars) that filters by name/description substring; `meta.search` echoes the applied term or `null`.
- The navbar search modal performs a real catalog search by navigating to `/plants?search=<term>`; popular-search chips use the same real navigation.
- `/plants` distinguishes three honest states: results, empty (including an explicit no-results-for-search state with a reset link), and a dedicated load-error state when the backend fetch fails (it must not be presented as an empty catalog).
- Admin-only write endpoints:
  - `POST /plants`
  - `PATCH /plants/:id`
  - `DELETE /plants/:id`
- Plant images are stored in `Plant.images` as JSON-serialized string data.
- First image in the array is treated as the cover image by the frontend/admin UI.

### Media/upload architecture
- Admin media API lives under `backend/src/media`.
- Upload endpoints are under `/admin/media`.
- Backend stores managed files in `backend/uploads/{plants|site}`.
- Backend serves uploaded files under `/uploads/...`.
- Public media URLs are built from backend public base URL via `getPublicApiBaseUrl()`.
- File handling includes:
  - unique filenames
  - collection separation (`plants` / `site`)
  - exact extension/MIME allowlists plus image magic-byte validation
  - file size limits
  - canonical path-boundary checks that reject encoded traversal and foreign public origins
  - safe deletion checks
- Removed images are deleted only if they are no longer referenced.

### Site settings/content management
- Site settings are real persisted backend data via `SiteSettings` in Prisma.
- Backend module: `backend/src/site-settings`
- Public endpoint:
  - `GET /site-settings/public`
- Admin endpoints:
  - `GET /site-settings`
  - `PATCH /site-settings`
- Frontend public pages already consume settings:
  - homepage
  - contact page
  - footer

### Contact form
- `/contact` is a real frontend contact page, not a static placeholder.
- Backend contact API lives in `backend/src/contact`.
- Contact endpoint:
  - `POST /contact`
- Contact submission uses DTO validation, reCAPTCHA verification, throttling, existing `MailService`, and the public contact email from `SiteSettings`.
- Contact messages are delivered by SMTP through the existing mail runtime contract; successful API response does not replace real mailbox verification in an operational environment.

## Current product decisions already implemented
- Registration must not create a fake authenticated session before email verification succeeds.
- Registration must not create a real `User` row before email ownership is verified; use `PendingRegistration` instead.
- Frontend must not fake authenticated state after registration.
- `/dashboard` and `/admin` must not remain accessible if auth verification fails.
- Current-user dashboard settings are real and use the authenticated `/auth/me` read/update contract.
- Authenticated users can create real orders through the persisted current-user `/orders` contract.
- `/dashboard/orders` is real and must reflect persisted current-user order history/details rather than mocked or unavailable state.
- `/admin/orders` is a real admin area for order inspection and status updates.
- `/admin` is a real subsystem now, not a draft.
- `admin-test` is not a production admin area and should not be reintroduced as if it were one.
- `/about`, `/care`, `/pots`, and `/convert` are not active storefront routes and must not be linked or documented as implemented pages.
- Wishlist functionality is not part of the current product surface and must not be reintroduced as a fake client-only feature.
- Catalog categories are not implemented: navigation/footer must not present fake category links that all point to the same `/plants` page. The navbar "Рослини" item links directly to `/plants` without a submenu.
- The auth modal must not show a "remember me" control: session lifetime is fixed by backend cookie TTLs and trusted-login recognition, and there is no backend contract for it.
- Newsletter subscription is not implemented; the footer offers an honest mailto contact instead of a disabled form.
- The `/contact` messenger block is hidden until `messengerUrl` is configured to a real URL (default `#` means "not configured").
- Client-side password validation mirrors backend DTOs: registration and new passwords require 8+ chars with at least one letter and one digit and no spaces; checkout phone input mirrors the `CreateOrderDto` phone pattern.
- Dashboard/cart/system UI copy must stay user-facing Ukrainian without engineering jargon ("backend", "endpoints", "без моків" etc. are not allowed in storefront copy).
- `/plants` read endpoints stay public.
- `/plants` write endpoints require authenticated `ADMIN`.
- Site settings are editable through the admin UI and are consumed by public pages.
- Media uploads are real backend-managed files, not fake blob-only frontend state.
- Logout UX must not claim success before backend truth confirms session termination.
- Forgot-password public UX must stay non-enumerating.
- Normal forgot-password UX should live inside the auth modal, not in a detached standalone page.
- Reset-password and dashboard change-password must revoke refresh sessions and clear auth cookies on success.
- Current access tokens are still short-lived stateless JWTs; after password reset/change they naturally expire on their normal TTL, because a token-version redesign is still out of scope.
- Refresh sessions are capped per user by `MAX_REFRESH_SESSIONS_PER_USER` with a default of `10`; O(1) lookup and family-based reuse detection are implemented through `jti`, `familyId`, and `tokenDigest`.
- Validation is enabled globally in NestJS via `ValidationPipe` with compatibility-safe settings:
  - `whitelist: true`
  - `transform: true`
  - implicit conversion enabled
- Strict `forbidNonWhitelisted` is not currently enabled.
- Unsafe browser mutations are checked against the configured frontend Origin/Referer allowlist, while CORS remains credential-aware.
- Global API throttling is `300` requests per minute, with narrower limits for auth, password, login-challenge, session, and media-upload operations.
- Frontend responses include CSP, referrer, permissions, frame, MIME-sniffing, and opener-policy headers; HSTS is production-only.
- Root runtime files pin Node `24.16.0`; package manifests accept Node `>=24.15.0`:
  - root `.nvmrc`
  - root `.node-version`
  - `engines.node` in frontend/backend package manifests
- Current primary framework/toolchain versions are Next.js `16.2.7`, React `19.2.7`, NestJS `11.1.26`, Prisma `7.8.0`, and TypeScript `6.0.3`.
- Backend development uses `nest start --watch` so TypeScript decorator metadata required by Nest dependency injection is emitted. Standalone seed/admin scripts use `tsx`; `ts-node-dev`, `ts-node`, and `tsconfig-paths` are no longer runtime dependencies.
- Frontend uses ESLint `9.39.4`, the newest release compatible with the plugin set bundled by `eslint-config-next` `16.2.7`; backend uses ESLint `10.4.1`.
- Backend pins the Prisma CLI transitive `@hono/node-server` dependency to patched `1.19.13` through an npm override until Prisma publishes the patched dependency directly.

## Review priorities
When auditing or reviewing this repository, prioritize:
- frontend/backend integration
- auth/session consistency
- role enforcement and admin access control
- media storage and cleanup correctness
- settings/content persistence and public consumption
- DTO and request validation behavior
- environment and URL contract correctness
- test truthfulness vs fake coverage
- type safety
- legacy/experimental leftovers
- production-readiness of admin and content flows

## Analysis rules
- Start from actual entry points and runtime modules, not from old project history.
- Distinguish clearly between:
  - facts from code
  - runtime-dependent risks
  - open questions requiring manual verification
- Prefer file-based evidence.
- If behavior depends on DB contents, cookies, live uploads, deployed origin, or real env vars, say so explicitly.
- If a repo rule and the code disagree, trust the codebase and update the guidance instead of repeating stale assumptions.

## AGENTS.md maintenance rule
- `AGENTS.md` is a living operational file for this exact repository, not a one-time bootstrap note.
- Every meaningful codebase change that affects architecture, runtime contracts, auth/session behavior, role/admin behavior, testing strategy, environment expectations, or product truthfulness must review and update `AGENTS.md` in the same batch.
- Do not treat `AGENTS.md` updates as optional doc polish when repository truth changes.
- If a change does not require an `AGENTS.md` update, say so explicitly in the final summary instead of silently skipping the review.

## Development rules
- Do not change code unless explicitly asked.
- Do not install dependencies unless explicitly asked.
- Do not run migrations unless explicitly asked.
- Do not redesign architecture unless explicitly asked.
- Prefer minimal, targeted, production-oriented patches.
- Do not rewrite large files from scratch unless it is clearly justified.
- Before editing, identify:
  - entry points
  - auth/session flow
  - admin access flow
  - environment/config contract
  - relevant tests
- Be especially careful in:
  - `frontend/proxy.ts`
  - `frontend/contexts/AuthContext.tsx`
  - `backend/src/auth/*`
  - `backend/src/media/*`
  - `backend/src/site-settings/*`
  - `backend/prisma/schema.prisma`

## Environment and config rules
- Local development contract is:
  - frontend app: `http://localhost:3000`
  - backend API: `http://localhost:3001`
- Frontend env expectations:
  - `NEXT_PUBLIC_API_URL=http://localhost:3001`
  - `INTERNAL_API_URL=http://localhost:3001`
- Backend env expectations:
  - `PORT=3001`
  - `FRONTEND_URL=http://localhost:3000`
  - `PUBLIC_API_URL=http://localhost:3001` for media URLs (the only supported variable; the old `BACKEND_PUBLIC_URL` alias was removed)
  - `BCRYPT_SALT_ROUNDS` is optional and defaults to `12`
  - required secrets/env:
    - `JWT_ACCESS_SECRET`
    - `JWT_REFRESH_SECRET`
    - `REFRESH_TOKEN_DIGEST_SECRET`
    - `DATABASE_URL`
    - `RECAPTCHA_SECRET_KEY`
    - `MAIL_HOST`
    - `MAIL_PORT`
    - `MAIL_SECURE`
    - `MAIL_USER`
    - `MAIL_PASSWORD`
    - `MAIL_FROM_EMAIL`
    - `MAIL_FROM_NAME`
    - `MAX_REFRESH_SESSIONS_PER_USER` defaults to `10` if omitted
    - `TRUST_PROXY_HOPS` defaults to `0`; configure it only for a known reverse-proxy topology
- Keep local assumptions separate from production assumptions.
- Do not hardcode production domains/secrets in source code.
- Treat `.env.example` as the documentation contract for new environments.
- If `.env.example` disagrees with runtime code, that is a real issue and should be called out.
- Frontend `.env.example` documents only variables the code actually reads: `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
- Deployment is documented in root `DEPLOYMENT.md` (Ubuntu/Debian, nvm Node 24.16.0, MySQL 8, `prisma migrate deploy`, PM2 or systemd, nginx with `/uploads` served through the backend, certbot HTTPS, first-admin promotion, backups).

## Auth/session rules
- Preserve backend-driven session creation only after a verified login or a successfully completed login challenge.
- Preserve `/auth/me` as the real source of auth state.
- Do not reintroduce frontend-only auth markers or fake session state.
- Temporary auth unavailability should degrade gracefully, not silently convert to logout.
- Any change to cookies, token refresh, middleware auth checks, or `/auth/me` behavior is sensitive and should be treated as high-risk unless narrowly scoped and verified.
- Access, refresh, and refresh-digest secrets must be independent, non-placeholder values of at least 32 characters.

## Admin and role rules
- Keep the role model minimal unless explicitly expanded:
  - `USER`
  - `ADMIN`
- Do not introduce a broad RBAC matrix unless explicitly requested.
- Backend role enforcement is the source of truth; frontend role-aware UI is secondary.
- `/admin` must remain `ADMIN`-only at both:
  - frontend route protection level
  - backend endpoint protection level
- Non-admin users must not see misleading write/admin actions.
- If admin assignment changes are needed, prefer explicit operator/developer workflows over broad in-app role management.

## Media/upload rules
- Treat `backend/uploads` as runtime data, not as casual source files.
- Do not delete or rewrite upload files casually.
- Preserve the managed uploads contract:
  - files live under `uploads/plants` or `uploads/site`
  - public URLs resolve under `/uploads/...`
  - managed file deletion must stay reference-aware
  - image content must match the declared supported extension by magic bytes
  - absolute managed media URLs must match `PUBLIC_API_URL`
- When changing media behavior, verify both:
  - backend contract
  - frontend usage/preview/selection flows
- Avoid hardcoded absolute local filesystem hacks.

## Site settings/content rules
- Prefer the existing singleton `SiteSettings` model over introducing fake CMS sections.
- Public storefront text/settings should continue to come from backend-backed settings where already wired.
- If future content areas are added, prefer a small real persisted model over fake admin placeholders.

## Database and migration rules
- Prisma schema changes are sensitive and should be narrow.
- Do not run migrations unless explicitly asked.
- If a schema change is required, report:
  - model impact
  - migration requirement
  - runtime verification needs
- `backend/src/generated/prisma` is active Prisma 7 generated source. Keep `/src/generated` ignored in `backend/.gitignore`, regenerate it through `npm install`/`npm run postinstall` or `npm.cmd exec prisma generate`, and never edit it manually.
- Prisma CLI configuration lives in `backend/prisma.config.ts`; the datasource URL remains an environment value and is passed to Prisma CLI through that config.
- Prisma runtime access uses the MariaDB/MySQL driver adapter and parses `DATABASE_URL` in `backend/src/prisma/prisma-adapter.ts`.

## Testing rules
- Prefer truthful coverage over broad fake coverage.
- Keep tests aligned with real implemented behavior.
- Do not keep starter tests that no longer reflect the architecture.

### Current backend test stack
- Jest unit/integration-style tests in `backend/src/**/*.spec.ts`
- Current backend suite covers:
  - auth service/controller/DTOs and `JwtStrategy`, including atomic token consumption, refresh rotation/reuse/concurrency, current database-backed roles, and password-change contracts
  - current-user `/auth/me` profile/settings update
  - orders service/controller/DTOs
  - roles guard
  - admin contract
  - plants service/controller
  - media storage/service/controller, including path traversal and magic-byte checks
  - site settings service/controller/DTO URL policies
  - unsafe request Origin validation
- Backend `test:e2e` runs Jest through `node --experimental-vm-modules` because the generated Prisma 7 client performs a dynamic `import()` during bootstrap; without the flag the real-stack smoke fails with `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG`.
- The smoke logout assertion checks revocation semantics (`revokedAt` set on active refresh tokens), not row deletion.
- Backend `test:e2e` now includes an opt-in real HTTP smoke suite in `backend/test/admin-smoke.e2e-spec.ts` for:
  - real login
  - real cookies
  - real `/auth/me`
  - real admin-only `PATCH /site-settings`
  - real logout invalidation
  - real current-user `PATCH /auth/me`
  - real current-user order creation/list/detail
  - real admin order list/detail/status update
- The real-stack smoke suite is DB-backed and intentionally opt-in via `RUN_REAL_STACK_SMOKE=1`.

### Current frontend test stack
- Vitest + Testing Library component/integration tests
- Playwright browser E2E smoke tests
- Browser E2E specs live under `frontend/e2e`, and `frontend/package.json` pins `@playwright/test` with `npm run test:e2e` as the local Playwright entrypoint.
- Playwright starts the frontend through `frontend/e2e/start-next.mjs`, which builds Next.js with the mock backend URL and serves it with `next start` on the E2E port instead of starting a second `next dev` instance.
- Frontend tests currently cover:
  - admin shell
  - `AuthContext` auth/logout semantics
  - shared frontend auth-recovery mutex for concurrent failures
  - `CartContext` and `SiteSettingsContext`
  - `frontend/proxy.ts` protected-route role redirects
  - auth modal inline login/register/forgot-password/challenge UX
  - auth-security client helpers
  - cart-to-order creation wiring
  - dashboard overview latest-order summary state
  - dashboard orders list/detail states
  - admin orders manager
  - plants admin manager
  - media uploader
  - dashboard settings current-user persistence and password-change flow
  - navbar search modal real navigation
  - browser admin access
  - browser user-cabinet smoke flow
  - browser plants smoke flow
  - browser settings smoke flow
  - browser mobile-viewport smoke flow (`frontend/e2e/mobile-smoke.spec.ts`: homepage + mobile menu, catalog search, honest empty search state)
- The e2e mock backend (`frontend/e2e/mock-backend.mjs`) mirrors the real `GET /plants` contract including the `search` parameter and `meta.search`.
- Keep app/runtime TS config and test TS config separated. Production build must not depend on test-only files.

## Verification rules
- After meaningful frontend changes, prefer running:
  - `cd frontend && npm run lint`
  - `cd frontend && npm test` when UI/component logic changed
  - `cd frontend && npm run build`
- After meaningful backend changes, prefer running:
  - `cd backend && npm run lint`
  - `cd backend && npm run build`
  - `cd backend && npm test -- --runInBand`
- Backend `npm run lint` is a non-mutating check; use `npm run lint:fix` only when an explicit auto-fix pass is intended.
- If a backend auth/session change touches real cookies, logout semantics, `/auth/me`, or current-user update flow, also prefer:
  - `cd backend && npm run test:e2e`
  - and when needed `RUN_REAL_STACK_SMOKE=1` with a valid local/test `DATABASE_URL`
- If the DB-backed smoke suite is not run, say so explicitly.
- If verification fails, prefer a narrow repair pass before moving on.
- If a build/test fails due sandbox or environment restrictions rather than code, say so explicitly.

## Safe vs risky changes

### Usually safe
- small DTO validation fixes aligned with existing payloads
- admin UI visibility fixes that do not change backend authorization
- truthful test rewrites
- env/example documentation alignment
- narrowly scoped tooling/config fixes
- notification and UX error-state fixes

### Usually risky
- auth/session contract changes
- cookie behavior changes
- middleware/proxy auth logic changes
- Prisma schema changes
- migration-required changes
- upload storage/path/cleanup contract changes
- role model expansion beyond `USER` / `ADMIN`
- broad admin IA/UX rewrites

## Current fragile or incomplete areas
- Backend media storage is local filesystem storage; deployment/storage strategy beyond local/public serving still requires operational care.
- Auth/session logic is much better aligned now, but middleware refresh/cookie behavior remains sensitive.
- SMTP-backed security email delivery is now part of the runtime contract and still needs operational monitoring in real environments.
- `frontend/proxy.ts` still requires special care because protected-route behavior under temporary backend verification failure is security-sensitive and easy to get wrong.
- Refresh-token lookup and reuse detection are implemented, but the new migration must be applied before the updated backend can use the database; it intentionally invalidates all pre-migration refresh sessions.
- Email security is now a real persisted domain via `VerificationToken` and `LoginChallenge`, but broader account lifecycle features are still postponed:
  - change email
  - delete account
  - export account data
  - full session/device management UI
- Site settings currently cover text/links/contact content, not a full CMS or full media-backed theme system.
- Orders are now a real minimal subsystem, but advanced commerce features are still absent:
  - payment gateway integration
  - invoices/receipts
  - shipment provider integration
  - reorder/export flows
- Browser E2E coverage is a smoke baseline, not exhaustive coverage.
- Backend DB-backed real integration coverage now exists as a small opt-in smoke layer, but it is still limited compared with the unit/integration-style suite.
- `backend/.env.example` should be reviewed carefully in future passes if it drifts from safe/local defaults.
- Root `.gitignore` exists and excludes local generated documents, archives, build output, coverage, temp files, and env files; keep frontend/backend ignore files for app-specific rules.

## Code review rules
When asked to review the repository:
- review it as a production system, not as a tutorial
- identify bugs, regressions, validation gaps, auth/session issues, authorization issues, media/storage risks, admin workflow gaps, config drift, and stale assumptions
- group findings by severity
- for each issue explain:
  1. what is wrong
  2. where it is
  3. why it matters
  4. how it should ideally be fixed
  5. whether it is safe to auto-fix or needs manual/product decision
- separate safe quick wins from risky changes
- prioritize production impact over style

## Output expectations
When asked to analyze, review, or implement changes in this repository, prefer this structure when it fits the task:
1. architecture summary
2. important files and folders
3. request/data flow
4. current product/engineering contracts
5. risks and technical debt
6. prioritized findings or implementation plan
7. safe quick wins
8. risky changes
9. open questions requiring manual verification
10. exact list of changed files

Keep reports practical, evidence-based, and specific to this repository.
