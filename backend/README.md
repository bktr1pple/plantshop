# PlantShop Backend

NestJS API for the PlantShop web application. The backend provides authentication, user profile settings, plant catalog management, persisted orders, admin-only media management, and persisted site settings.

## Runtime

- Node.js: `24.16.0`
- NestJS: `11.1.26`
- Prisma: `7.8.0` with the MariaDB/MySQL driver adapter
- API default URL: `http://localhost:3001`
- Database: MySQL through Prisma

The repository root contains `.nvmrc` and `.node-version` with the expected Node.js version.

## Setup

```bash
npm install
npm.cmd exec prisma generate
```

Create `backend/.env` from `backend/.env.example` and replace placeholder values with local secrets. Do not reuse production credentials in local examples.

Required environment variables:

- `PORT`
- `FRONTEND_URL`
- `PUBLIC_API_URL`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `REFRESH_TOKEN_DIGEST_SECRET`
- `RECAPTCHA_SECRET_KEY`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_SECURE`
- `MAIL_USER`
- `MAIL_PASSWORD`
- `MAIL_FROM_EMAIL`
- `MAIL_FROM_NAME`

Generate independent secrets for access JWTs, refresh JWTs, and refresh-token
digests. Never commit real `.env` files, SMTP credentials, database credentials,
uploads, build output, or archives made from the working directory. Before
sharing the project, create a clean archive that excludes ignored runtime data.

Optional environment variables:

- `MAX_REFRESH_SESSIONS_PER_USER`, default `10`
- `TRUST_PROXY_HOPS`, default `0`

## Refresh Token Migration

The migration
`prisma/migrations/20260609113000_secure_refresh_token_lifecycle` adds indexed
refresh-token identifiers, HMAC digests, token families, rotation links, and
revocation timestamps.

Before applying it:

1. Back up the target database.
2. Add a new independent `REFRESH_TOKEN_DIGEST_SECRET` with at least 32
   characters.
3. Rotate any credentials that may previously have been included in local
   examples or shared archives.
4. Apply the migration in the intended environment:

```bash
npm.cmd exec prisma migrate deploy
```

The migration deletes existing refresh-token rows because old bcrypt hashes
cannot be converted into indexed HMAC digests. All users will need to sign in
again after deployment.

## Development

```bash
npm run dev
```

The development server starts through the Nest CLI watch compiler and listens on `PORT`, defaulting to `3001`. The Nest compiler must be used here because dependency injection relies on emitted decorator metadata.

## Production Build

```bash
npm run build
npm run prod
```

## Validation And Tests

```bash
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e
```

`npm run test:e2e` contains an opt-in DB-backed smoke suite. Real-stack smoke tests run only when `RUN_REAL_STACK_SMOKE=1` and a valid test `DATABASE_URL` are provided.

Use `npm run lint:fix` only when you explicitly want ESLint to rewrite files.

## Admin Promotion

```bash
npm run promote:admin -- user@example.com
```

The command promotes an existing user to the `ADMIN` role.
