# eLoktantra Monorepo

Production-oriented civic-tech platform backbone for:
- Candidate transparency
- Civic issue reporting
- Identity verification
- Tokenized voting flow
- Blockchain-style audit receipts

## Monorepo Layout

- `apps/web` - Next.js citizen-facing web app
- `services/api-gateway` - API gateway and service routing
- `services/auth-service` - registration/login/JWT auth
- `services/candidate-service` - candidate transparency APIs
- `services/manifesto-service` - policy intelligence (summaries + comparisons)
- `services/issue-service` - issue reporting APIs
- `services/promise-service` - candidate promise tracking and progress APIs
- `services/identity-service` - voter verification + voting token issuance
- `services/voting-service` - election + vote submission orchestration
- `services/blockchain-service` - deterministic tx-hash ledger adapter
- `services/audit-service` - vote audit APIs
- `packages/config` - shared runtime/env config
- `packages/types` - shared types
- `packages/utils` - shared error/security/runtime utilities

## Prerequisites

- Node.js 20+
- pnpm (via Corepack)
- Supabase project (or compatible Postgres + Supabase API)

## Setup

1. Install dependencies:

```bash
corepack pnpm install
```

2. Configure environment:

```bash
cp infrastructure/env.template .env
# Fill values in .env
```

3. Create schema in Supabase:
- Run `supabase-schema.sql` in the Supabase SQL editor.

4. Start services (without Turbo):

```bash
corepack pnpm --filter api-gateway dev
corepack pnpm --filter auth-service dev
corepack pnpm --filter candidate-service dev
corepack pnpm --filter manifesto-service dev
corepack pnpm --filter issue-service dev
corepack pnpm --filter promise-service dev
corepack pnpm --filter identity-service dev
corepack pnpm --filter voting-service dev
corepack pnpm --filter blockchain-service dev
corepack pnpm --filter audit-service dev
corepack pnpm --filter web dev
```

## Deploying to Vercel (apps/web)

- Vercel reads `vercel.json` at the repo root. Build/Install are set for pnpm and the monorepo.
- Set these project env vars in Vercel: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_REQUEST_TIMEOUT_MS`, `NEXT_PUBLIC_DEMO_VOTER_ID`, `NEXT_PUBLIC_DEMO_REPORTER_ID`. The `@...` placeholders in `vercel.json` map to Vercel Project Environment Variables or Secrets.
- Output directory is `apps/web/.next`; no `public` folder is required beyond the Next.js defaults.

## API Surface (Phase 1)

- Auth: `/auth/register`, `/auth/login`, `/auth/me`
- Candidate transparency: `/candidates`, `/candidates/search`, `/candidates/:id`
- Manifesto intelligence: `/manifestos`, `/manifestos/compare`, `/manifestos/:id`
- Issues: `/issues` (GET/POST)
- Promise tracker: `/promises`, `/promises/candidate/:id`, `/promises/:id/progress`
- Voting: `/voting/elections`, `/voting/generate-token`, `/voting/vote`
- Identity: `/identity/verify-voter`, `/identity/generate-voting-token`
- Audit: `/audit/election/:id`, `/audit/vote/:hash`

All APIs include:
- JSON-schema request validation
- Consistent error payloads
- Security headers
- Graceful shutdown handling
- Health/readiness endpoints

## Production Notes

- Set strong `JWT_SECRET` (>=32 chars).
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret and server-side only.
- Set explicit `CORS_ORIGINS` per environment.
- Put all services behind TLS termination and WAF/rate-limit at ingress.
- Run DB migrations/schema updates via controlled pipeline.
