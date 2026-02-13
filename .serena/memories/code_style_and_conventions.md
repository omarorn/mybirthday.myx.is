# Code Style and Conventions
- Language: TypeScript with ESM (`"type": "module"`).
- Formatting/Linting: Prettier + ESLint 9 via npm scripts.
- Commit-time checks: Husky + lint-staged.
- Test style: Vitest for unit/integration, Playwright for e2e.
- Architecture preference (from project docs): Cloudflare-native services first (D1/R2/KV/Vectorize/Workers AI) before external systems.
- API pattern guidance in docs: prefer structured JSON responses with consistent success/error envelopes.
- Security guidance in docs: parameterized SQL, rate limiting, timing-safe secret comparison.
- Current limitation: no explicit top-level eslint/prettier config files were found yet; defaults may come from package/tool defaults or files not yet added.
