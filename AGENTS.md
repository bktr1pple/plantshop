# AGENTS.md

## Project overview
This repository is a real product codebase with two main applications:
- `frontend`: Next.js 16 App Router storefront and admin UI
- `backend`: NestJS 11 API with Prisma/MySQL

The repository is no longer a starter/demo state. It already contains:
- real cookie-based auth/session flow
- a minimal real `USER` / `ADMIN` role model
- protected admin-only backend write operations
- a real `/admin` subsystem
- media upload/storage and cleanup logic
- backend-backed site settings/content management
- frontend unit/integration tests and browser E2E smoke tests
- a parallel `vinext` experiment in the frontend

Treat the current codebase as the source of truth. Do not rely on historical assumptions once the code says otherwise.

## Working language
- Always write explanations, summaries, reports, plans, reviews, audit notes, and implementation notes in Ukrainian.
- Keep repository files in their existing language/convention unless the task explicitly requires changing them.

## Current architecture reality

### Frontend
- Main app lives in `frontend/app`.
- Public storefront routes include `/`, `/plants`, `/about`, `/contact`, `/care`, `/pots`, `/landscape-design`, `/convert`, `/dashboard`, `/signin`, `/register`, `/logout`.
- Admin routes live under `frontend/app/admin`:
  - `/admin`
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
  - `frontend/contexts/WishlistContext.tsx`

### Backend
- Main entry point: `backend/src/main.ts`
- Root module: `backend/src/app.module.ts`
- Main runtime modules:
  - `backend/src/auth`
  - `backend/src/plants`
  - `backend/src/media`
  - `backend/src/site-settings`
  - `backend/src/prisma`
- Prisma schema: `backend/prisma/schema.prisma`
- Upload storage root: `backend/uploads`

### Auth/session architecture
- Registration auto-logs in the user through the backend, not through frontend fake state.
- Backend auth endpoints:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me`
- Auth uses httpOnly cookies:
  - `access_token`
  - `refresh_token`
- Frontend auth bootstrap performs a real `/auth/me` check on mount.
- Frontend distinguishes:
  - authenticated
  - unauthorized
  - temporarily unavailable auth backend
- Temporary auth/backend/network failures must not be treated as confirmed logout.
- Route protection is enforced both:
  - server-side in `frontend/proxy.ts`
  - backend-side on protected endpoints

### Role/admin model
- Role model is already implemented in the database and auth payloads.
- Current role enum is minimal and real:
  - `USER`
  - `ADMIN`
- New users default to `USER`.
- `/auth/me` returns `role`.
- Backend write operations for plants require `ADMIN`.
- Frontend only shows admin entry points to `ADMIN` users.
- Admin promotion workflow exists via:
  - `backend/src/scripts/promote-admin.ts`
  - `npm run promote:admin -- user@example.com`

### Plants/catalog model
- Public read endpoints:
  - `GET /plants`
  - `GET /plants/:id`
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
  - file type validation
  - file size limits
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

### Vinext experiment
- `frontend` now supports two parallel frontend modes:
  - canonical Next.js flow
  - experimental Vinext/Vite flow
- Next.js scripts remain the default/canonical path:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
- Vinext scripts are separate and must be treated as experimental:
  - `npm run dev:vinext`
  - `npm run build:vinext`
  - `npm run start:vinext`
- `vinext` is currently compatible enough to build, but still has partial limitations around `next/image` local optimization.
- Do not assume a Vinext issue implies a Next.js issue, or vice versa.

## Current product decisions already implemented
- Registration must automatically log in the user through backend-created real session cookies.
- Frontend must not fake authenticated state after registration.
- `/dashboard` and `/admin` must not remain accessible if auth verification fails.
- `/admin` is a real subsystem now, not a draft.
- `admin-test` is not a production admin area and should not be reintroduced as if it were one.
- `/plants` read endpoints stay public.
- `/plants` write endpoints require authenticated `ADMIN`.
- Site settings are editable through the admin UI and are consumed by public pages.
- Media uploads are real backend-managed files, not fake blob-only frontend state.
- Validation is enabled globally in NestJS via `ValidationPipe` with compatibility-safe settings:
  - `whitelist: true`
  - `transform: true`
  - implicit conversion enabled
- Strict `forbidNonWhitelisted` is not currently enabled.
- Node runtime contract is normalized around Node `24.14.0` locally:
  - root `.nvmrc`
  - root `.node-version`
  - `engines.node` in frontend/backend package manifests

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
  - `PUBLIC_API_URL=http://localhost:3001` for media URLs
  - required secrets/env:
    - `JWT_ACCESS_SECRET`
    - `JWT_REFRESH_SECRET`
    - `DATABASE_URL`
    - `RECAPTCHA_SECRET_KEY`
