# Workspace Package Configuration Pattern

**Purpose:** Proper configuration for npm workspace packages to enable clean imports
**Applies to:** All `packages/*` directories in monorepo
**Priority:** P1 (Prevents build failures)
**Created:** January 9, 2026

---

## Rule: All Workspace Packages Must Have package.json with Exports

### Core Principle

**Every directory in `packages/` must have a valid `package.json` with proper exports configuration, even if it only contains source files.**

Without package.json, the directory is not recognized as an npm workspace package and imports will fail during build.

---

## Required Pattern for Shared Frontend Packages

```json
{
  "name": "@{{PROJECT_SCOPE}}/frontend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    "./hooks/*": "./src/hooks/*",
    "./components/*": "./src/components/*"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "description": "Shared React components and hooks"
}
```

### Key Fields Explained:

| Field | Purpose | Example |
|-------|---------|---------|
| `name` | Package identifier with scope | `@{{PROJECT_SCOPE}}/frontend` |
| `private` | Prevents accidental npm publish | `true` |
| `type` | Module system (ESM) | `"module"` |
| `main` | Default entry point | `"./src/index.ts"` |
| `exports` | Subpath exports map | `{"./hooks/*": "./src/hooks/*"}` |
| `peerDependencies` | Required by consuming packages | React, React DOM |
| `description` | Package purpose | Brief explanation |

---

## Subpath Exports Pattern

**Use wildcards for directory-based imports:**

```json
{
  "exports": {
    "./hooks/*": "./src/hooks/*",
    "./components/*": "./src/components/*"
  }
}
```

**This enables clean imports in consuming apps:**

```typescript
// ✅ GOOD: Clean, maintainable
import { useTTS } from '@{{PROJECT_SCOPE}}/frontend/hooks/useTTS';
import { TTSPlayer } from '@{{PROJECT_SCOPE}}/frontend/components/TTSPlayer';

// ❌ BAD: Relative paths break encapsulation
import { useTTS } from '../../../../packages/frontend/src/hooks/useTTS';
```

---

## Error Symptoms

### Symptom 1: Module Resolution Failure

```
[vite]: Rollup failed to resolve import "@{{PROJECT_SCOPE}}/frontend/hooks/useTTS"
from "apps/admin/src/pages/SomePage.tsx"
```

**Root Cause**: `packages/frontend/` has no `package.json`

**Solution**: Create package.json with exports configuration

### Symptom 2: Workspace Not Registered

```bash
npm ls @{{PROJECT_SCOPE}}/frontend
# Output: (empty) - package not found
```

**Root Cause**: Missing package.json or not in workspace list

**Solution**: Create package.json and ensure root `package.json` includes `"packages/*"` in workspaces array

---

## Workspace Registration Checklist

After creating a new workspace package:

- [ ] Create `packages/[name]/package.json` with exports
- [ ] Verify root `package.json` includes `"packages/*"` in workspaces
- [ ] Run `npm install` to register the package
- [ ] Test imports in consuming apps
- [ ] Verify build completes successfully

---

## Common Patterns

### Pattern 1: Hooks-Only Package

```json
{
  "name": "@{{PROJECT_SCOPE}}/hooks",
  "exports": {
    "./*": "./src/*"
  },
  "peerDependencies": {
    "react": "^18.3.1"
  }
}
```

### Pattern 2: UI Components Package

```json
{
  "name": "@{{PROJECT_SCOPE}}/ui",
  "exports": {
    "./components/*": "./src/components/*",
    "./styles/*": "./src/styles/*"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

### Pattern 3: Utilities Package (No Dependencies)

```json
{
  "name": "@{{PROJECT_SCOPE}}/utils",
  "exports": {
    "./*": "./src/*"
  }
}
```

---

## Testing

### Verify Package Registration

```bash
# Check package is registered in workspace
npm ls @{{PROJECT_SCOPE}}/frontend

# Should show:
# project@1.0.0 /path/to/project
# └── @{{PROJECT_SCOPE}}/frontend@0.0.0 -> ./packages/frontend
```

### Verify Exports Work

```bash
# In consuming app, check import resolution
cd apps/admin
node -e "console.log(require.resolve('@{{PROJECT_SCOPE}}/frontend/hooks/useTTS'))"

# Should output path without error
```

### Verify Build Works

```bash
cd apps/admin
npm run build

# Should complete without "Cannot resolve" errors
```

---

## References

- **Node.js Exports:** https://nodejs.org/api/packages.html#subpath-exports
- **npm Workspaces:** https://docs.npmjs.com/cli/v8/using-npm/workspaces

---

**This rule prevents build failures from missing workspace package configuration.**
