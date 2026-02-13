# Task completion checklist

Use this checklist after making changes.

## 1) Scope and correctness
- Confirm changed files are limited to intended scope.
- Validate critical paths manually (especially auth/tenant-sensitive routes).

## 2) Run package-appropriate checks
- If root app code changed:
  - `npm run lint`
  - `npm run type-check`
  - `npm run build` (when build-impacting)
- If `frontend/` changed:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build` (or at minimum ensure type safety during build)
  - Run targeted Playwright tests for impacted area when available.
- If `backend/` changed:
  - `cd backend && npm run lint`
  - `cd backend && npm run build`
  - `cd backend && npm test` (if relevant)
- If `database/` changed:
  - `cd database && npm run build`
  - relevant Prisma/migration command(s) as needed (`db:migrate`, `db:verify`).

## 3) Data and migration safety
- For schema/migration changes, document migration order and local/remote implications.
- Ensure tenant isolation assumptions remain intact for multi-tenant data access.

## 4) Final sanity
- `git status` and `git diff` review for unintended edits.
- Summarize what changed, validation performed, and any remaining risks or follow-ups.