# Code style and conventions

## Baseline conventions observed
- Language: TypeScript-heavy across apps/services.
- Indentation: spaces, 2 spaces (root `.editorconfig`).
- Path aliases: `@/*` is commonly used (root/frontend tsconfig).
- Frontend linting: `frontend/.eslintrc.json` extends `next/core-web-vitals` and `next/typescript`.
- Root checking: Astro checks via `npm run lint` (`astro check`).

## Frontend patterns (`frontend/src`)
- App Router structure under `src/app/**`.
- Route handlers in `src/app/api/**/route.ts`, exporting HTTP functions (`GET`, `POST`, etc.).
- Utilities in `src/lib/**`, reusable UI in `src/components/**`, hooks in `src/hooks/**`.
- Tailwind utility classes are used extensively in TSX.
- Typical naming:
  - Components/pages: PascalCase function names for React components.
  - Hooks: `use-*` filenames and camelCase exported hook names.
  - API/data fields often use snake_case when matching DB/Supabase fields.

## Backend patterns (`backend/`)
- Express + TypeScript.
- ESLint + Prettier scripts exist and should be used when changing backend code.

## Practical guidance
- Prefer strict TypeScript-compatible changes (frontend has `strict: true`).
- Keep 2-space indentation and existing quote style per file (there is some mixed quoting; preserve local style).
- When touching frontend API routes, follow existing `NextRequest`/`NextResponse` handler shape and explicit error status returns.
- Run relevant lint/type checks in the package you changed before finishing.