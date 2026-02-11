/**
 * R2 File Manager Routes
 * Extracted from: boklifsins (production)
 *
 * Provides full CRUD for R2 bucket objects with:
 * - Cursor-based pagination
 * - Folder simulation (delimiter-based)
 * - HTTP Range requests for streaming
 * - Bulk operations
 *
 * Usage:
 *   import { fileRoutes } from './modules/r2-file-manager/routes/files';
 *   app.route('/api', fileRoutes);
 *
 * Required binding: BUCKET (R2Bucket)
 */

import { Hono } from 'hono';

const fileRoutes = new Hono<{ Bindings: Env }>();

// Content type detection by extension
function getContentType(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase() || '';
  const types: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    pdf: 'application/pdf', json: 'application/json',
    txt: 'text/plain', html: 'text/html', css: 'text/css',
    js: 'application/javascript', ts: 'application/typescript',
    md: 'text/markdown', csv: 'text/csv', xml: 'application/xml',
  };
  return types[ext] || 'application/octet-stream';
}

// List files with optional prefix and cursor pagination
fileRoutes.get('/files', async (c) => {
  const prefix = c.req.query('prefix') || '';
  const cursor = c.req.query('cursor');
  const limit = Math.min(100, parseInt(c.req.query('limit') || '50'));

  const options: R2ListOptions = { prefix, limit };
  if (cursor) options.cursor = cursor;

  const listed = await c.env.BUCKET.list(options);

  return c.json({
    objects: listed.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      httpMetadata: obj.httpMetadata,
      customMetadata: obj.customMetadata,
    })),
    truncated: listed.truncated,
    cursor: listed.truncated ? listed.cursor : undefined,
  });
});

// List files with folder detection (delimiter-based)
fileRoutes.get('/files/list', async (c) => {
  const prefix = c.req.query('prefix') || '';
  const cursor = c.req.query('cursor');
  const limit = Math.min(100, parseInt(c.req.query('limit') || '50'));

  const options: R2ListOptions = { prefix, limit, delimiter: '/' };
  if (cursor) options.cursor = cursor;

  const listed = await c.env.BUCKET.list(options);

  const folders = (listed.delimitedPrefixes || []).map((p) => ({
    prefix: p,
    name: p.replace(prefix, '').replace(/\/$/, ''),
  }));

  return c.json({
    objects: listed.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      httpMetadata: obj.httpMetadata,
      customMetadata: obj.customMetadata,
    })),
    folders,
    truncated: listed.truncated,
    cursor: listed.truncated ? listed.cursor : undefined,
  });
});

// Get file with metadata
fileRoutes.get('/files/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const object = await c.env.BUCKET.get(key);

  if (!object) {
    return c.json({ success: false, error: 'File not found' }, 404);
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || getContentType(key));
  headers.set('Content-Length', String(object.size));
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', object.httpEtag);

  return new Response(object.body, { headers });
});

// Stream file with HTTP Range support
fileRoutes.get('/files/stream/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const range = c.req.header('Range');

  if (range) {
    const object = await c.env.BUCKET.get(key, { range: { suffix: undefined } });
    if (!object) return c.json({ success: false, error: 'File not found' }, 404);

    // Parse range header
    const match = range.match(/bytes=(\d+)-(\d*)/);
    if (!match) return c.json({ success: false, error: 'Invalid range' }, 416);

    const start = parseInt(match[1]);
    const end = match[2] ? parseInt(match[2]) : object.size - 1;
    const contentLength = end - start + 1;

    const rangedObject = await c.env.BUCKET.get(key, {
      range: { offset: start, length: contentLength },
    });
    if (!rangedObject) return c.json({ success: false, error: 'Range error' }, 416);

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || getContentType(key));
    headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
    headers.set('Content-Length', String(contentLength));
    headers.set('Accept-Ranges', 'bytes');

    return new Response(rangedObject.body, { status: 206, headers });
  }

  // No range — full file
  const object = await c.env.BUCKET.get(key);
  if (!object) return c.json({ success: false, error: 'File not found' }, 404);

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || getContentType(key));
  headers.set('Content-Length', String(object.size));
  headers.set('Accept-Ranges', 'bytes');

  return new Response(object.body, { headers });
});

// Upload file
fileRoutes.post('/upload', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const customKey = formData.get('key') as string | null;

  if (!file) {
    return c.json({ success: false, error: 'No file provided' }, 400);
  }

  const key = customKey || `uploads/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  await c.env.BUCKET.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type || getContentType(key) },
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  return c.json({ success: true, key, size: arrayBuffer.byteLength }, 201);
});

// Create folder (empty marker object)
fileRoutes.post('/files/folder', async (c) => {
  const { name, prefix } = await c.req.json<{ name: string; prefix?: string }>();

  if (!name || /[<>:"|?*]/.test(name)) {
    return c.json({ success: false, error: 'Invalid folder name' }, 400);
  }

  const folderKey = `${prefix || ''}${name}/`;
  await c.env.BUCKET.put(folderKey, new ArrayBuffer(0), {
    customMetadata: { isFolder: 'true', createdAt: new Date().toISOString() },
  });

  return c.json({ success: true, key: folderKey }, 201);
});

// Move/rename file (copy + delete)
fileRoutes.post('/files/move', async (c) => {
  const { sourceKey, destinationKey } = await c.req.json<{
    sourceKey: string;
    destinationKey: string;
  }>();

  if (!sourceKey || !destinationKey) {
    return c.json({ success: false, error: 'Source and destination required' }, 400);
  }

  const source = await c.env.BUCKET.get(sourceKey);
  if (!source) {
    return c.json({ success: false, error: 'Source file not found' }, 404);
  }

  // Copy to destination with original metadata
  await c.env.BUCKET.put(destinationKey, source.body, {
    httpMetadata: source.httpMetadata,
    customMetadata: {
      ...source.customMetadata,
      movedFrom: sourceKey,
      movedAt: new Date().toISOString(),
    },
  });

  // Delete source
  await c.env.BUCKET.delete(sourceKey);

  return c.json({ success: true, key: destinationKey });
});

// Bulk delete files (max 100)
fileRoutes.post('/files/bulk-delete', async (c) => {
  const { keys } = await c.req.json<{ keys: string[] }>();

  if (!keys?.length) {
    return c.json({ success: false, error: 'No keys provided' }, 400);
  }
  if (keys.length > 100) {
    return c.json({ success: false, error: 'Maximum 100 files per request' }, 400);
  }

  await Promise.all(keys.map((key) => c.env.BUCKET.delete(key)));

  return c.json({ success: true, deleted: keys.length });
});

// List unique folder prefixes
fileRoutes.get('/files/folders', async (c) => {
  const prefix = c.req.query('prefix') || '';
  const listed = await c.env.BUCKET.list({ prefix, delimiter: '/' });

  const folders = (listed.delimitedPrefixes || []).map((p) => ({
    prefix: p,
    name: p.replace(prefix, '').replace(/\/$/, ''),
  }));

  return c.json({ folders });
});

// Delete single file
fileRoutes.delete('/files/:key{.+}', async (c) => {
  const key = c.req.param('key');
  await c.env.BUCKET.delete(key);
  return c.json({ success: true }, 200);
});

export { fileRoutes };
