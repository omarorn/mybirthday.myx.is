# Suggested commands

## General shell utilities (Linux)
- `ls -la`
- `cd <path>`
- `find . -maxdepth 2 -type d`
- `rg <pattern>`
- `rg --files`
- `git status`
- `git diff`

## Root app (Astro/Cloudflare) - from root `package.json`
- Install deps: `npm install`
- Build: `npm run build`
- Type/lint check: `npm run lint` or `npm run type-check`
- Dev (migrates + builds + wrangler dev on 4321): `npm run dev`
- Preview/start: `npm run preview` / `npm run start`
- Deploy dry-run: `npm run check`
- Deploy: `npm run deploy`
- DB migrate local D1: `npm run db:migrate`
- DB migrate remote D1: `npm run db:migrate:remote`
- DB seed: `npm run db:seed`

## Frontend app (`frontend/`)
- `cd frontend && npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Tests: `npm run test` (Playwright)
- API/perf/visual suites: `npm run test:api`, `npm run test:performance`, `npm run test:visual`

## Backend service (`backend/`)
- `cd backend && npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Worker: `npm run worker`
- Lint/format: `npm run lint`, `npm run format`

## Database package (`database/`)
- `cd database && npm install`
- Build/watch: `npm run build`, `npm run dev`
- Prisma generate: `npm run generate`
- Migrate/deploy/reset: `npm run db:migrate`, `npm run db:deploy`, `npm run db:reset`
- Seed/studio/verify: `npm run db:seed`, `npm run db:studio`, `npm run db:verify`

## Docker/Makefile shortcuts (repo root)
- `make up`, `make down`, `make logs`
- `make local-dev`, `make local-build`, `make local-migrate`
- `make lint`, `make type-check`, `make test` (containerized)