- Keep local assumptions separate from production assumptions.
- Do not hardcode production domains/secrets in source code.
- Treat `.env.example` as the documentation contract for new environments.
- If `.env.example` disagrees with runtime code, that is a real issue and should be called out.

## Auth/session rules
- Preserve backend-driven session creation after register/login.
- Preserve `/auth/me` as the real source of auth state.
- Do not reintroduce frontend-only auth markers or fake session state.
- Temporary auth unavailability should degrade gracefully, not silently convert to logout.
- Any change to cookies, token refresh, middleware auth checks, or `/auth/me` behavior is sensitive and should be treated as high-risk unless narrowly scoped and verified.

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
- `backend/src/generated` currently appears to be generated residue and not part of the active runtime imports. Treat it as potentially removable only after explicit verification of all usages.

## Testing rules
- Prefer truthful coverage over broad fake coverage.
- Keep tests aligned with real implemented behavior.
- Do not keep starter tests that no longer reflect the architecture.

### Current backend test stack
- Jest unit/integration-style tests in `backend/src/**/*.spec.ts`
- Current backend suite covers:
  - auth service/controller/DTOs
  - roles guard
  - admin contract
  - plants service/controller
  - media storage/service/controller
  - site settings service/controller
- Backend `test:e2e` config exists, but there is no meaningful real backend browser/HTTP E2E suite yet.

### Current frontend test stack
- Vitest + Testing Library component/integration tests
- Playwright browser E2E smoke tests
- Frontend tests currently cover:
  - admin shell
  - plants admin manager
  - media uploader
  - settings manager
  - browser admin access
  - browser plants smoke flow
  - browser settings smoke flow
- Keep app/runtime TS config and test TS config separated. Production build must not depend on test-only files.

## Verification rules
- After meaningful frontend changes, prefer running:
  - `cd frontend && npm run lint`
  - `cd frontend && npm test` when UI/component logic changed
  - `cd frontend && npm run build`
  - `cd frontend && npm run build:vinext` only if the change affects the Vinext path
  - `cd frontend && npx vinext check` only if the change affects Vinext compatibility/tooling
- After meaningful backend changes, prefer running:
  - `cd backend && npm run lint`
  - `cd backend && npm run build`
  - `cd backend && npm test -- --runInBand`
- If verification fails, prefer a narrow repair pass before moving on.
- If a build/test fails due sandbox or environment restrictions rather than code, say so explicitly.

## Vinext experiment rules
- Treat Vinext as a parallel experiment, not the primary source of product truth.
- Default user-facing/frontend claims should still be validated against the canonical Next.js flow unless the task is explicitly about Vinext.
- When working on Vinext:
  - keep ESM-safe config
  - avoid reintroducing CommonJS globals like `__dirname` in ESM config files
  - separate test/build config from the canonical Next build pipeline
- If Vinext and Next behavior diverge, document the divergence instead of guessing.

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
- Vinext-only changes that silently break canonical Next.js flow

## Current fragile or incomplete areas
- Vinext still has partial support limitations around `next/image`.
- `build:vinext` may emit non-fatal Rolldown/plugin warnings even when it succeeds.
- Backend media storage is local filesystem storage; deployment/storage strategy beyond local/public serving still requires operational care.
- Auth/session logic is much better aligned now, but middleware refresh/cookie behavior remains sensitive.
- Site settings currently cover text/links/contact content, not a full CMS or full media-backed theme system.
- Browser E2E coverage is a smoke baseline, not exhaustive coverage.
- Backend DB-backed real integration coverage is still limited compared with the unit/integration-style test suite.
- `backend/.env.example` should be reviewed carefully in future passes if it drifts from safe/local defaults.
- Root `.gitignore` currently ignores `*.md`, which can affect future repo-level documentation additions and should be treated cautiously.

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
