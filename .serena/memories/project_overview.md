# mybirthday.myx.is — Project Overview

## What This Is
Mobile-first party planner and RSVP hub for Omar's 50th birthday (June 19, 2026).
Single Cloudflare Worker serving a complete SPA from one HTML file.

## Tech Stack
- **Runtime:** Cloudflare Workers (raw fetch handler, NO framework)
- **Persistence:** KV namespace (QUIZ_DATA) + in-memory Maps
- **Frontend:** Single HTML file with inline CSS + vanilla JS
- **Language:** TypeScript (worker), JavaScript (frontend)
- **AI:** Workers AI binding (Whisper for karaoke transcription)
- **Tests:** Vitest (unit/regression tests)
- **Lint:** ESLint (flat config)
- **CI:** GitHub Actions (typecheck, lint, test, build)

## Key Files
- `modules/mobile-app-shell/worker.ts` (~1830 lines) — Main worker with all API routes
- `modules/mobile-app-shell/index.html` (~2800 lines) — Full SPA with 8 nav tabs
- `modules/mobile-app-shell/quizData.ts` (~494 lines) — 30 quiz questions about Omar
- `tests/unit/worker-validation.test.ts` — API regression tests
- `wrangler.toml` — Canonical Worker config

## Entry Point
`wrangler.toml` → `main = "modules/mobile-app-shell/worker.ts"`

## Features (8 nav tabs)
1. Heim — Landing/home with countdown
2. RSVP — Party RSVP with name, contact, dietary, partySize
3. Dagskrá — Events/schedule management
4. Spurningar — Quiz game with leaderboard
5. Myndir — Photo wall (admin-curated)
6. Selfie — Camera booth (WebRTC capture + gallery)
7. Karaoke — Song upload, AI transcription, lyrics sync player
8. Gestgjafi — Hosting/planner applications

## Auth Pattern
- Admin: `x-admin-password` header with timing-safe comparison
- Owner: `x-owner-id` header for event management

## Quality Gate
```bash
npm run lint && npm run build && npm run typecheck && npm run test
```

## Deployment
```bash
npm run deploy  # npx wrangler deploy -c wrangler.toml
```
