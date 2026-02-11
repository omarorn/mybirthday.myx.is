/**
 * Mobile App Shell - Cloudflare Worker
 * Serves a single HTML page with mobile-first design.
 * Extracted from: omar.eyar.app (production)
 *
 * Usage: npx wrangler deploy
 */

// @ts-ignore — Wrangler handles this import
import HTML from './index.html';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Favicon
    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    // API routes can be added here
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Serve HTML
    return new Response(HTML, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Powered-By': '2076 ehf',
      },
    });
  },
};
