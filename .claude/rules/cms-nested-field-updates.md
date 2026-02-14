# CMS Nested Field State Updates

**Purpose:** Properly update nested objects when editing dotted field paths in React state
**Applies to:** Files matching `**/cms/**/*.tsx`, `**/*Editor*.tsx`, `**/*Form*.tsx`
**Priority:** P1 (Prevents data structure corruption)
**Created:** January 7, 2026

---

## Rule: Walk Nested Paths Instead of Creating Flat Keys

### Core Principle

**When updating nested fields like `videos.desktop.mp4`, update the nested object structure, not create a flat key.**

### Pattern to Detect

**Vulnerable code (DO NOT USE):**
```typescript
// Creates flat key "videos.desktop.mp4" instead of updating nested object
function handleFieldChange(field: string, value: any) {
  setFormData(prev => ({ ...prev, [field]: value }));
}
// Results in: { "videos.desktop.mp4": "new-url" } - WRONG!
```

### Required Pattern

**Correct code (MUST USE):**
```typescript
function handleFieldChange(field: string, value: any) {
  setFormData((prev) => {
    // Handle nested paths like "videos.desktop.mp4"
    if (field.includes('.')) {
      const keys = field.split('.');
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone

      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined || current[key] === null) {
          current[key] = {};
        }
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;

      return newData;
    }

    return { ...prev, [field]: value };
  });
}
// Results in: { "videos": { "desktop": { "mp4": "new-url" } } } - CORRECT!
```

---

## Cleanup Pattern

When saving CMS data, remove any legacy flat keys that look like nested paths:

```typescript
async function handleSave() {
  let dataToSave = formData;

  // Clean up legacy flat keys (e.g., "videos.desktop.mp4")
  const cleanedData = {};
  for (const [k, v] of Object.entries(dataToSave)) {
    if (!k.includes('.')) {
      cleanedData[k] = v;
    }
  }
  dataToSave = cleanedData;

  await api.save(dataToSave);
}
```

---

## Why This Matters

**Without proper nested updates:**
```json
{
  "videos": {
    "desktop": { "mp4": "old-url.mp4" }
  },
  "videos.desktop.mp4": "new-url.mp4"
}
```

Frontend reads `data.videos.desktop.mp4` → gets "old-url.mp4"
User entered "new-url.mp4" but it's stored in wrong location

**With proper nested updates:**
```json
{
  "videos": {
    "desktop": { "mp4": "new-url.mp4" }
  }
}
```

Frontend reads `data.videos.desktop.mp4` → gets "new-url.mp4" (correct)

---

## References

- **Pattern Source:** CMS hero video nested field fix
- **Symptom:** Videos entered in CMS didn't appear on landing page
- **Root Cause:** Flat keys created instead of nested object updates

---

**This rule prevents CMS data structure corruption from dotted field paths.**
