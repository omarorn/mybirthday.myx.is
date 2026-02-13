# API Routes + Access Rules

## Auth assumptions
- Guest auth: Google/SMS identity
- Admin auth: `x-admin-password` for current module baseline, migrate to session/JWT

## Public / Landing
- `GET /api/events/:slug/public`
  - Access: Public
  - Returns: event intro, privacy-safe fields, CTA flags

## Event setup (Admin)
- `POST /api/events/create`
  - Access: Admin/Host
  - Body: type, title, honoree, date_time, location, privacy, default_theme
- `PATCH /api/events/:eventId`
  - Access: Admin/Host
- `POST /api/events/:eventId/slug`
  - Access: Admin/Host

## RSVP
- `POST /api/rsvp`
  - Access: Guest/Admin
  - Body: eventId/slug, answer, guests, note
- `GET /api/rsvp/stats?slug=<slug>`
  - Access: Admin/Host

## Guestlist / Invites
- `POST /api/invites/import`
  - Access: Admin/Host
- `GET /api/invites?eventId=<id>`
  - Access: Admin/Host
- `GET /api/guestlist/export.csv?eventId=<id>`
  - Access: Admin/Host

## Quiz
- `GET /api/quiz/questions?slug=<slug>`
  - Access: Guest/Admin
- `POST /api/quiz/answer`
  - Access: Guest/Admin
- `POST /api/quiz/admin/question`
  - Access: Admin
- `DELETE /api/quiz/admin/question?id=<id>`
  - Access: Admin

## Photo wall
- `GET /api/photowall?slug=<slug>`
  - Access: Guest/Admin (or Public if event allows)
- `POST /api/photowall/item`
  - Access: Admin
- `DELETE /api/photowall/item?id=<id>&slug=<slug>`
  - Access: Admin

## Planner / Surprise
- `POST /api/planner/apply`
  - Access: Guest/Admin
  - Body: slug, type(host_add|surprise_help), applicantName, contact, forGuest?, note
- `GET /api/planner/applications?slug=<slug>`
  - Access: Admin

## Dashboard / SaaS loop
- `GET /api/dashboard/me`
  - Access: Authenticated user
  - Returns: events as guest/admin, drafts, templates
- `POST /api/events/:eventId/clone`
  - Access: Guest/Admin
  - Copies: schedule/quiz/theme/settings
  - Excludes: invites/rsvps/private inbox/photos
- `POST /api/templates/create-from-event`
  - Access: Admin/Host
- `GET /api/templates/public`
  - Access: Public (optional)

## RBAC Summary
- Public: intro/public-safe assets only
- Guest: RSVP, quiz play, planner apply, wall read
- Admin/Host: full CRUD, insights, inbox, exports
