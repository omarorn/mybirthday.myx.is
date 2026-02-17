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
npm run typecheck
npm run test
npm run deploy
```

`build` is a Wrangler dry-run bundle check.

## Security

- Admin-protected routes use `x-admin-password`
- Keep timing-safe comparison for secret checks
- Do not replace with direct string `===` for secrets

## API Groups in `worker.ts`

- RSVP: `/api/rsvp`, `/api/rsvp/stats`
- Quiz: questions, answer, leaderboard/player, admin question CRUD
- Events: create, clone, public view, owner dashboard
- Hosting: signup, tenant lookup
- Photo wall: list, add, delete
- Planner: apply, admin applications list
- Selfie: list, capture, delete
- Karaoke: songs, song detail, audio stream, upload, transcribe, lyrics, delete
- Admin overview: `/api/admin/overview`

## Testing and Quality Gate

- Unit/regression tests: `tests/unit/worker-validation.test.ts`
- API docs:
  - `docs/api.md` (human readable)
  - `docs/openapi.json` (machine readable)
- Minimum local gate before major merges:

```bash
npm run lint && npm run build && npm run typecheck && npm run test
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
