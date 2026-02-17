# mybirthday.myx.is — Useful Commands

## Development
```bash
npm run dev          # Start local dev server (wrangler dev)
npm run deploy       # Deploy to Cloudflare Workers
npm run typecheck    # TypeScript check (only src/, NOT modules/)
```

## Wrangler
```bash
npx wrangler dev                              # Local dev
npx wrangler deploy                           # Deploy worker
npx wrangler kv key list --binding=QUIZ_DATA  # List KV keys
npx wrangler kv key get --binding=QUIZ_DATA "key"  # Get KV value
npx wrangler tail                             # View live logs
```

## Important Notes
- NO `npm run build` script exists
- NO `npm run test` script exists
- NO `npm run lint` script exists
- Entry point is modules/mobile-app-shell/worker.ts (NOT src/index.ts)
- tsconfig only covers src/ — modules/ TypeScript is NOT checked
