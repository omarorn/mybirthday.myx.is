# D1 Database Migration Design

**Date:** 2026-02-17
**Status:** Approved
**Approach:** Big Bang — all in-memory Maps migrated to D1 in one pass

## Context

The birthday portal stores all data in in-memory JavaScript Maps (`state.ts`). Data is lost on every Worker restart/deploy. This migration moves all persistent data to Cloudflare D1 (SQLite) and media files to R2.

## Current State

- 12+ Maps in `state.ts` holding RSVP, quiz, events, photos, selfies, karaoke, etc.
- Data lost on every deploy
- KV (`QUIZ_DATA`) used for quiz question caching
- No persistent storage for any feature

## Target Architecture

```
Browser → Worker (slim router)
              ↓
         Route handlers
         ↓          ↓
    D1 (data)   R2 (media)
         ↓
    KV (cache, quiz data)
```

## New Infrastructure

### D1 Database: `its_my_birthday_db`

Binding: `DB` (type: `D1Database`)

### R2 Bucket: `its-my-birthday-media`

Binding: `MEDIA_BUCKET` (type: `R2Bucket`)

Purpose: selfie images + karaoke audio files

### KV Namespace: `QUIZ_DATA` (existing)

Kept for quiz question caching (read-heavy, write-rare).

## D1 Schema (10 tables)

### 1. `rsvp` (from `memoryStore`)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| slug | TEXT NOT NULL | event slug |
| name | TEXT NOT NULL | guest name |
| contact | TEXT NOT NULL | phone/email |
| method | TEXT NOT NULL | 'sms' or 'google' |
| attending | INTEGER | 0 or 1 |
| party_size | INTEGER | default 1 |
| plus_one | TEXT | nullable |
| dietary | TEXT | nullable |
| note | TEXT | nullable |
| updated_at | TEXT NOT NULL | ISO datetime |

Index: `idx_rsvp_slug(slug)`

### 2. `quiz_questions` (from `memoryCustomQuestions`)

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| slug | TEXT NOT NULL | |
| question | TEXT NOT NULL | |
| options | TEXT NOT NULL | JSON array |
| answer | INTEGER NOT NULL | correct index |
| category | TEXT | nullable |
| created_at | TEXT NOT NULL | |

### 3. `quiz_answers` (from `memoryRecentAnswers`)

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK AI | auto-increment |
| slug | TEXT NOT NULL | |
| player_id | TEXT NOT NULL | |
| player_name | TEXT NOT NULL | |
| question_id | INTEGER NOT NULL | |
| choice | INTEGER NOT NULL | |
| correct | INTEGER NOT NULL | 0 or 1 |
| created_at | TEXT NOT NULL | |

Index: `idx_quiz_answers_slug(slug)`

**Note:** `quiz_summary` is computed from `quiz_answers` via `COUNT/SUM` — no dedicated table needed.

### 4. `player_stats` (from `memoryPlayerStats`)

| Column | Type | Notes |
|--------|------|-------|
| player_id | TEXT | composite PK |
| slug | TEXT | composite PK |
| player_name | TEXT NOT NULL | |
| total_points | INTEGER | default 0 |
| current_streak | INTEGER | default 0 |
| best_streak | INTEGER | default 0 |
| total_answers | INTEGER | default 0 |
| total_correct | INTEGER | default 0 |
| last_answer_date | TEXT | nullable |

### 5. `events` (from `memoryEvents` + slug/owner indexes)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| owner_id | TEXT NOT NULL | |
| slug | TEXT NOT NULL | |
| title | TEXT NOT NULL | |
| description | TEXT | nullable |
| start_time | TEXT NOT NULL | ISO datetime |
| end_time | TEXT | nullable |
| timezone | TEXT | default 'Atlantic/Reykjavik' |
| published | INTEGER | default 0 |
| metadata | TEXT | JSON object |
| created_at | TEXT NOT NULL | |
| updated_at | TEXT NOT NULL | |

Indexes: `idx_events_slug(slug)`, `idx_events_owner(owner_id)`

### 6. `tenants` (from `memoryTenants`)

