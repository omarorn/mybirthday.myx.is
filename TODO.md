# TODO — mybirthday.myx.is

Last updated: 2026-02-16 (from `/oom-reflect` audit)

## Honest Project Status: 🟡 PARTIAL (45%)
Core party features work. Infrastructure and tooling are missing.

---

## 🔴 Fix Now — Blocking or Broken

### 1. Extend tsconfig.json to cover modules/
- **File:** `tsconfig.json`
- **Issue:** `include: ["src/**/*.ts"]` only checks 27-line scaffold
- **Fix:** Add `"modules/**/*.ts"` to include array
- **Impact:** Will reveal any TypeScript errors in 1063-line worker

### 2. Trim CLAUDE.md to match reality
- **File:** `CLAUDE.md`
- **Issue:** 20KB+ of instructions describing nonexistent architecture (Hono, D1, R2, Vitest, Playwright, CI/CD)
- **Fix:** Remove all references to unused tech, keep only what actually exists
- **Impact:** Prevents confusion in future sessions

### 3. Decide fate of orphaned modules
- **Files:** `modules/quiz-game/`, `modules/cms/`, `modules/r2-file-manager/`, `modules/camera-scanner/`, `modules/driver-location/`
- **Issue:** ~4700 lines of React code not integrated with vanilla JS app
- **Options:**
  - A) Delete them (clean codebase)
  - B) Keep as reference for future React migration
  - C) Integrate them (requires major refactor)
- **Recommendation:** Option B — keep but document as "reference only"

---

## 🟡 Fix Soon — Degraded Experience

### 4. Add build + lint scripts
- **File:** `package.json`
- **Fix:** Add eslint/biome + build script
- **Impact:** Basic code quality gates

### 5. Split worker.ts into route modules
- **File:** `modules/mobile-app-shell/worker.ts` (1063 lines)
- **Fix:** Extract API routes into separate files (rsvp.ts, quiz.ts, events.ts, etc.)
- **Impact:** Maintainability, easier to navigate

### 6. Split index.html into components
- **File:** `modules/mobile-app-shell/index.html` (1611 lines)
- **Fix:** Extract CSS to external file, JS to external file
- **Impact:** Better DX, caching benefits

### 7. Add real persistence (D1)
- **Issue:** KV is key-value only, no queries, no relations
- **Fix:** Add D1 database for RSVP, events, quiz data
- **Impact:** Better data model, query capability

---

## 🟢 Fix Later — Polish and Optimization

### 8. Add authentication
- **Issue:** Admin uses shared password, users have no real auth
- **Fix:** Implement OAuth or OTP via Auth0/Cloudflare Access
- **Impact:** Security, personalization

### 9. Add tests
- **Fix:** Install Vitest, write tests for API endpoints
- **Impact:** Regression protection

### 10. Add CI/CD pipeline
- **Fix:** GitHub Actions for typecheck + deploy
- **Impact:** Automated quality gates

### 11. Connect R2 for media storage
- **Issue:** Photo wall has no actual image storage
- **Fix:** Add R2 bucket, upload endpoint
- **Impact:** Real photo functionality

---

## Feature Status Matrix

| Feature | Status | Details |
|---------|--------|---------|
| RSVP System | 🟢 WORKING (85%) | API + UI work, no email notifications |
| Quiz Game | 🟢 WORKING (80%) | 30 questions, admin can add, no leaderboard persistence |
| Event Management | 🟢 WORKING (80%) | Create, clone, public view |
| Photo Wall | 🟡 PARTIAL (50%) | API exists, no R2 storage |
| Theme System | ✅ COMPLETE | 4 themes, CSS custom properties |
| Countdown Timer | ✅ COMPLETE | Counts to June 19, 2026 |
| Admin Dashboard | 🟢 WORKING (80%) | Stats, overview, management |
| Planner Applications | 🟢 WORKING (75%) | Submit + view, no notifications |
| Hosting/Multi-tenant | 🟡 PARTIAL (40%) | Slug-based routing concept, limited |
| Authentication | 🟠 STARTED (15%) | Admin password only, no user auth |
| Testing | ⚠️ NOT STARTED | Zero tests |
| CI/CD | ⚠️ NOT STARTED | No pipeline |
| D1 Database | ⚠️ NOT STARTED | KV only |
