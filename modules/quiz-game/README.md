# Quiz Game Module

Multi-mode educational quiz game with leaderboards, streaks, and gamification.
Extracted from: **rusl.myx.is** (production)

## Features

- 3 game modes: Timed, Survival, Learning
- Question timer with auto-timeout
- Streak tracking with bonus points
- Lives system (Survival mode)
- Top 20 leaderboard per mode
- Admin panel for quiz management
- Duplicate detection & removal
- Haptic feedback on mobile
- Score persistence

## Game Modes

| Mode | Timer | Lives | Description |
|------|-------|-------|-------------|
| Timed | Yes | No | Race against the clock |
| Survival | Yes | 3 | Lose a life on wrong answer |
| Learning | No | No | Learn at your own pace |

## Required Wrangler Bindings

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "{{DATABASE_NAME}}"
database_id = "{{DATABASE_ID}}"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "{{IMAGES_BUCKET}}"
```

## Database Schema

Apply `migrations/001_quiz_tables.sql` before use.

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/quiz/random` | Get random question |
| POST | `/api/quiz/answer` | Submit answer |
| POST | `/api/quiz/score` | Submit final score |
| GET | `/api/quiz/leaderboard` | Top 20 scores |
| GET | `/api/quiz/stats` | Aggregate statistics |

## Gamification

- **Base points**: 10 per correct answer
- **Streak bonus**: current_streak x 2 (max +20)
- **Daily streaks**: Consecutive days of play
- **Best streak**: All-time high

## Files

| File | Lines | Purpose |
|------|-------|---------|
| `routes/quiz.ts` | ~250 | Backend API endpoints |
| `services/gamification.ts` | ~90 | Points & streak logic |
| `types.ts` | ~50 | TypeScript interfaces |
| `migrations/001_quiz_tables.sql` | ~25 | Database schema |

## Integration

```typescript
import { quizRoutes } from './modules/quiz-game/routes/quiz';
app.route('/api', quizRoutes);
```

## Line Count: ~415 total (backend core)
