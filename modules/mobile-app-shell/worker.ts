/**
 * It's My Birthday - Cloudflare Worker
 * Slim router – delegates to modular route handlers.
 */

// @ts-expect-error Wrangler bundles HTML imports
import HTML from "./index.html";

import type { Env } from "./types";
import { HttpError } from "./types";
import { json, getSlugFromPath } from "./helpers";

import { handleRsvpRoutes } from "./routes/rsvp";
import { handleQuizRoutes } from "./routes/quiz";
import { handleEventsRoutes } from "./routes/events";
import { handleAdminRoutes } from "./routes/admin";
import { handleHostingRoutes } from "./routes/hosting";
import { handlePhotowallRoutes } from "./routes/photowall";
import { handlePlannerRoutes } from "./routes/planner";
import { handleSelfieRoutes } from "./routes/selfie";
import { handleKaraokeRoutes } from "./routes/karaoke";

// ── Worker entry point ──────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/favicon.ico") {
        return new Response(null, { status: 204 });
      }

      if (url.pathname.startsWith("/api/")) {
        const response =
          (await handleRsvpRoutes(request, url, env)) ??
          (await handleQuizRoutes(request, url, env)) ??
          (await handleEventsRoutes(request, url, env)) ??
          (await handleAdminRoutes(request, url, env)) ??
          (await handleHostingRoutes(request, url, env)) ??
          (await handlePhotowallRoutes(request, url, env)) ??
          (await handlePlannerRoutes(request, url, env)) ??
          (await handleSelfieRoutes(request, url, env)) ??
          (await handleKaraokeRoutes(request, url, env));

        if (response) return response;
        return json({ error: "Not found" }, 404);
      }

      // ── Serve HTML SPA ──────────────────────────────────────
      const slug = getSlugFromPath(url.pathname);
      const html = HTML.replace(
        "</head>",
        `<script>window.__APP_SLUG__=${JSON.stringify(slug || "")};</script></head>`,
      );

      return new Response(html, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=300",
          "X-Powered-By": "2076 ehf",
        },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message }, error.status);
      }
      console.error("Unhandled request error", error);
      if (url.pathname.startsWith("/api/")) {
        return json({ error: "Innri villa á netþjóni" }, 500);
      }
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
