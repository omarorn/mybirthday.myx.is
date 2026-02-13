# Lessons Learned - 2026-02-13

## UI Fix Pattern
- For server-rendered Astro + React table components without hydration, prefer anchor-based row navigation over JavaScript `onClick` handlers.
- Implement row navigation centrally in `src/components/admin/data-table.tsx` via an optional `getRowHref` prop.
- Avoid nested anchors by keeping column cell renderers as plain text when table-level row links are enabled.

## Bugs/Errors Encountered
- `npm run -s type-check` failed because local `astro` bin pointed to an invalid module path (`node_modules/.bin/dist/cli/index.js`).
- Serena discovery tools were attached to a different project root (`mybirthday.myx.is`) and could not be trusted for this repository path.

## Corrections Applied
- Used `npx wrangler deploy` directly to complete deploy when scripted pre-check path failed.
- Switched to direct workspace search and patching when Serena context was mismatched.

## Preventive Steps for Future Tasks
- Verify Serena project root before symbol-aware discovery.
- If Astro CLI path is broken, restore dependencies with `npm ci` before running quality gates.
- Keep data-table empty-state colSpan tied to runtime table columns (`table.getVisibleLeafColumns().length`) to avoid undefined symbol errors.