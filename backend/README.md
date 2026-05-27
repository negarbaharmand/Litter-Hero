# Litter Hero Backend

This folder contains the Litter Hero API: authentication, report workflows, voting logic, leaderboard data, and image upload handling.

## Tech stack

- Node.js + Express
- TypeScript
- PostgreSQL + PostGIS
- Drizzle ORM + Drizzle Kit
- Swagger (OpenAPI)
- JWT authentication

## Local development

From `backend/`:

```bash
npm install
cp .env.example .env
npm run dev
```

Default local API URL: [http://localhost:3000](http://localhost:3000)

## Required environment variables

Configure these in `backend/.env` (or via Docker compose):

- `JWT_SECRET`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `PORT` (optional, defaults to `3000`)
- `S3_URL`
- `S3_BUCKET`
- `S3_REGION` (default `garage`)
- `access_key_S3`
- `secret_key_S3`
- `RESEND_API_KEY` (email verification flow, when `feature/email-verification` is merged)
- `EMAIL_FROM` (defaults to `onboarding@resend.dev` if unset)
- `APP_URL` (frontend base URL used to build verification links, defaults to `http://localhost:5173`)

Reference template: [./.env.example](./.env.example)

## Scripts

- `npm run dev` - run API in watch mode
- `npm run build` - compile TypeScript
- `npm run start` - run compiled server
- `npm run check` - type-check only
- `npm run test` - run backend tests
- `npm run db:generate` - generate Drizzle migrations
- `npm run db:migrate` - apply migrations
- `npm run db:studio` - open Drizzle Studio

## API documentation

Swagger UI is available at:

- [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Main route groups:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/logout`
- `POST /api/auth/verify-email` (email verification branch)
- `POST /api/auth/resend-verification` (email verification branch)
- `GET /api/users/leaderboard`
- `GET /api/users/me`
- `GET /api/reports`
- `GET /api/reports/vote-queue`
- `POST /api/reports`
- `POST /api/reports/:id/cleanup-submissions`
- `POST /api/reports/:id/cleanup-submissions/:submissionId/votes`
- `POST /api/reports/:id/verification-votes`
- `POST /api/upload`

## Report and cleanup workflow

1. User creates a litter report.
2. Community votes on report legitimacy (`verification-votes`).
3. Users submit cleanup proof with image evidence.
4. Community votes on cleanup submissions.
5. Winning/approved submissions update report status and contributor points.

This workflow supports fair moderation and reinforces the game loop used in the frontend.

## Integrations and services

- **Garage (S3-compatible storage)** for uploaded images (through `/api/upload`)
- **Google OAuth** for social sign-in support
- **Resend API** for email verification (implemented in `feature/email-verification`, planned to merge)

### Resend integration details (email verification)

- **Dependency**: `resend` package in backend dependencies.
- **Current email content strategy**: inline HTML email generated in backend code (no stored Resend template IDs yet).
- **Primary event triggers**:
  - `POST /api/auth/register` creates verification token and sends email.
  - `POST /api/auth/resend-verification` rotates token and sends a fresh email.
- **Verification endpoint**:
  - `POST /api/auth/verify-email` verifies token and marks account as verified.
- **Email subject**: `Verify your Litter Hero account`.
- **Token behavior**:
  - random 32-byte token,
  - stored as SHA-256 hash in DB,
  - expiry set to 1 hour.
- **Account behavior**:
  - login is blocked until `emailVerifiedAt` is set,
  - Google sign-in users are marked verified immediately.
- **Resend testing caveat**:
  - in sandbox/test mode, Resend may only send to your own verified recipient address.

## Database and migrations

Common migration flow:

```bash
npm run db:generate
npm run db:migrate
```

Drizzle Studio:

```bash
npm run db:studio
```

## Operational notes

- Metrics middleware is enabled via `express-prom-bundle`.
- Basic health/config route exists at `/config-test`.
- Root route (`/`) returns a simple API-running message.

## Related docs

- Project overview: [../README.md](../README.md)
- Frontend docs: [../frontend/README.md](../frontend/README.md)
