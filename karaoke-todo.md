# Karaoke System Deep Plan (Plugin-Informed)

Date: 2026-02-17  
Scope: `mybirthday.myx.is` karaoke hardening + realtime upgrade + parity rollout to `1976.eyjar.app`

## 1. Current State Snapshot

### Backend
- Route handler: `modules/mobile-app-shell/routes/karaoke.ts`
- API surface exists:
  - `GET /api/karaoke/songs`
  - `GET /api/karaoke/song`
  - `GET /api/karaoke/audio`
  - `POST /api/karaoke/upload`
  - `POST /api/karaoke/transcribe`
  - `POST /api/karaoke/lyrics`
  - `DELETE /api/karaoke/song`
- Storage model:
  - Song metadata in D1 (`karaoke_songs`)
  - Audio blobs in R2 (`MEDIA_BUCKET`)
- AI model currently used for transcription in our code: `@cf/openai/whisper-large-v3-turbo`
- Preset song support added (`Hann á afmæli í dag`) with lyrics + chords + `preset` guard.

### Frontend
- UI host file: `modules/mobile-app-shell/index.html`
- Karaoke panel has:
  - Upload flow
  - Song list
  - Player + fullscreen
  - Word highlighting when timed words exist
  - Chord panel support (`data-karaoke-chords`, `data-karaoke-fs-chords`)
- Non-audio presets are supported (play button disabled when `hasAudio=false`).

### External references (plugins / research)
- `craigsdennis/careless-whisper-workers-ai` shows a clean Workers AI Whisper pattern:
  - model: `@cf/openai/whisper-large-v3-turbo`
  - inputs: `audio`, `initial_prompt`, `prefix`
  - useful outputs: `text`, `vtt`
- Mentioned `talk to the hand` realtime approach was **not found in this repo** and must be sourced from another repo before direct reuse.

---

## 2. Gaps and Risks

- No true low-latency realtime karaoke ingest path (current flow is upload/transcribe/playback).
- VTT is generated in backend but not rendered as `<track>` metadata in player yet.
- Audio is stored as base64 in KV; this does not scale for larger catalogs.
- Limited automated tests for karaoke route correctness and edge cases.
- No explicit rate limits/quotas per user for costly AI transcriptions.
- Cross-app parity (`1976.eyjar.app`) is still TODO, not operational.

---

## 3. Target Architecture

### Short-term target (stabilize current design)
- Keep current API contracts.
- Improve reliability, validation, and test coverage.
- Move heavy media to R2 where possible while keeping metadata in KV/D1.

### Mid-term target (realtime mode)
- Add optional realtime transcription mode:
  - Browser microphone chunks over WebSocket or WebRTC data channel.
  - Server-side streaming ASR pipeline.
  - Live line/chord progression updates in player view.
- Keep upload mode as fallback.

### Long-term target (multi-tenant karaoke engine)
- Shared karaoke module used by both:
  - `mybirthday.myx.is`
  - `1976.eyjar.app`
- Tenant-specific preset library and themes.

---

## 4. Execution Plan

## Phase A: Stabilize and Refactor (1-2 days)
- [x] Extract karaoke frontend logic from `index.html` into a dedicated module file.
- [x] Keep UI selectors stable, but isolate transport/storage logic from rendering logic.
- [ ] Add strict response shape guards on all karaoke fetch calls.
- [ ] Add server-side validation for `title`, `addedBy`, `audioBase64`, and `lyrics` payload lengths.
- [ ] Ensure preset songs are never persisted redundantly and cannot be deleted.

Acceptance:
- No behavior regressions in upload/playback/preset flow.
- Cleaner separation of concerns in karaoke UI code.

## Phase B: Data Model Upgrade (1-2 days)
- [ ] Define canonical karaoke schema (KV or D1 + R2 hybrid):
  - metadata record (id, slug, title, status, createdAt, addedBy, preset)
  - transcription record (text, timed words, vtt)
  - media key in R2
- [ ] Migrate new uploads from KV base64 storage to R2 object storage.
- [ ] Keep compatibility read path for existing KV-base64 songs.

Acceptance:
- New uploads do not bloat KV.
- Existing songs continue to play.

## Phase C: ASR Quality and Timing (1 day)
- [ ] Add configurable `initial_prompt` and `prefix` by language/event type.
- [ ] Improve word timing fallback strategy when model returns text-only.
- [ ] Normalize punctuation/tokenization before rendering karaoke words.
- [ ] Expose both `transcription` and `vtt` from API and persist both.

Acceptance:
- Better Icelandic transcript quality on noisy party clips.
- Stable lyric highlighting without jitter.

## Phase D: Realtime Mode (3-5 days)
- [ ] Design `realtime` API endpoints/protocol:
  - session create
  - chunk ingest
  - incremental transcript events
  - session finalize
- [ ] Implement browser mic stream capture path.
- [ ] Add live subtitle overlay in karaoke view.
- [ ] Add graceful fallback to upload mode if realtime channel drops.

Acceptance:
- Realtime transcript latency target: p95 < 1.5s.
- No crash when stream disconnects.

## Phase E: Security, Cost, and Ops (1 day)
- [ ] Add auth gating for expensive endpoints (`upload`, `transcribe`, realtime ingest).
- [ ] Add rate limits and size caps per user/session.
- [ ] Add observability metrics:
  - transcribe success/fail
  - avg ASR duration
  - upload size distribution
  - realtime latency
- [ ] Add admin diagnostics for karaoke queue health.

Acceptance:
- Predictable ASR cost profile.
- Useful debug telemetry in production.

## Phase F: Cross-App Rollout (`1976.eyjar.app`) (1-2 days)
- [ ] Create shared karaoke package or copy with strict parity checklist.
- [ ] Port API routes and frontend karaoke widgets.
- [ ] Configure environment bindings (KV/R2/AI) on `1976.eyjar.app`.
- [ ] Seed starter songs (including `Hann á afmæli í dag` variant if desired).
- [ ] Smoke test parity:
  - upload
  - transcribe
  - playback
  - chords
  - preset guard behavior

Acceptance:
- `1976.eyjar.app` has same karaoke baseline behavior as `mybirthday.myx.is`.

---

## 5. Test Plan

### Unit
- [x] `routes/karaoke.ts` request validation tests.
- [x] Preset merge behavior tests.
- [x] Transcribe success/fail transitions.
- [x] Delete constraints (preset cannot be deleted).

### Integration
- [x] Upload + transcribe + lyrics update roundtrip.
- [x] Audio fetch fallback paths.
- [x] Song list includes `hasAudio` correctness.

### E2E
- [ ] UI upload and play flow.
- [ ] Preset song opens and shows chords.
- [ ] Fullscreen mode parity.

---

## 6. Deployment Checklist

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run build`
- [ ] `npm run deploy`
- [ ] Post-deploy smoke test on custom domain
- [ ] Update `TODO.md` and release notes

---

## 7. Immediate Next 3 Tasks

- [x] Extracted `initKaraokeModule` from `index.html` into separate source file (`modules/mobile-app-shell/karaoke-module-source.ts`) and inject via worker.
- [x] Add karaoke unit tests under `tests/unit` for current backend route behavior.
- [x] Wire VTT to frontend `<audio><track>` path and ensure highlight sync prefers VTT timings when present.
- [ ] Start migration path for new uploads to R2 while preserving read compatibility for existing KV-base64 songs.
