# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

**Project:** It's My Birthday - Party planner and RSVP hub for Omar's 50th birthday
**Owner:** Omar (omar@vertis.is)
**Repository:** github.com/2076/mybirthday.myx.is
**Production:** https://mybirthday.myx.is
**Event Date:** June 19, 2026

---

## Quick Reference

```
Production:     https://mybirthday.myx.is
Local Dev:      http://localhost:8787
Worker Name:    mybirthday-myx-is
KV Namespace:   QUIZ_DATA (3ab11a174e29413484c758a94ba60faa)
Account:        2076
```

### Commands (all that exist)
```bash
npm run dev          # Local dev server (wrangler dev)
npm run deploy       # Deploy to Cloudflare Workers
npm run typecheck    # TypeScript check (currently only covers src/)
```

### Secrets
```bash
echo "KEY" | npx wrangler secret put ADMIN_PASSWORD
```

---

## Tech Stack (Actual)

- **Runtime:** Cloudflare Workers — raw fetch handler (no framework)
- **Persistence:** KV namespace (`QUIZ_DATA`) + in-memory Maps
- **Frontend:** Single HTML file with inline CSS + vanilla JavaScript
- **Language:** TypeScript (worker), JavaScript (frontend inline)
- **Deployment:** `npx wrangler deploy` (direct, no build step)

**NOT used** (despite previous CLAUDE.md claims): Hono, D1, R2, Vitest, Playwright, Husky, Tailwind, React, Astro

---

## Entry Point

**IMPORTANT:** The actual worker entry point is NOT `src/index.ts`.

```
wrangler.toml → main = "modules/mobile-app-shell/worker.ts"
```

| File | Lines | Purpose |
|------|-------|---------|
| `modules/mobile-app-shell/worker.ts` | ~1063 | **THE main worker** — all API routes |
| `modules/mobile-app-shell/index.html` | ~1611 | **THE frontend** — full SPA with inline CSS/JS |
| `modules/mobile-app-shell/quizData.ts` | ~494 | 30 quiz questions about Omar |
| `src/index.ts` | ~27 | Bare scaffold (NOT the entry point) |

---

## Repository Structure

```
mybirthday.myx.is/
├── modules/
│   └── mobile-app-shell/      # ← THE ACTUAL APP
│       ├── worker.ts           # Main Cloudflare Worker (all API routes)
│       ├── index.html          # Full SPA (inline CSS + JS)
│       └── quizData.ts         # 30 quiz questions
├── modules/                    # Orphaned React modules (NOT integrated)
│   ├── quiz-game/              # React quiz (reference only)
│   ├── cms/                    # React CMS editor (reference only)
│   ├── r2-file-manager/        # React R2 browser (reference only)
│   ├── camera-scanner/         # React camera (reference only)
│   └── driver-location/        # React GPS tracking (reference only)
├── src/
│   └── index.ts                # Bare scaffold (NOT used by wrangler)
├── .claude/                    # Claude Code config, rules, commands
├── wrangler.toml               # Worker config
├── TODO.md                     # Prioritized roadmap
├── completed-tasks.md          # Task history
└── CLAUDE.md                   # This file
```

**Note:** The modules in `modules/quiz-game/`, `modules/cms/`, etc. are React (TSX) components that are NOT connected to the vanilla JS app. They exist as reference for potential future React migration (~4700 lines total).

---

## API Endpoints (worker.ts)

### RSVP
- `POST /api/rsvp` — Submit RSVP (name, email, partySize, dietary, notes)
- `GET /api/rsvp/stats` — RSVP statistics

### Quiz
- `GET /api/quiz/questions` — All questions (base 30 + admin-added)
- `GET /api/quiz/question?id=X` — Single question
- `POST /api/quiz/answer` — Submit answer (tracks stats per question)
- `POST /api/quiz/admin/question` — Admin: add custom question
- `DELETE /api/quiz/admin/question` — Admin: delete custom question

### Events
- `POST /api/events/create` — Create event (requires owner auth)
- `POST /api/events/:id/clone` — Clone event
- `GET /api/events/:slug/public` — Public event view
- `GET /api/dashboard/me` — Owner's dashboard

### Photo Wall
- `GET /api/photowall` — List photos
- `POST /api/photowall/item` — Admin: add photo
- `DELETE /api/photowall/item` — Admin: delete photo

