# mybirthday.myx.is

Cloudflare Worker app for Omar's birthday portal (RSVP, quiz, events, media).

## Production

- URL: `https://mybirthday.myx.is`
- Worker name: `mybirthday-myx-is`

## Actual Tech Stack

- Runtime: Cloudflare Workers (raw `fetch` handler)
- Language: TypeScript
- Frontend: single `index.html` SPA with inline CSS/JS
- Persistence: KV (`QUIZ_DATA`) + in-memory maps
- Testing: Vitest
- Linting: ESLint (flat config)

## Project Layout

- `modules/mobile-app-shell/worker.ts`: main API + HTML serving entrypoint
- `modules/mobile-app-shell/index.html`: SPA shell
- `modules/mobile-app-shell/quizData.ts`: quiz question dataset
- `tests/unit/`: unit/regression tests
- `wrangler.toml`: canonical Worker config

## Scripts

- `npm run dev`: local Worker dev server
- `npm run build`: Wrangler dry-run bundle check
- `npm run lint`: ESLint checks
- `npm run generate:openapi`: regenerates `docs/openapi.json` from `worker.ts` routes
- `npm run check:openapi-sync`: fails if committed OpenAPI spec is stale
- `npm run validate:openapi`: validates `docs/openapi.json`
- `npm run typecheck`: TypeScript checks
- `npm run test`: Vitest tests
- `npm run seed:test-user`: seeds an extensive Bók Lífsins-based test user flow + 100 quiz questions
- `npm run deploy`: deploy Worker

`seed:test-user` targets `SEED_BASE_URL` (default: `http://127.0.0.1:8787`).

## API Surface (high level)

- RSVP: `/api/rsvp`, `/api/rsvp/stats`
- Quiz: `/api/quiz/questions`, `/api/quiz/question`, `/api/quiz/answer`, leaderboard/player, admin question CRUD
- Events: `/api/events/create`, `/api/events/:id/clone`, `/api/events/:slug/public`, `/api/dashboard/me`
- Hosting: `/api/hosting/signup`, `/api/hosting/tenant`
- Photo wall: `/api/photowall`, `/api/photowall/item`
- Planner: `/api/planner/apply`, `/api/planner/applications`
- Selfie: `/api/selfie/list`, `/api/selfie/capture`, `/api/selfie/item`
- Karaoke: song list/detail/audio/upload/transcribe/lyrics/delete
- Admin: `/api/admin/overview`

## Docs

- Detailed endpoint docs: `docs/api.md`
- OpenAPI spec (compact): `docs/openapi.json`
