/**
 * Media Library Component (React + TypeScript)
 * Browse, upload, and select images from R2 storage.
 * Extracted from: Litla_Gamaleigan (production)
 *
 * Usage:
 *   <MediaLibrary onClose={() => {}} onSelectImage={(url) => {}} />
 */

import { useState, useEffect } from 'react';

interface MediaImage {
  key: string;
  url: string;
  size: number;
  uploaded: string;
  contentType: string;
}

interface MediaLibraryProps {
  onClose: () => void;
  onSelectImage?: (url: string, key: string) => void;
  apiBase?: string;
  sectionKey?: string;
}

export function MediaLibrary({ onClose, onSelectImage, apiBase = '', sectionKey }: MediaLibraryProps) {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadImages(); }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const params = sectionKey ? `?section=${sectionKey}` : '';
      const res = await fetch(`${apiBase}/api/cms/media${params}`, { credentials: 'include' });
      const data = await res.json();
      setImages(data.images || []);
    } catch { setError('Failed to load images'); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (sectionKey) formData.append('section', sectionKey);
      const res = await fetch(`${apiBase}/api/cms/media/upload`, {
        method: 'POST', body: formData, credentials: 'include',
      });
      if (res.ok) loadImages();
    } catch { setError('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await fetch(`${apiBase}/api/cms/media/${encodeURIComponent(key)}`, { method: 'DELETE', credentials: 'include' });
      loadImages();
    } catch { setError('Delete failed'); }
  };

  const filteredImages = searchQuery
    ? images.filter(img => img.key.toLowerCase().includes(searchQuery.toLowerCase()))
    : images;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Media Library</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex gap-3 items-center">
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg" />
          <label className={`px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer font-medium ${uploading ? 'opacity-50' : ''}`}>
            {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : error ? (
            <div className="text-center text-red-500 p-8">{error}</div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center text-gray-500 p-12"><div className="text-4xl mb-2">🖼️</div><p>No images</p></div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredImages.map(image => (
                <div key={image.key} className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                  onClick={() => onSelectImage?.(image.url, image.key)}>
                  <img src={image.url} alt={image.key} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="truncate">{image.key.split('/').pop()}</div>
                    <div>{formatSize(image.size)}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(image.key); }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
