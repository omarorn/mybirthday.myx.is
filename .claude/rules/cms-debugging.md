# CMS Debugging Workflow

**Purpose:** Systematic approach to diagnosing CMS data vs UI issues
**Applies to:** All CMS-related debugging scenarios
**Priority:** P1 (Prevents wasted debugging time)
**Created:** January 7, 2026

---

## Rule: Verify Data Layer Before Investigating UI

### Core Principle

**When users report "something blocking/missing in UI", check data completeness BEFORE investigating CSS, z-index, or layout issues.**

---

## Standard Debugging Sequence

### Step 1: Check Deployed HTML (30 seconds)

**Verify what's actually rendered:**

```bash
# Check deployed page HTML structure
curl -s https://{{DOMAIN}} | grep -A 10 "<h1"

# Look for:
# - Empty elements: <h1></h1> → DATA PROBLEM
# - Populated elements: <h1>Text</h1> → UI PROBLEM
```

**Decision point:**
- Empty elements → Proceed to Step 2 (data layer)
- Populated but hidden → Skip to Step 4 (CSS layer)

---

### Step 2: Check CMS API Response (1 minute)

**Verify backend is sending complete data:**

```bash
# Fetch CMS data for specific section
curl -s "https://api.{{DOMAIN}}/api/cms/sections/public?language=is" | \
  jq '.sections[] | select(.section_key == "hero") | .content_json' | jq

# Check for missing fields:
# - headline: null or missing → DATA INCOMPLETE
# - subtitle: null or missing → DATA INCOMPLETE
# - Nested objects incomplete → DATA STRUCTURE ISSUE
```

**Common CMS data issues:**
- Missing required fields (headline, subtitle, CTAs)
- Nested object partially updated (only `videos`, missing text)
- Incorrect data type (string instead of object)

---

### Step 3: Compare with Fallback Content (1 minute)

**Astro pages often have fallback data:**

```astro
---
// Check page source for fallback
const hero = cmsHero || {
  headline: "DEFAULT HEADLINE",
  subtitle: "DEFAULT SUBTITLE",
  cta_primary_text: "Learn More",
  // ...
};
---
```

**If CMS data incomplete, copy complete structure from fallback.**

---

### Step 4: Check CSS/Z-Index (Only After Data Verified)

**Only investigate CSS if elements exist but are hidden:**

```bash
# Check if elements exist in DOM
curl -s https://{{DOMAIN}} | grep -o "<h1>[^<]*</h1>"

# If populated, check CSS:
# - z-index layering
# - display: none
# - visibility: hidden
# - opacity: 0
# - position: absolute with off-screen coordinates
```

---

## Common Misdiagnoses

### Misdiagnosis 1: "Overlay Blocking Content"

**User reports:** "There's an overlay blocking the hero"

**Wrong approach:**
```bash
# Immediately investigate CSS
grep -r "z-index" apps/*/src/styles/
grep -r "overlay" apps/*/src/
# Wasted time if data layer is the issue
```

**Correct approach:**
```bash
# 1. Check HTML first
curl -s https://{{DOMAIN}} | grep "<h1"
# Output: <h1></h1> ← EMPTY! Not blocked, missing data

# 2. Check CMS API
curl -s "https://api.{{DOMAIN}}/api/cms/sections/public" | jq '.sections[0].content_json'
# Output: { "videos": {...} } ← Missing headline/subtitle!

# 3. Fix data layer, not CSS
```

---

### Misdiagnosis 2: "Video Not Showing"

**User reports:** "The video isn't showing up"

**Wrong approach:**
```bash
# Check video element CSS
# Check if video file exists
# Debug video codecs
```

**Correct approach:**
```bash
# 1. Check if video element exists in HTML
curl -s https://{{DOMAIN}} | grep "<video"
# Output: <video src="">...</video> ← Empty src!

# 2. Check CMS data has video URLs
curl -s "https://api.{{DOMAIN}}/api/cms/sections/public" | jq '.sections[0].content_json.videos'
# Output: { "desktop": { "mp4": "" } } ← Empty URL!

# 3. Fix CMS data, add video URLs
```

---

## Verification Checklist

Before investigating UI/CSS issues:

- [ ] Deployed HTML shows actual content (not empty elements)
- [ ] CMS API returns all required fields
- [ ] Data types match expected structure (object vs string)
- [ ] Nested objects are complete (not partial updates)
- [ ] URLs in data are valid and accessible

---

## Automation Script

**Create `scripts/verify-cms-section.sh`:**

```bash
#!/bin/bash
SECTION=$1
curl -s "https://api.{{DOMAIN}}/api/cms/sections/public?language=is" | \
  jq ".sections[] | select(.section_key == \"$SECTION\") | .content_json" | jq
```

**Usage:**
```bash
bash scripts/verify-cms-section.sh hero
# Shows complete content_json for hero section
# Easy to spot missing fields
```

---

## References

- **Pattern Source:** CMS hero debugging workflow
- **Actual Issue:** Missing CMS data (headline, subtitle, CTAs)
- **Time Saved:** 12+ minutes by checking data first

---

**This rule prevents wasted debugging time by verifying data layer before UI layer.**
