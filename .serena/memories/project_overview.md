# MYX.IS project overview

## Purpose
MYX.IS is a multi-tenant family platform for photo/memory management, genealogy/family tree features, social features, and AI-assisted workflows (tagging/captioning/search).

## Actual workspace shape
This repository is a large workspace/monorepo-style codebase. The root contains multiple apps/services and infra folders.

Top-level important areas:
- `frontend/`: Next.js + TypeScript web app (main user-facing app)
- `backend/`: Node/Express TypeScript photo processing service
- `database/`: Prisma + PostgreSQL multi-tenant schema utilities
- root app files (`astro.config.mjs`, root `package.json`, `src/`, `workers/`): Astro + Cloudflare Worker oriented app/deploy flow
- infra/docs: `docker-compose.yml`, `migrations/`, `scripts/`, `docs/`, `.taskmaster/`

## Tech stack (combined)
- Frontend: Next.js 15, React, TypeScript, Tailwind, Radix UI
- Root app: Astro 5, React integration, Cloudflare adapter, Wrangler/D1
- Backend: Node.js + Express + TypeScript, BullMQ/Redis, Sharp/ExifR pipeline
- Data: PostgreSQL + Prisma, multi-tenant/RLS-focused schema
- Platform: Cloudflare Workers/D1/Wrangler, Docker for local containerized flows

## Notes
- `README.md` contains broad platform context and some older structure references; use package scripts and folder-local READMEs as source of truth when in doubt.
- This repo contains both product code and a substantial amount of documentation/status artifacts.