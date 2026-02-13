# Repository Guidelines

## Project Structure & Module Organization
Cloudflare Workers template with reusable modules.

- Root config and docs: `wrangler.toml`, `package.json`, `README.md`, `CLAUDE.md`
- Reusable feature packages: `modules/` (for example `modules/quiz-game/`, `modules/cms/`)
- Utility and ops scripts: `scripts/` (including `scripts/load-tests/` and `scripts/video-tutorials/`)
- CI automation: `.github/workflows/` and `.github/scripts/`
- Agent tooling and rules: `.claude/`

Keep reusable feature code in `modules/`; keep one-off automation in `scripts/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies
- `npm run dev`: start local Worker dev server
- `npm run build`: build CSS and Worker output
- `npm run typecheck`: run TypeScript checks (`tsc --noEmit`)
- `npm run lint` / `npm run lint:fix`: run ESLint (check/fix)
- `npm run format`: format with Prettier
- `npm run test`: run Vitest
- `npm run test:e2e`: run Playwright end-to-end tests
- `npm run deploy`: deploy via Wrangler

## Coding Style & Naming Conventions
- Language: TypeScript (ESM), plus project JSX artifacts in root.
- Formatting: Prettier (`npm run format`), linting via ESLint 9.
- Indentation: Prettier defaults (2 spaces).
- Naming: folders/files `kebab-case`, variables/functions `camelCase`, types/classes `PascalCase`.
- Prefer small, composable modules and explicit return types on exported functions.

## Testing Guidelines
- Frameworks: Vitest (unit/integration) and Playwright (E2E).
- Place tests under `tests/unit` or `tests/integration` when those directories are used.
- Test files should follow `*.test.ts` naming.
- Run `npm run test` before opening a PR.

## Commit & Pull Request Guidelines
Recent commits use short, imperative subjects (for example: `Refactor configuration in wrangler.toml ...`).

- Commit format: imperative, concise subject.
- Avoid non-descriptive messages like `1`.
- PRs should include: summary, impacted paths, test evidence, linked issue/task.
- Include screenshots or sample API/CLI output when behavior changes.

## Claude Rules & Plugins
This repo has Claude configuration in `.claude/`:

- Always use Serena to help with coding tasks first (discovery, symbol lookup, references, and edits), then fall back to shell/text search only when needed.
- When working in Icelandic (copy, UI text, docs, or prompts), use the Icelandic agent in `.claude/Agents/icelandic-reviewer.md` for wording/grammar review before finalizing.
- Plugins are enabled in `.claude/settings.json` (Serena, Context7, TypeScript LSP, Playwright, PR review toolkit).
- Follow `.claude/rules/golden-rules.md` and `.claude/rules/pre-commit-validation.md`.
- Required pre-commit gate (minimum): `npm run typecheck && npm run lint && npm run test && npm run build`.
- Apply `.claude/rules/timing-safe-comparison.md` and related security rules.

## Security & Configuration Tips
- Never commit secrets; use Wrangler secrets (`wrangler secret put`).
- Replace `{{PLACEHOLDER}}` values in config/docs before production deployment.
- Apply D1 migrations before dependent code deploys.
