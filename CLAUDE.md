# CLAUDE.md

Repository guidance for coding agents.

## Project Reality

- App: birthday portal for `mybirthday.myx.is`
- Runtime: Cloudflare Workers, raw `fetch` router
- Entry point: `modules/mobile-app-shell/worker.ts`
- Frontend: single SPA in `modules/mobile-app-shell/index.html`
- Data: KV namespace `QUIZ_DATA` plus in-memory maps
- Canonical Wrangler config: `wrangler.toml`

## Current Commands

```bash
npm run dev
npm run build
npm run lint
npm run validate:openapi
npm run typecheck
npm run test
npm run seed:test-user
npm run deploy
```

`build` is a Wrangler dry-run bundle check.

## Security

- Admin-protected routes use `x-admin-password`
- Keep timing-safe comparison for secret checks
- Do not replace with direct string `===` for secrets

## API Groups (modular routes)

Routes live in `modules/mobile-app-shell/routes/*.ts`, dispatched by the slim router in `worker.ts`.

- RSVP (`rsvp.ts`): `/api/rsvp`, `/api/rsvp/stats`
- Quiz (`quiz.ts`): questions, answer, leaderboard/player, admin question CRUD
- Events (`events.ts`): create, clone, public view, owner dashboard
- Hosting (`hosting.ts`): signup, tenant lookup
- Photo wall (`photowall.ts`): list, add, delete
- Planner (`planner.ts`): apply, admin applications list
- Selfie (`selfie.ts`): list, capture, delete
- Karaoke (`karaoke.ts`): songs, song detail, audio stream, upload, transcribe, lyrics, delete
- Admin overview (`admin.ts`): `/api/admin/overview`

## Testing and Quality Gate

- Unit/regression tests: `tests/unit/worker-validation.test.ts`
- E2E smoke tests: `tests/e2e/` (Playwright — `npm run test:e2e`)
- API docs:
  - `docs/api.md` (human readable)
  - `docs/openapi.json` (machine readable)
- Minimum local gate before major merges:

```bash
npm run lint && npm run build && npm run validate:openapi && npm run typecheck && npm run test && npm run test:e2e
```

## Common Errors to Avoid

- Nota alltaf `--remote` flag með `wrangler kv` skipunum þegar unnið er með production gögn
- In-memory Maps í Workers haldast þar til worker er redeployed — redeploy til að hreinsa gögn í minni
- Gakktu úr skugga um að Serena MCP tools séu virk (permissions) áður en þau eru notuð

## Guardrails

- Uppfæra CLAUDE.md reglulega svo hún endurspegli raunverulega arkitektúr og stöðu verkefnisins

## Notes

- `src/index.ts` is scaffold-only and not the Worker entrypoint.
- Some React-based modules under `modules/` are not wired into the live SPA flow.
