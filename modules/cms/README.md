# CMS Module

Content Management System for managing website sections, images, markdown files, and version history.
Extracted from: **Litla Gamaleigan** (production)

## Features

- Section-based content editing (hero, stats, services, etc.)
- Image/media upload with drag & drop
- Version history with one-click rollback
- Markdown file editor with git-style commits
- Publish/unpublish workflow
- CSRF-protected mutations
- Dark mode support

## Required Wrangler Bindings

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "{{DATABASE_NAME}}"
database_id = "{{DATABASE_ID}}"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "{{BUCKET_NAME}}"

[[kv_namespaces]]
binding = "CONFIG"
id = "{{KV_NAMESPACE_ID}}"
```

## Database Schema

Apply `migrations/001_cms_tables.sql` before use.

## Routes (12 endpoints)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/cms/sections` | List all sections |
| GET | `/api/cms/sections/:key` | Get section by key |
| PUT | `/api/cms/sections/:key` | Update section content |
| GET | `/api/cms/history/:key` | Get version history |
| POST | `/api/cms/rollback/:key` | Rollback to version |
| GET | `/api/cms/images` | List images (filterable) |
| POST | `/api/cms/images` | Upload image |
| DELETE | `/api/cms/images/:key` | Delete image |
| GET | `/api/cms/markdown` | List markdown files |
| GET | `/api/cms/markdown/:path` | Get markdown content |
| PUT | `/api/cms/markdown/:path` | Update markdown |
| GET | `/api/cms/markdown/:path/history` | Markdown history |

## Integration

```typescript
import { cmsRoutes } from './modules/cms/routes/cms';
app.route('/api', cmsRoutes);
```

## Files

| File | Lines | Purpose |
|------|-------|---------|
| `routes/cms.ts` | ~300 | Backend API endpoints |
| `components/ImageUploader.tsx` | ~120 | Drag-drop upload |
| `components/VersionHistory.tsx` | ~100 | Revision viewer |
| `types.ts` | ~60 | TypeScript interfaces |
| `migrations/001_cms_tables.sql` | ~40 | Database schema |

## Line Count: ~620 total
