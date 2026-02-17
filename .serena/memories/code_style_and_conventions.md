# mybirthday.myx.is — Code Style & Conventions

## Actual Patterns (not aspirational)

### Worker Pattern
- Raw Cloudflare Worker fetch handler (NOT Hono)
- URL pathname routing with if/else chain
- JSON responses via `new Response(JSON.stringify(...))`
- Admin auth via `x-admin-password` header

### Data Pattern
- KV namespace `QUIZ_DATA` for persistence
- In-memory Maps as primary store with KV backup
- Dual-write: write to both Map and KV
- Read: try Map first, fallback to KV

### Frontend Pattern
- Single HTML file with inline CSS and JS
- Vanilla JavaScript (no React, no framework)
- Tab-based navigation (bottom nav)
- CSS custom properties for theming
- Mobile-first with desktop phone-frame wrapper

### TypeScript
- Strict mode enabled
- Interfaces defined inline in worker.ts
- No barrel exports, no module system for frontend

### Naming
- API routes: lowercase with hyphens `/api/quiz/questions`
- Admin routes: `/api/admin/overview`, `/api/quiz/admin/question`
- Variables: camelCase
- Types/Interfaces: PascalCase

### Security
- `safeCompare()` for timing-safe string comparison
- Admin password checked on mutating endpoints
- CORS headers on API responses
