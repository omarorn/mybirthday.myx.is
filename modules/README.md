# Reusable Modules

Drop-in feature modules extracted from production 2076 ehf projects.
Each module is self-contained with routes, components, types, and integration docs.

## Available Modules

| Module | Source Project | Description | Complexity | Status |
|--------|---------------|-------------|------------|--------|
| `r2-file-manager/` | boklifsins | R2 Object Browser with grid/list view, drag-drop upload, media preview | Medium | Complete |
| `cms/` | Litla Gamaleigan | CMS for sections, images, markdown, version history | Medium | Complete |
| `camera-scanner/` | rusl.myx.is | Camera capture, AI classification, motion detection | High | Complete |
| `quiz-game/` | rusl.myx.is | Multi-mode quiz game with leaderboards, streaks, gamification | Medium | Complete |
| `driver-location/` | Litla Gamaleigan | GPS tracking, route optimization, job management, signature capture | High | Complete |
| `mobile-app-shell/` | omar.eyar.app | Mobile-first dark theme with desktop phone mockup, KPI widgets | Low | Complete |

## How to Use

1. **Copy module** into your project's `src/` directory
2. **Add wrangler bindings** listed in each module's README
3. **Register routes** in your main `index.ts` router
4. **Apply migrations** if the module has a `migrations/` folder
5. **Import components** into your pages

## Module Structure

```
modules/module-name/
  README.md              # Setup, bindings, integration guide
  routes/                # Hono API route handlers
  components/            # Frontend UI (HTML generators or React)
  types.ts               # TypeScript interfaces
  migrations/            # D1 SQL migrations (if needed)
  hooks/                 # React hooks (if applicable)
  services/              # Business logic services
  utils/                 # Helper utilities
```

## Conventions

- All modules use `{{PLACEHOLDER}}` for project-specific values
- Routes follow Hono pattern: `app.get('/api/...', handler)`
- Components use Tailwind CSS with dark mode support
- Database operations use D1 parameterized queries
- All modules support `Env` interface extension