| Column | Type | Notes |
|--------|------|-------|
| slug | TEXT PK | |
| title | TEXT NOT NULL | |
| hashtag | TEXT NOT NULL | |
| instagram_handle | TEXT | nullable |
| owner | TEXT | nullable |
| created_at | TEXT NOT NULL | |

### 7. `photos` (from `memoryPhotoWall`)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| slug | TEXT NOT NULL | |
| image_url | TEXT NOT NULL | |
| caption | TEXT | nullable |
| source_url | TEXT | nullable |
| added_at | TEXT NOT NULL | |

Index: `idx_photos_slug(slug)`

### 8. `planner_applications` (from `memoryPlannerApplications`)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| slug | TEXT NOT NULL | |
| type | TEXT NOT NULL | 'host_add' or 'surprise_help' |
| applicant_name | TEXT NOT NULL | |
| contact | TEXT NOT NULL | |
| for_guest | TEXT | nullable |
| note | TEXT NOT NULL | |
| created_at | TEXT NOT NULL | |

Index: `idx_planner_slug(slug)`

### 9. `selfies` (from `memorySelfies`, images in R2)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| slug | TEXT NOT NULL | |
| image_key | TEXT NOT NULL | R2 object key |
| caption | TEXT | nullable |
| submitted_by | TEXT NOT NULL | |
| taken_at | TEXT NOT NULL | |

Index: `idx_selfies_slug(slug)`

### 10. `karaoke_songs` (from `memoryKaraokeSongs`, audio in R2)

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| slug | TEXT NOT NULL | |
| title | TEXT NOT NULL | |
| artist | TEXT | nullable |
| audio_key | TEXT NOT NULL | R2 object key |
| lyrics | TEXT | JSON array of TranscriptSegment |
| manual_lyrics | TEXT | nullable |
| duration | REAL | nullable |
| added_by | TEXT NOT NULL | |
| status | TEXT | default 'uploaded' |
| created_at | TEXT NOT NULL | |

Index: `idx_karaoke_slug(slug)`

## R2 Key Structure

```
selfies/{slug}/{id}.jpg
karaoke/{slug}/{id}.{ext}
```

## Media Serving

New route in `worker.ts`:

```
GET /media/{key...} → env.MEDIA_BUCKET.get(key) → Response
```

With proper Content-Type headers and cache control.

## Route Changes Summary

Every route module changes from Map operations to D1 prepared statements:

| Route | Map → D1 table(s) |
|-------|-------------------|
| rsvp.ts | memoryStore → rsvp |
| quiz.ts | memoryCustomQuestions, PlayerStats, RecentAnswers → quiz_questions, quiz_answers, player_stats |
| events.ts | memoryEvents, EventSlugIndex, OwnerEventIds → events |
| photowall.ts | memoryPhotoWall → photos |
| planner.ts | memoryPlannerApplications → planner_applications |
| hosting.ts | memoryTenants → tenants |
| selfie.ts | memorySelfies → selfies + R2 |
| karaoke.ts | memoryKaraokeSongs, KaraokeAudio → karaoke_songs + R2 |
| admin.ts | reads from all above tables |

## Files Deleted

- `modules/mobile-app-shell/state.ts` — all Maps removed

## Files Modified

- `wrangler.toml` — add D1 + R2 bindings
- `modules/mobile-app-shell/types.ts` — update Env interface
- `modules/mobile-app-shell/worker.ts` — add /media/* route
- All 9 route files in `modules/mobile-app-shell/routes/`

## Files Created

- `migrations/0001_initial_schema.sql`
- `docs/plans/2026-02-17-d1-migration-design.md` (this file)

## Migration Workflow

1. Create D1 database + R2 bucket via wrangler CLI
2. Write migration SQL: `migrations/0001_initial_schema.sql`
3. Apply migration locally, then to remote
4. Update `wrangler.toml` with bindings
5. Update `Env` interface in `types.ts`
6. Rewrite all 9 route modules
7. Add `/media/*` route to `worker.ts`
8. Delete `state.ts`
9. Quality gate: typecheck + test + build
10. Deploy

## Verification

- All existing unit tests pass (may need updates for D1 mocks)
- E2E tests pass against running worker with D1
- Manual verification of RSVP, quiz, events, selfie, karaoke
- Data persists across worker restarts
