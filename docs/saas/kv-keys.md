# KV Key Contract

## Naming
- Prefix by domain: `slug:`, `event:`, `surprise:`, `capsule:`
- Use stable IDs (eventId, slug)
- JSON values only

## Core Keys
- `slug:<slug>` -> `{ "eventId": "..." }`
- `event:<eventId>:links` -> `[{"label":"","url":"","order":0}]`
- `event:<eventId>:schedule` -> `[{"time":"18:00","title":"...","desc":"..."}]`
- `event:<eventId>:settings` -> `{ "themeDefault":"bond", "privacy":"guest_only", "features": {...} }`

## Feature Keys
- `event:<eventId>:secret_timeline` -> `[{"title":"","body":"","order":0}]`
- `event:<eventId>:quiz_meta` -> `{ "enabled": true, "mode": "casual" }`
- `event:<eventId>:photo_meta` -> `{ "enabled": true, "moderation": "host" }`

## Surprise / Planner
- `surprise:<eventId>:<uuid>` -> `{ "type":"surprise_help|host_add", "name":"", "contact":"", "forGuest":"", "note":"", "status":"new|seen|done", "createdAt":"" }`
- `event:<eventId>:surprise_index` -> `["<uuid>","<uuid>"]`

## Memory Mode
- `capsule:<eventId>` -> `{ "unlockDate":"2026-06-20T10:00:00Z", "content": {...} }`
- `event:<eventId>:archive_meta` -> `{ "status":"archived_gift", "publishedAt":"..." }`

## Local-only (not KV)
- `myx-family-theme` (theme choice)
- `myx-gift-wishlist:<slug>` (guest local gift checks)
- easter egg toggles (device-scoped)
