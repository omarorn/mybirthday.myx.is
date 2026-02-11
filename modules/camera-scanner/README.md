# Camera Scanner Module

Camera capture with AI-powered image classification, motion detection, and object detection.
Extracted from: **rusl.myx.is** (production)

## Features

- Real-time camera stream (WebRTC MediaStream API)
- Photo capture with JPEG compression
- Motion detection for auto-capture triggering
- AI classification via Gemini Vision API
- Multi-object detection with bounding box overlay
- Client-side image cropping
- Icon/cartoon generation from photos
- Result caching to avoid localStorage quota issues
- Activity logging with timestamps

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

[[kv_namespaces]]
binding = "CACHE"
id = "{{KV_NAMESPACE_ID}}"

[ai]
binding = "AI"

[vars]
GEMINI_API_KEY = "" # Set via: wrangler secret put GEMINI_API_KEY
```

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/identify` | Classify image with AI |
| POST | `/api/image/crop` | Server-side image cropping |
| POST | `/api/image/cartoon` | AI cartoon generation |
| POST | `/api/image/icon` | Generate icon from image |

## Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `hooks/useCamera.ts` | ~60 | WebRTC camera hook |
| `utils/imageUtils.ts` | ~160 | Crop, overlay, motion detection |
| `routes/image.ts` | ~130 | Image processing endpoints |
| `types.ts` | ~50 | TypeScript interfaces |

## Integration

```typescript
// Hook usage in React component
import { useCamera } from './modules/camera-scanner/hooks/useCamera';

function Scanner() {
  const { videoRef, captureImage, startCamera, stopCamera } = useCamera();
  // ...
}
```

## AI Provider

Default: Gemini 2.5 Flash (via `GEMINI_API_KEY`)
Fallback: Cloudflare Workers AI (via `AI` binding)

## Line Count: ~400 total (core utilities)
