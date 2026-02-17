# mybirthday.myx.is — Project Overview

## What This Is
A mobile-first party planner and RSVP hub for Omar's 50th birthday (June 19, 2026).
Single Cloudflare Worker serving a complete SPA from one HTML file.

## Tech Stack (ACTUAL — not what CLAUDE.md claims)
- **Runtime:** Cloudflare Workers (raw fetch handler, NO Hono)
- **Persistence:** KV namespace (QUIZ_DATA) + in-memory Maps
- **Frontend:** Single HTML file with inline CSS + vanilla JS (NO React, NO framework)
- **Language:** TypeScript (worker), JavaScript (frontend)
- **Database:** NO D1 — KV only
- **Storage:** NO R2 connected
- **Tests:** NONE
- **Build:** Wrangler bundles directly, no build step

## Key Files
- `modules/mobile-app-shell/worker.ts` (1063 lines) — THE main worker with all API routes
- `modules/mobile-app-shell/index.html` (1611 lines) — Full SPA with inline CSS/JS
- `modules/mobile-app-shell/quizData.ts` (494 lines) — 30 quiz questions about Omar
- `src/index.ts` (27 lines) — BARE SCAFFOLD, not the actual entry point
- `wrangler.toml` — Points to modules/mobile-app-shell/worker.ts

## Entry Point
`wrangler.toml` → `main = "modules/mobile-app-shell/worker.ts"`
NOT `src/index.ts` (that's just a scaffold)

## API Endpoints (worker.ts)
- RSVP: POST/GET /api/rsvp, /api/rsvp/stats
- Quiz: GET /api/quiz/questions, POST /api/quiz/answer, admin CRUD
- Events: POST /api/events/create, clone, GET public
- Photo Wall: GET/POST/DELETE /api/photowall
- Planner: POST /api/planner/apply, GET applications
- Hosting: POST /api/hosting/signup, GET tenant
- Admin: GET /api/admin/overview

## Auth Pattern
- Admin: `x-admin-password` header with timing-safe comparison
- Users: Prompt-based "login" (stores contact info, not real auth)

## Themes (4)
Bond (gold/dark), Death Becomes Her (purple/cyan), Pink Panther (pink), 80s Retro (cyan/purple)

## Orphaned Modules (React, NOT integrated)
- modules/quiz-game/ — React quiz component
- modules/cms/ — React CMS editor
- modules/r2-file-manager/ — React R2 browser
- modules/camera-scanner/ — React camera component
- modules/driver-location/ — React GPS tracking
Total: ~4700 lines of unused React code

## Known Issues (as of 2026-02-16)
1. CLAUDE.md is massively oversized and describes features that don't exist
2. tsconfig.json only includes src/ (not modules/ where real code lives)
3. No tests, no build script, no lint
4. No D1 database despite CLAUDE.md claiming it
5. Serena memories were from wrong project (fixed 2026-02-16)
