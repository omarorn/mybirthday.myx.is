# Task Completion Checklist
When finishing a code task in this project, run the relevant subset:
1. `npm run typecheck`
2. `npm run lint`
3. `npm run test` (or targeted test script)
4. `npm run build` for integration-level validation

For Cloudflare schema/runtime changes:
5. Apply D1 migrations (local/remote as appropriate) before deploy.
6. Deploy via `npm run deploy` (or pages deploy flow).

If docs/config placeholders are touched:
7. Ensure `{{PLACEHOLDER}}` values are replaced consistently in `README.md`, `CLAUDE.md`, and `package.json`.
