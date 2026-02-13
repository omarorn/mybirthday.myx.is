# Suggested Commands
## Setup
- `npm install`
- `npm run cf-typegen`
- `npm run build:css`

## Local development
- `npm run dev`
- `npm run dev:pages`

## Quality checks
- `npm run typecheck`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`

## Tests
- `npm run test`
- `npm run test:watch`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:coverage`
- `npm run test:e2e`

## Build and deploy
- `npm run build`
- `npm run build:worker`
- `npm run deploy`
- `npm run deploy:pages`

## Cloudflare data operations (placeholders must be replaced)
- `npm run db:migrate:local -- --file=migrations/<name>.sql`
- `npm run db:migrate:remote -- --file=migrations/<name>.sql`
- `npm run db:query:local -- --command="SELECT 1"`
- `npm run db:query:remote -- --command="SELECT 1"`
- `npm run db:backup`
