# Driver Location Module

GPS tracking, route optimization, job management, and signature capture for mobile workers.
Extracted from: **Litla Gamaleigan** (production)

## Features

- Real-time GPS tracking (30-second intervals)
- Route optimization with stop sequencing
- Job board (available, assigned, completed)
- Take/release/complete job workflow
- Signature capture (Canvas-based)
- Camera photo capture
- QR code + OTP authentication
- Text-to-speech announcements
- Mapbox map integration
- Google Maps navigation links
- Haptic feedback
- Offline-capable session management

## Required Wrangler Bindings

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "{{DATABASE_NAME}}"
database_id = "{{DATABASE_ID}}"

[[kv_namespaces]]
binding = "SESSIONS"
id = "{{KV_NAMESPACE_ID}}"

[vars]
MAPBOX_TOKEN = "" # Set via: wrangler secret put MAPBOX_TOKEN
GOOGLE_CLIENT_ID = "" # For Google OAuth login
```

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/jobs/available` | List unassigned jobs |
| GET | `/api/jobs/my-jobs` | Driver's assigned jobs |
| POST | `/api/jobs/:id/take` | Claim available job |
| POST | `/api/jobs/:id/complete` | Complete with signature |
| POST | `/api/jobs/:id/release` | Unclaim job |
| POST | `/api/location/update` | Update GPS position |
| GET | `/api/location/drivers` | All driver locations |
| GET | `/api/routes/my-route` | Today's route & stops |
| POST | `/api/routes/optimize` | Optimize stop order |
| POST | `/api/auth/truck/scan` | QR truck login step 1 |
| POST | `/api/auth/truck/request-otp` | Phone OTP step 2 |
| POST | `/api/auth/truck/verify-otp` | Verify OTP step 3 |

## React Hooks

| Hook | Purpose |
|------|---------|
| `useGeolocation` | GPS tracking with configurable intervals |
| `useTTS` | Text-to-speech (Web Speech API) |

## React Components

| Component | Purpose |
|-----------|---------|
| `SignatureCapture` | Canvas signature pad |
| `RouteMap` | Mapbox map with stop markers |
| `TrackingStatus` | GPS accuracy indicator |
| `BottomNav` | Mobile tab navigation |

## Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `hooks/useGeolocation.ts` | ~70 | GPS tracking hook |
| `hooks/useTTS.ts` | ~40 | Text-to-speech hook |
| `components/SignatureCapture.tsx` | ~100 | Signature pad |
| `context/TruckSessionContext.tsx` | ~80 | Session provider |
| `routes/jobs.ts` | ~150 | Job CRUD endpoints |
| `routes/location.ts` | ~80 | GPS update endpoints |
| `types.ts` | ~80 | TypeScript interfaces |

## Integration

```typescript
// Backend
import { jobRoutes } from './modules/driver-location/routes/jobs';
import { locationRoutes } from './modules/driver-location/routes/location';
app.route('/api', jobRoutes);
app.route('/api', locationRoutes);

// Frontend
import { useGeolocation } from './modules/driver-location/hooks/useGeolocation';
import { SignatureCapture } from './modules/driver-location/components/SignatureCapture';
```

## Line Count: ~600 total (core utilities)
