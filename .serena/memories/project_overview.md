# Project Overview
- Name: `mybirthday.myx.is` (currently appears to be a Cloudflare starter/template with placeholders in docs and package metadata).
- Purpose: scaffold for a Cloudflare-based full-stack app using Workers + Hono with optional D1/R2/Vectorize/AI integrations.
- Runtime/Platform: Cloudflare Workers (Linux development environment).
- Primary language: TypeScript (ES modules).
- Frontend/build: Tailwind CSS v4 build pipeline.
- Testing: Vitest + Playwright.
- CI/hooks: Husky + lint-staged, GitHub Actions.
- Important note: top-level `README.md` and `CLAUDE.md` still contain many `{{PLACEHOLDER}}` tokens; project-specific values likely need to be filled before production use.

# Rough Structure
- `.claude/` agent config, plugins, rules, commands.
- `.github/` workflows and automation scripts.
- `modules/` reusable feature modules.
- `scripts/` helper scripts.
- Root config/docs include `wrangler.toml`, `README.md`, `CLAUDE.md`, `package.json`.
