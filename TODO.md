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
6. Added and validated quality gate scripts:
   - `npm run lint`
   - `npm run build` (Wrangler dry-run bundle check)
   - full gate verified locally: `lint + build + typecheck + test` all passing.
7. Expanded API regression tests (`tests/unit/worker-validation.test.ts`) for critical routes:
   - `/api/rsvp` (success + validation failure)
   - `/api/quiz/answer` (success + bounds failure)
   - `/api/events/create` (success + time validation failure)
   - `/api/photowall/item` (auth failure + success)
   - `/api/planner/apply` (required fields + success)
   - `/api/hosting/signup` (invalid input + success)

## Current Priorities

1. Clean up documentation drift:
   - align `README.md` + `CLAUDE.md` with actual architecture (raw Worker + vanilla SPA).
2. Add E2E smoke coverage (optional, Playwright) for core user flows:
   - RSVP submit
   - Quiz answer submit
   - Event creation from dashboard context

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
