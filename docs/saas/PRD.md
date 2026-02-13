# myx Party SaaS PRD

## Goal
Build a multi-tenant party portal family where each event is a mini-app under a slug (`/e/<slug>`), with guest flows, host/admin control, and reusable templates.

## Product Pillars
- Multi-tenant: tenant -> events -> slugs
- Role-based access: public, guest, host/admin
- Reusable event templates and event cloning
- Event-first UX with optional hidden/fun features
- App can become the gift (post-event memory mode)

## Personas
- Host/Admin: creates and operates event portal
- Guest: RSVP, play quiz, view media/schedule
- Planner/Surprise helper: submits surprise/planner ideas
- Honoree: optional restricted visibility for surprise mode

## Core Views
- Public: `/e/<slug>` (intro + CTA)
- Guest: RSVP + plan + fun + media
- Guestlist/Admin: RSVP status, metrics, reminders, exports
- Host/Admin: event setup, quiz editor, wall moderation, surprise inbox
- Dashboard: `/dashboard` for user's events, templates, drafts

## Event Lifecycle
1. Onboard admin and create event
2. Configure content (schedule/links/quiz/photo wall/privacy)
3. Share slug and invite list
4. Live mode on event day
5. Archive/memory mode post-event

## Privacy Modes
- `public`: landing view visible without login
- `guest_only`: content behind login
- `surprise_lock`: selected content hidden until unlock

## Permissions Matrix
| Capability | Public | Guest | Admin |
|---|---:|---:|---:|
| View intro | ✅ | ✅ | ✅ |
| RSVP | ❌ | ✅ | ✅ |
| Play quiz | Optional | ✅ | ✅ |
| Edit quiz | ❌ | ❌ | ✅ |
| Submit surprise/planner form | Optional | ✅ | ✅ |
| View surprise inbox | ❌ | ❌ | ✅ |
| Upload/delete wall media | ❌ | Optional | ✅ |
| Clone event | ❌ | ✅ | ✅ |

## SaaS Loop (Growth)
- Guest attends event -> sees "Clone this party" CTA -> creates own event
- Copy schedule/theme/quiz template but not guestlist/RSVP/private inbox

## Non-Goals (Phase 1)
- Payment/subscription engine
- Full campaign automation (SMS/email blasts)
- Marketplace ranking algorithm