### Planner
- `POST /api/planner/apply` — Submit planner application
- `GET /api/planner/applications` — Admin: view applications

### Hosting
- `POST /api/hosting/signup` — Create tenant party page
- `GET /api/hosting/tenant` — Get tenant config

### Admin
- `GET /api/admin/overview` — Full admin dashboard data

---

## Architecture Patterns

### Data Persistence (Dual-Write)
```typescript
// Write to both in-memory Map and KV
rsvps.set(id, record);
await env.QUIZ_DATA.put(`rsvp:${id}`, JSON.stringify(record));
```
In-memory Maps are primary store; KV is persistent backup. Maps reset on worker restart/deploy.

### Admin Authentication
```typescript
// Admin endpoints check x-admin-password header
function isAdmin(request: Request, env: Env): boolean {
  const pw = request.headers.get('x-admin-password') || '';
  return safeCompare(pw, env.ADMIN_PASSWORD);  // timing-safe
}
```

### API Response Format
```typescript
// Success
return new Response(JSON.stringify({ success: true, ...data }), {
  headers: { 'Content-Type': 'application/json', ...corsHeaders }
});

// Error
return new Response(JSON.stringify({ error: 'message' }), {
  status: 400,
  headers: { 'Content-Type': 'application/json', ...corsHeaders }
});
```

### Frontend (index.html)
- Single-page app with tab-based navigation (6 tabs)
- CSS custom properties for 4 themes (Bond, Death Becomes Her, Pink Panther, 80s Retro)
- Mobile-first with desktop phone-frame wrapper
- All UI text in Icelandic

---

## Security

### Timing-Safe Comparison (CRITICAL)
The worker uses `safeCompare()` for admin password verification. Never use `===` for secrets.

### Workers Constraints
- No filesystem access
- 128MB memory limit
- 30s CPU time limit
- Web APIs only (no Node.js built-ins)

---

## Known Issues (as of 2026-02-16)

1. **tsconfig.json only includes `src/`** — worker.ts in modules/ is NOT type-checked
2. **No tests exist** — zero test files, no test framework installed
3. **No build/lint scripts** — only `dev`, `deploy`, `typecheck` exist
4. **In-memory data lost on deploy** — Maps reset when worker restarts
5. **No real user auth** — only admin password via header
6. **Orphaned React modules** — ~4700 lines not integrated with vanilla JS app

---

## Icelandic Language

- ALL UI text in Icelandic
- Support characters: á, ð, é, í, ó, ú, ý, þ, æ, ö
- Escape Icelandic chars in inline JS event handlers

---

## Task Management

### Honest Status Assessment
| Status | Meaning |
|--------|---------|
| COMPLETE ✅ | 100% done, tested, verified |
| WORKING 🟢 | Core functionality works |
| PARTIAL 🟡 | Some features working |
| STARTED 🟠 | Code exists but incomplete |
| NOT STARTED ⚠️ | No implementation yet |

### Session Continuity
1. Check `TODO.md` for priorities
2. Check `completed-tasks.md` for history
3. Continue from last known state

---

## Deployment

```bash
# Deploy
npm run deploy

# Verify
curl https://mybirthday.myx.is/health

# View logs
npx wrangler tail
```

### Before Deploying
- [ ] Test locally with `npm run dev`
- [ ] Check that KV data won't be needed from in-memory Maps
- [ ] `npm run deploy`
- [ ] Verify health endpoint

---

## Commands (`.claude/commands/`)

| Command | Purpose |
|---------|---------|
| `/todo-oom` | Multi-agent task delegation from TODO.md |
| `/fix-oom` | Feature testing, document issues in TODO.md |
| `/oom-reflect` | Deep reflection — honest status audit |
| `/document-agent` | Document deliverables with Serena verification |
| `/create-e2e-test` | Scaffold E2E test infrastructure |

---

## Guardrails

- Confirm before executing write operations to KV
- Never use `===` for password/secret comparison
- Always verify Serena memories match this project before relying on them
- The entry point is `modules/mobile-app-shell/worker.ts`, NOT `src/index.ts`

---

## 2076 ehf Ecosystem

**Domains:** myx.is, eyjar.app (demo/staging)
**Related:** omar.eyar.app, Bók Lífsins

---

**This file is the single source of truth for Claude Code agents working in this repository.**
**Last Updated:** 2026-02-16
