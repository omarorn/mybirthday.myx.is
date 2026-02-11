# R2 File Manager Module

Full-featured R2 Object Browser with file management UI.
Extracted from: **boklifsins** (production)

## Features

- Grid/list view toggle with localStorage persistence
- Drag & drop file upload with progress bars
- Folder navigation with breadcrumbs
- Search, sort, and filter
- Bulk select & delete
- Media preview (image, video, audio)
- Right-click context menu
- File move/rename operations
- HTTP Range requests for streaming
- Infinite scroll pagination (cursor-based)
- Dark mode support

## Required Wrangler Bindings

```toml
# wrangler.toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "{{BUCKET_NAME}}"
```

## Env Interface Extension

```typescript
interface Env {
  BUCKET: R2Bucket;
  // ... other bindings
}
```

## Routes (10 endpoints)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/files` | List objects with prefix/cursor pagination |
| GET | `/api/files/list` | Enhanced listing with folder detection |
| GET | `/api/files/:key` | Get file with metadata |
| GET | `/api/files/stream/:key` | Stream with HTTP Range support |
| POST | `/api/upload` | Upload file |
| POST | `/api/files/folder` | Create folder |
| POST | `/api/files/move` | Move/rename file |
| POST | `/api/files/bulk-delete` | Bulk delete (max 100) |
| GET | `/api/files/folders` | List folder prefixes |
| DELETE | `/api/files/:key` | Delete file |

## Integration

```typescript
// index.ts
import { fileRoutes } from './modules/r2-file-manager/routes/files';
app.route('/api', fileRoutes);
```

## Files

| File | Lines | Purpose |
|------|-------|---------|
| `routes/files.ts` | ~340 | Backend CRUD endpoints |
| `pages/files.ts` | ~200 | HTML page generation |
| `components/file-manager-js.ts` | ~440 | Client-side state & logic |
| `components/upload-modal.ts` | ~200 | Upload UI & queue |
| `components/file-operations-modal.ts` | ~520 | CRUD modals |
| `components/file-manager-css.ts` | ~820 | Full styling |
| `types.ts` | ~30 | TypeScript interfaces |

## Line Count: ~2,550 total
