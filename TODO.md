# TODO — mybirthday.myx.is

Last updated: 2026-02-17 (ui-zone refactor sync)

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
8. Added API documentation artifacts:
   - human-readable reference: `docs/api.md`
   - machine-readable spec: `docs/openapi.json`
9. Added OpenAPI validation gate:
   - validator script: `scripts/validate-openapi.js`
   - npm script: `npm run validate:openapi`
   - CI check in `.github/workflows/ci.yml`
10. Added OpenAPI auto-generation and sync gate:
    - generator script: `scripts/generate-openapi.js`
    - npm scripts:
      - `npm run generate:openapi`
      - `npm run check:openapi-sync`
    - CI now fails when `docs/openapi.json` is out of sync with routes in `worker.ts`.
11. Deployed latest Worker update to production:
    - Worker: `mybirthday-myx-is`
    - Version: `5f7cb116-d76e-4ee6-8c0a-9d89e633a106`
12. Added and executed Bók Lífsins power seeder:
    - script: `scripts/seed-boklifsins-test-user.js`
    - creates cross-feature test user data + 100 custom quiz questions
    - last run summary: `quizQuestionsCreated=100`, `failures=[]`
13. Refactored mobile app shell layout into clearer UX zones in `modules/mobile-app-shell/index.html`:
    - stronger landing section with quick action jump buttons
    - “Vissir þú?”/fact widgets and extra truth flip-cards
    - grouped “zone” headers to separate onboarding, game, media, and host areas
    - preserved existing `sec-*` and `data-*` hooks to avoid JS regressions
14. Added desktop-first admin split view in `modules/mobile-app-shell/index.html`:
    - phone parser left, dedicated admin panel right
    - desktop admin auto-mode plus live panel refresh every 15s
    - quick control buttons for host/photos/refresh/event-loop
15. Upgraded party and karaoke experience:
    - random “dýnamít-kúla” burst with heavy confetti and temporary auto-healing UI glitch
    - retro Nintendo-style background layer for birthday mode
    - API-level karaoke preset (`Hann á afmæli í dag`) with lyrics + guitar chords

## Current Priorities

1. Keep docs and OpenAPI spec in sync with `worker.ts` as routes evolve.
2. Add E2E smoke coverage (optional, Playwright) for core user flows:
   - RSVP submit
   - Quiz answer submit
   - Event creation from dashboard context
3. Improve generated OpenAPI detail (richer request/response schemas per route).

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
