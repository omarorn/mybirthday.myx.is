# Mobile App Shell Module

Mobile-first dark theme with desktop phone mockup wrapper.
Extracted from: **omar.eyar.app** (production)

## Features

- Mobile-first responsive design
- Desktop: phone mockup frame with side content panel
- Dark theme with configurable accent color (default: cyan #22d3ee)
- Expandable cards, KPI dashboard widgets
- IntersectionObserver scroll animations
- Fonts: Outfit (body) + DM Mono (monospace)
- Pure HTML/CSS/JS — no framework needed
- Cloudflare Workers compatible

## Design System

| Token | Default | Purpose |
|-------|---------|---------|
| `--bg-dark` | `#0a0e17` | Page background |
| `--bg-card` | `#111827` | Card background |
| `--accent` | `#22d3ee` | Primary accent (cyan) |
| `--green` | `#34d399` | Success/positive |
| `--amber` | `#fbbf24` | Warning/attention |
| `--red` | `#f87171` | Error/danger |
| `--purple` | `#a78bfa` | Special/highlight |
| `--radius` | `12px` | Border radius |

## File Structure

```
mobile-app-shell/
  README.md              # This file
  index.html             # Full template with placeholders
  worker.ts              # Cloudflare Worker entry point
  wrangler.toml.example  # Wrangler config template
```

## Quick Start

1. Copy module to your project root
2. Replace `{{SITE_TITLE}}`, `{{ACCENT_COLOR}}`, etc.
3. Deploy: `npx wrangler deploy`

## Desktop Phone Mockup

On screens > 768px, the page renders inside a phone mockup frame with:
- Left panel: Marketing/story content
- Center: Phone mockup with scrollable app content
- Right panel: Additional info (optional)

On mobile, the app content fills the full screen.

## Customization

All CSS uses custom properties — override in `:root` to change the theme:

```css
:root {
  --accent: #8b5cf6; /* Change to purple */
  --bg-dark: #1a1a2e; /* Darker background */
}
```
