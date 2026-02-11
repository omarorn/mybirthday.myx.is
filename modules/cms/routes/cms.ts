/**
 * CMS Routes
 * Extracted from: Litla Gamaleigan (production)
 *
 * Content management for sections, images, and markdown files.
 * Includes version history and rollback support.
 *
 * Usage:
 *   import { cmsRoutes } from './modules/cms/routes/cms';
 *   app.route('/api', cmsRoutes);
 *
 * Required bindings: DB (D1Database), BUCKET (R2Bucket)
 */

import { Hono } from 'hono';

const cmsRoutes = new Hono<{ Bindings: Env }>();

// List all sections
cmsRoutes.get('/cms/sections', async (c) => {
  const sections = await c.env.DB.prepare(
    'SELECT * FROM cms_sections ORDER BY section_key'
  ).all();
  return c.json({ success: true, data: sections.results });
});

// Get section by key
cmsRoutes.get('/cms/sections/:key', async (c) => {
  const key = c.req.param('key');
  const section = await c.env.DB.prepare(
    'SELECT * FROM cms_sections WHERE section_key = ?'
  ).bind(key).first();

  if (!section) return c.json({ success: false, error: 'Section not found' }, 404);
  return c.json({ success: true, data: section });
});

// Update section (auto-increments version, saves history)
cmsRoutes.put('/cms/sections/:key', async (c) => {
  const key = c.req.param('key');
  const { content_json, updated_by, change_summary } = await c.req.json<{
    content_json: Record<string, unknown>;
    updated_by: string;
    change_summary?: string;
  }>();

  const existing = await c.env.DB.prepare(
    'SELECT * FROM cms_sections WHERE section_key = ?'
  ).bind(key).first<{ version: number; content_json: string }>();

  if (!existing) return c.json({ success: false, error: 'Section not found' }, 404);

  const newVersion = existing.version + 1;
  const now = new Date().toISOString();

  // Save current version to history before updating
  await c.env.DB.batch([
    c.env.DB.prepare(
      'INSERT INTO cms_section_history (section_key, version, content_json, updated_by, change_summary) VALUES (?, ?, ?, ?, ?)'
    ).bind(key, existing.version, existing.content_json, updated_by, change_summary || null),
    c.env.DB.prepare(
      'UPDATE cms_sections SET content_json = ?, version = ?, updated_by = ?, updated_at = ? WHERE section_key = ?'
    ).bind(JSON.stringify(content_json), newVersion, updated_by, now, key),
  ]);

  return c.json({ success: true, version: newVersion });
});

// Get version history for section
cmsRoutes.get('/cms/history/:key', async (c) => {
  const key = c.req.param('key');
  const limit = parseInt(c.req.query('limit') || '20');

  const history = await c.env.DB.prepare(
    'SELECT * FROM cms_section_history WHERE section_key = ? ORDER BY version DESC LIMIT ?'
  ).bind(key, limit).all();

  return c.json({ success: true, data: history.results });
});

// Rollback section to specific version
cmsRoutes.post('/cms/rollback/:key', async (c) => {
  const key = c.req.param('key');
  const { version, updated_by } = await c.req.json<{
    version: number;
    updated_by: string;
  }>();

  const historyEntry = await c.env.DB.prepare(
    'SELECT * FROM cms_section_history WHERE section_key = ? AND version = ?'
  ).bind(key, version).first<{ content_json: string }>();

  if (!historyEntry) return c.json({ success: false, error: 'Version not found' }, 404);

  const existing = await c.env.DB.prepare(
    'SELECT version, content_json FROM cms_sections WHERE section_key = ?'
  ).bind(key).first<{ version: number; content_json: string }>();

  if (!existing) return c.json({ success: false, error: 'Section not found' }, 404);

  const newVersion = existing.version + 1;
  const now = new Date().toISOString();

  await c.env.DB.batch([
    c.env.DB.prepare(
      'INSERT INTO cms_section_history (section_key, version, content_json, updated_by, change_summary) VALUES (?, ?, ?, ?, ?)'
    ).bind(key, existing.version, existing.content_json, updated_by, `Rollback from v${existing.version} to v${version}`),
    c.env.DB.prepare(
      'UPDATE cms_sections SET content_json = ?, version = ?, updated_by = ?, updated_at = ? WHERE section_key = ?'
    ).bind(historyEntry.content_json, newVersion, updated_by, now, key),
  ]);

  return c.json({ success: true, version: newVersion });
});

// List images
cmsRoutes.get('/cms/images', async (c) => {
  const sectionKey = c.req.query('section_key');
  const imageType = c.req.query('image_type');

  let sql = 'SELECT * FROM cms_images WHERE 1=1';
  const params: string[] = [];

  if (sectionKey) { sql += ' AND section_key = ?'; params.push(sectionKey); }
  if (imageType) { sql += ' AND image_type = ?'; params.push(imageType); }
  sql += ' ORDER BY uploaded_at DESC';

  const stmt = c.env.DB.prepare(sql);
  const images = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

  return c.json({ success: true, data: images.results });
});

// Upload image
cmsRoutes.post('/cms/images', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  const sectionKey = formData.get('section_key') as string | null;
  const imageType = (formData.get('image_type') as string) || 'photo';
  const altText = formData.get('alt_text') as string | null;
  const uploadedBy = (formData.get('uploaded_by') as string) || 'system';

  if (!file) return c.json({ success: false, error: 'No file provided' }, 400);

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm'];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ success: false, error: 'File type not allowed' }, 400);
  }

  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    return c.json({ success: false, error: 'File too large (max 10MB)' }, 400);
  }

  const imageKey = `cms/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  await c.env.BUCKET.put(imageKey, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  const imageUrl = `/api/files/${imageKey}`;

  await c.env.DB.prepare(
    'INSERT INTO cms_images (image_key, image_name, image_url, image_type, section_key, alt_text, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(imageKey, file.name, imageUrl, imageType, sectionKey, altText, uploadedBy).run();

  return c.json({ success: true, image_key: imageKey, image_url: imageUrl }, 201);
});

// Delete image
cmsRoutes.delete('/cms/images/:key', async (c) => {
  const imageKey = c.req.param('key');

  // Delete from R2
  await c.env.BUCKET.delete(imageKey);

  // Delete from DB
  await c.env.DB.prepare(
    'DELETE FROM cms_images WHERE image_key = ?'
  ).bind(imageKey).run();

  return c.json({ success: true });
});

export { cmsRoutes };
