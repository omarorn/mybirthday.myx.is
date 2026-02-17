# TODO — mybirthday.myx.is

Last updated: 2026-02-17

## Done This Week

1. Worker error handling hardened (`HttpError`, centralized JSON parsing, payload validation, global API fallback).
2. Added unit tests with Vitest for key validation paths (`tests/unit/worker-validation.test.ts`).
3. Added CI skeleton (`.github/workflows/ci.yml`) running:
   - `npm ci`
   - `npm run typecheck`
   - `npm run test`
   - `lint` and `build` only if scripts exist.
4. Wrangler config consolidated around `wrangler.toml` as canonical config.
5. npm scripts updated to explicitly use `wrangler.toml`:
   - `npm run dev`
   - `npm run deploy`

## Current Priorities

1. Add missing scripts to satisfy full pre-commit gate in AGENTS:
   - `lint`
   - `build`
2. Expand test coverage for all critical API routes:
   - `/api/rsvp`
   - `/api/quiz/answer`
   - `/api/events/create`
   - `/api/photowall/item`
   - `/api/planner/apply`
   - `/api/hosting/signup`
3. Clean up documentation drift:
   - align `README.md` + `CLAUDE.md` with actual architecture (raw Worker + vanilla SPA).

## Next Technical Upgrades

1. Introduce request schema validation library (recommended: `zod`) to replace manual field checks.
2. Decide on routing architecture:
   - keep raw `fetch` + helper validators, or
   - incrementally migrate to Hono for route/middleware structure.
3. Evaluate D1 migration for relational data (keep KV for cache/edge lookups).

## Parking Lot

1. Orphaned React modules under `modules/`:
   - keep as reference only vs delete vs integrate.
2. R2 media upload pipeline for photo wall.
3. Stronger auth model beyond shared admin password.
