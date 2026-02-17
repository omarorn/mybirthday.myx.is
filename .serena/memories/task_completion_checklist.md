# mybirthday.myx.is — Task Completion Checklist

## Before Committing Any Change
1. ✅ `npm run typecheck` — checks src/ and modules/
2. ✅ `npm run lint` — ESLint flat config
3. ✅ `npm run test` — Vitest unit/regression tests
4. ✅ `npm run build` — Wrangler dry-run bundle check

## Before Deploying
1. ✅ Full quality gate: `npm run lint && npm run build && npm run typecheck && npm run test`
2. ✅ Test locally with `npm run dev`
3. ✅ Check KV data won't be lost (in-memory Maps reset on deploy)
4. ✅ `npm run deploy`
5. ✅ Verify: `curl https://mybirthday.myx.is/health`

## Completed Infrastructure
- [x] Extend tsconfig to include modules/
- [x] Add lint script (ESLint flat config)
- [x] Add test framework (Vitest)
- [x] Add build script (Wrangler dry-run)
- [x] CI pipeline (.github/workflows/ci.yml)

## Important Notes
- Use `--remote` flag with `wrangler kv` for production data
- In-memory Maps reset on deploy — redeploy clears runtime data
- Canonical config: `wrangler.toml` (not jsonc)
