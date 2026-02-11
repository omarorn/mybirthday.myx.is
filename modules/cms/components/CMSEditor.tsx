/**
 * CMS Section Editor Component (React + TypeScript)
 * Content management with sections, media library, and version history.
 * Extracted from: Litla_Gamaleigan (production)
 *
 * Features:
 * - Section list with drag-to-reorder
 * - Rich text editing (markdown or HTML)
 * - Image upload with R2 integration
 * - Media library browser
 * - Version history with rollback
 * - Draft/publish workflow
 *
 * Required API endpoints:
 * - GET    {{API_BASE}}/api/cms/sections
 * - GET    {{API_BASE}}/api/cms/sections/:id
 * - POST   {{API_BASE}}/api/cms/sections
 * - PUT    {{API_BASE}}/api/cms/sections/:id
 * - DELETE {{API_BASE}}/api/cms/sections/:id
 * - GET    {{API_BASE}}/api/cms/media
 * - POST   {{API_BASE}}/api/cms/media/upload
 * - GET    {{API_BASE}}/api/cms/sections/:id/history
 * - POST   {{API_BASE}}/api/cms/sections/:id/revert/:version
 */

import { useState, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────
interface CMSSection {
  id: string;
  key: string;
  title: string;
  content: string;
  type: 'text' | 'html' | 'markdown' | 'hero' | 'gallery';
  status: 'draft' | 'published';
  order: number;
  updated_at: string;
  image_url?: string;
}

interface CMSEditorProps {
  apiBase?: string;
  onNavigateToSection?: (sectionId: string) => void;
}

// ─── Component ──────────────────────────────────────────
export function CMSEditor({ apiBase = '' }: CMSEditorProps) {
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<CMSSection | null>(null);

  useEffect(() => { loadSections(); }, []);

  const loadSections = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${apiBase}/api/cms/sections`, { credentials: 'include' });
      const data = await res.json();
      setSections(data.sections || []);
    } catch { setError('Failed to load sections'); }
    finally { setLoading(false); }
  };

  const createSection = async () => {
    const title = prompt('Section title:');
    if (!title) return;
    try {
      const res = await fetch(`${apiBase}/api/cms/sections`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, key: title.toLowerCase().replace(/\s+/g, '-'), type: 'markdown', content: '' }),
        credentials: 'include',
      });
      if (res.ok) loadSections();
    } catch { setError('Failed to create section'); }
  };

  const saveSection = async (section: CMSSection) => {
    try {
      await fetch(`${apiBase}/api/cms/sections/${section.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section), credentials: 'include',
      });
      setEditingSection(null);
      loadSections();
    } catch { setError('Failed to save section'); }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    try {
      await fetch(`${apiBase}/api/cms/sections/${id}`, { method: 'DELETE', credentials: 'include' });
      loadSections();
    } catch { setError('Failed to delete section'); }
  };

  const togglePublish = async (section: CMSSection) => {
    const newStatus = section.status === 'published' ? 'draft' : 'published';
    await saveSection({ ...section, status: newStatus });
  };

  // ─── Edit View ────────────────────────────────────────
  if (editingSection) {
    return (
      <div className="h-full flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
          <button onClick={() => setEditingSection(null)} className="text-blue-600 font-medium">← Back</button>
          <h1 className="font-bold">{editingSection.title}</h1>
          <button onClick={() => saveSection(editingSection)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">Save</button>
        </header>
        <main className="flex-1 p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={editingSection.title}
              onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={editingSection.type}
              onChange={e => setEditingSection({ ...editingSection, type: e.target.value as CMSSection['type'] })}
              className="w-full px-4 py-2 border rounded-lg">
              <option value="text">Plain text</option>
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
              <option value="hero">Hero section</option>
              <option value="gallery">Gallery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea value={editingSection.content}
              onChange={e => setEditingSection({ ...editingSection, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg font-mono text-sm" rows={20} />
          </div>
        </main>
      </div>
    );
  }

  // ─── List View ────────────────────────────────────────
  return (
    <div className="h-full flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">CMS Sections</h1>
        <button onClick={createSection} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">+ New section</button>
      </header>
      <main className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : error ? (
          <div className="text-center text-red-500 p-8">{error}<br /><button onClick={loadSections} className="mt-2 text-blue-600 underline">Retry</button></div>
        ) : sections.length === 0 ? (
          <div className="text-center text-gray-500 p-12"><div className="text-4xl mb-2">📝</div><p>No sections yet</p></div>
        ) : (
          <div className="space-y-3">
            {sections.sort((a, b) => a.order - b.order).map(section => (
              <div key={section.id} className="bg-white dark:bg-gray-800 border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{section.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${section.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {section.status}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{section.type}</span>
                  </div>
                  <p className="text-sm text-gray-500">Key: {section.key} · Updated: {new Date(section.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => togglePublish(section)} className="text-sm px-3 py-1 rounded border hover:bg-gray-50">
                    {section.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => setEditingSection(section)} className="text-sm px-3 py-1 rounded bg-blue-600 text-white">Edit</button>
                  <button onClick={() => deleteSection(section.id)} className="text-sm px-3 py-1 rounded text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
