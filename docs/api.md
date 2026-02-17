# API Reference

Last updated: 2026-02-17

Base URL (prod): `https://mybirthday.myx.is`

Machine-readable spec: `docs/openapi.json`

## Conventions

- JSON endpoints expect `Content-Type: application/json` for `POST`.
- Standard error format:

```json
{ "error": "message" }
```

- Admin routes require header:

```http
x-admin-password: <ADMIN_PASSWORD>
```

- Owner-scoped event routes use:

```http
x-owner-id: <owner-id>
```

## RSVP

### `POST /api/rsvp`

Request:

```json
{
  "method": "sms",
  "contact": "5551234",
  "name": "Guest Name",
  "attending": true,
  "partySize": 2,
  "plusOne": "",
  "dietary": "",
  "note": ""
}
```

Success: `200`

```json
{
  "success": true,
  "record": {
    "id": "sms:5551234",
    "name": "Guest Name",
    "contact": "5551234",
    "method": "sms",
    "attending": true,
    "partySize": 2,
    "updatedAt": "2026-02-17T00:00:00.000Z"
  }
}
```

### `GET /api/rsvp/stats`

Success: `200`

```json
{
  "total": 12,
  "attendingYes": 9,
  "attendingNo": 3
}
```

## Quiz

### `GET /api/quiz/questions`

Success: `200`

```json
{
  "total": 30,
  "questions": [{ "id": 1, "q": "..." }]
}
```

### `GET /api/quiz/question?id=<id>`

Success: `200` (answer index is removed)

```json
{ "question": { "id": 1, "q": "...", "opts": ["A", "B"] } }
```

### `POST /api/quiz/answer`

Request:

```json
{
  "id": 1,
  "choice": 0,
  "playerId": "anon",
  "playerName": "Guest"
}
```

Success: `200`

```json
{
  "id": 1,
  "correct": true,
  "correctIndex": 0,
  "explanation": "...",
  "funFact": "...",
  "gamification": {
    "pointsEarned": 12,
    "basePoints": 10,
    "streakBonus": 2,
    "currentStreak": 1,
    "bestStreak": 1,
    "totalPoints": 12,
    "streakReset": false
  }
}
```

### `GET /api/quiz/leaderboard`

Success: `200`

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "playerName": "Guest",
      "totalPoints": 120,
      "currentStreak": 4,
      "bestStreak": 6,
      "totalCorrect": 14,
      "totalAnswers": 20,
      "accuracy": 70
    }
  ]
}
```

### `GET /api/quiz/player?id=<playerId>`

Success: `200`

```json
{
  "player": {
    "playerId": "anon",
    "playerName": "Guest",
    "totalPoints": 12,
    "currentStreak": 1,
    "bestStreak": 1,
    "totalCorrect": 1,
    "totalAnswers": 1,
    "accuracy": 100
  }
}
```

## Events

### `POST /api/events/create`

Headers: `x-owner-id`

Request:

```json
{
  "title": "Omar 50",
  "startTime": "2026-06-19T20:00:00.000Z",
  "endTime": "2026-06-19T23:00:00.000Z",
  "timezone": "Atlantic/Reykjavik",
  "description": "Party",
  "slug": "omar-50",
  "published": false
}
```

Success: `201`

```json
{
  "success": true,
  "eventId": "uuid",
  "event": { "id": "uuid", "slug": "omar-50", "title": "Omar 50" }
}
```

### `POST /api/events/<eventId>/clone`

Headers: `x-owner-id` (or admin header)

Success: `201`

```json
{
  "success": true,
  "sourceEventId": "uuid",
  "eventId": "uuid",
  "event": { "id": "uuid", "slug": "omar-50-copy" },
  "copiedKeys": ["links", "schedule"]
}
```

### `GET /api/events/<slug>/public`

Success: `200`

```json
{
  "event": { "slug": "omar-50", "title": "Omar 50" },
  "cta": {
    "canRsvp": true,
    "canPlayQuiz": true,
    "canViewPhotoWall": true,
    "canApplyAsPlanner": true,
    "canClone": true
  }
}
```

### `GET /api/dashboard/me`

Headers: `x-owner-id`

Success: `200`

```json
{
  "ownerId": "owner-1",
  "total": 1,
  "events": [],
  "drafts": [],
  "published": []
}
```

## Hosting

### `POST /api/hosting/signup`

Request:

```json
{
  "title": "My Party",
  "instagramHandle": "myhandle",
  "hashtag": "mybirthday",
  "owner": "Owner Name"
}
```

Success: `201`

```json
{
  "success": true,
  "tenant": { "slug": "myhandle", "title": "My Party" },
  "url": "https://mybirthday.myx.is/myhandle",
  "hashtagUrl": "https://www.instagram.com/explore/tags/mybirthday/"
}
```

### `GET /api/hosting/tenant?slug=<slug>`

Success: `200`

```json
{ "tenant": { "slug": "myhandle", "title": "My Party" } }
```

## Photo Wall

### `GET /api/photowall?slug=<slug>`

Success: `200`

```json
{
  "slug": "omars50",
  "hashtag": "omars50",
  "hashtagUrl": "https://www.instagram.com/explore/tags/omars50/",
  "items": []
}
```

### `POST /api/photowall/item`

Headers: `x-admin-password`

Request:

```json
{
  "slug": "omars50",
  "imageUrl": "https://example.com/pic.jpg",
  "caption": "Great moment",
  "sourceUrl": "https://example.com/post/123"
}
```

Success: `201`

```json
{
  "success": true,
  "item": { "id": "uuid", "slug": "omars50", "imageUrl": "https://example.com/pic.jpg" }
}
```

### `DELETE /api/photowall/item?slug=<slug>&id=<id>`

Headers: `x-admin-password`

Success: `200`

```json
{ "success": true, "id": "uuid", "slug": "omars50" }
```

## Planner

### `POST /api/planner/apply`

Request:

```json
{
  "slug": "omars50",
  "type": "host_add",
  "applicantName": "Planner Name",
  "contact": "email@example.com",
  "forGuest": "Omar",
  "note": "I can help"
}
```

Success: `201`

```json
{
  "success": true,
  "application": { "id": "uuid", "slug": "omars50", "type": "host_add" }
}
```

### `GET /api/planner/applications?slug=<slug>`

Headers: `x-admin-password`

Success: `200`

```json
{ "slug": "omars50", "total": 1, "items": [] }
```

## Selfie

### `GET /api/selfie/list?slug=<slug>`
### `POST /api/selfie/capture?slug=<slug>`
### `DELETE /api/selfie/item?slug=<slug>&id=<id>`

`capture` expects JSON:

```json
{
  "imageData": "data:image/jpeg;base64,...",
  "caption": "hi",
  "submittedBy": "Guest"
}
```

## Karaoke

### Endpoints

- `GET /api/karaoke/songs?slug=<slug>`
- `GET /api/karaoke/song?slug=<slug>&id=<id>`
- `GET /api/karaoke/audio?slug=<slug>&id=<id>`
- `POST /api/karaoke/upload?slug=<slug>`
- `POST /api/karaoke/transcribe?slug=<slug>&id=<id>`
- `POST /api/karaoke/lyrics?slug=<slug>&id=<id>`
- `DELETE /api/karaoke/song?slug=<slug>&id=<id>` (admin)

`upload` expects JSON:

```json
{
  "title": "Song Title",
  "artist": "Artist",
  "addedBy": "Guest",
  "audioBase64": "base64..."
}
```

## Admin

### `GET /api/admin/overview?slug=<slug>`

Headers: `x-admin-password`

Returns aggregate RSVP, quiz, and planner stats.
