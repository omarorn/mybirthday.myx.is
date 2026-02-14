# Astro Video Background Pattern

**Purpose:** Best practices for implementing video backgrounds in Astro pages
**Applies to:** Files matching `apps/*/src/pages/*.astro`
**Priority:** P2 (UI/UX)
**Created:** January 7, 2026

---

## Rule: Autoplay Muted Videos Don't Need Poster Attribute

### Core Principle

**When using videos as background elements with autoplay and muted attributes, omit the `poster` attribute.**

### Pattern

```astro
<!-- ✅ CORRECT: No poster for background video -->
<video
  class="hero-video"
  autoplay
  muted
  loop
  playsinline
  preload="auto"
>
  <source src={heroVideos.desktop.mp4} type="video/mp4" media="(min-width: 769px)">
  <source src={heroVideos.mobile.mp4} type="video/mp4">
</video>

<!-- ❌ WRONG: Poster shows placeholder before video plays -->
<video
  class="hero-video"
  autoplay
  muted
  loop
  playsinline
  preload="auto"
  poster={heroVideos.poster}
>
  <!-- User sees poster image flash before video starts -->
</video>
```

---

## Why This Matters

**With poster attribute:**
1. Browser loads poster image
2. User sees hero-banner.png
3. Video loads and starts playing
4. Flash of poster image before video → jarring UX

**Without poster attribute:**
1. Video loads
2. First frame shows immediately
3. Video starts playing
4. Smooth transition → better UX

---

## When to Use Poster

**Do use `poster` when:**
- Video is NOT autoplay (user must click to play)
- Video is interactive content (not background decoration)
- Slow network connections need preview image

**Don't use `poster` when:**
- Video is background decoration
- Video has `autoplay` and `muted` attributes
- Want seamless loading experience

---

## Complete Video Background Pattern

```astro
---
// Fetch video URLs from CMS
const heroVideos = hero.videos || {
  desktop: { mp4: '/fallback-desktop.mp4', webm: '' },
  mobile: { mp4: '/fallback-mobile.mp4', webm: '' }
};
---

<section class="hero">
  <video
    class="hero-video"
    autoplay
    muted
    loop
    playsinline
    preload="auto"
  >
    <!-- Desktop version -->
    <source
      src={heroVideos.desktop.mp4}
      type="video/mp4"
      media="(min-width: 769px)"
    >

    <!-- Mobile version (smaller file) -->
    <source
      src={heroVideos.mobile.mp4}
      type="video/mp4"
    >
  </video>

  <div class="hero-content">
    <h1>{hero.headline}</h1>
    <p>{hero.subtitle}</p>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
  }

  .hero-video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
    object-fit: cover;
    z-index: 1;
    opacity: 0.4; /* Reduce intensity for readability */
  }

  .hero-content {
    position: relative;
    z-index: 2;
    /* Content appears above video */
  }
</style>
```

---

## References

- **Pattern Source:** Hero video poster removal pattern
- **Symptom:** "there's like a hero-banner.png in the foreground"
- **Fix:** Removed `poster` attribute from autoplay background video

---

**This rule ensures smooth video background loading without placeholder flashes.**
