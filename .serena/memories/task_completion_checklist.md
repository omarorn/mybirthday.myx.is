# mybirthday.myx.is — Task Completion Checklist

## Before Committing Any Change
1. ✅ `npm run typecheck` — no new errors (NOTE: only checks src/, not modules/)
2. ⚠️ No test command available
3. ⚠️ No lint command available  
4. ⚠️ No build command available
5. ✅ Manual verification: `npx wrangler dev` → test affected endpoints

## Before Deploying
1. ✅ `npm run typecheck`
2. ✅ Test locally with `npm run dev`
3. ✅ Check KV data won't be lost (in-memory Maps reset on deploy)
4. ✅ `npm run deploy`
5. ✅ Verify: `curl https://mybirthday.myx.is/health`

## Missing (Should Be Added)
- [ ] Extend tsconfig to include modules/
- [ ] Add lint script (eslint or biome)
- [ ] Add test framework (vitest)
- [ ] Add build script
- [ ] Add pre-commit hooks
