/**
 * File Manager CSS
 * Full styling for grid/list views, modals, context menu, upload zone.
 * Extracted from: boklifsins (production)
 */

export function getFileManagerCSS(): string {
  return `
    .file-manager { position: relative; }
    .breadcrumbs { display: flex; gap: 4px; align-items: center; font-size: 14px; flex-wrap: wrap; }
    .breadcrumb-item { color: #64748b; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: all 0.2s; }
    .breadcrumb-item:hover { color: #3b82f6; background: rgba(59,130,246,0.1); }
    .breadcrumb-item.active { color: #e2e8f0; font-weight: 600; cursor: default; }
    .breadcrumb-sep { color: #475569; font-size: 12px; }

    .file-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
    .file-toolbar .search-input { flex: 1; min-width: 200px; padding: 8px 16px; border: 1px solid #334155; border-radius: 8px; background: #1e293b; color: #e2e8f0; font-size: 14px; }
    .file-toolbar .search-input:focus { outline: none; border-color: #3b82f6; }

    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; }
    .btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }
    .btn-ghost:hover { background: #1e293b; color: #e2e8f0; }
    .btn-icon { padding: 8px; border-radius: 8px; background: transparent; border: 1px solid #334155; color: #94a3b8; cursor: pointer; }
    .btn-icon:hover { background: #1e293b; color: #e2e8f0; }
    .btn-icon.active { background: #3b82f6; color: white; border-color: #3b82f6; }

    /* Grid View */
    .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
    .file-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; text-align: center; position: relative; }
    .file-card:hover { background: #263347; border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .file-card.selected { border-color: #3b82f6; background: rgba(59,130,246,0.1); }
    .file-card .file-icon { font-size: 40px; margin-bottom: 8px; }
    .file-card .file-name { font-size: 13px; color: #e2e8f0; word-break: break-all; line-height: 1.3; }
    .file-card .file-size { font-size: 11px; color: #64748b; margin-top: 4px; }
    .file-card .file-checkbox { position: absolute; top: 8px; left: 8px; opacity: 0; transition: opacity 0.2s; }
    .file-card:hover .file-checkbox, .file-card.selected .file-checkbox { opacity: 1; }

    /* List View */
    .file-list { display: flex; flex-direction: column; gap: 2px; }
    .file-row { display: grid; grid-template-columns: 40px 1fr 100px 140px 40px; gap: 12px; align-items: center; padding: 10px 16px; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
    .file-row:hover { background: #1e293b; }
    .file-row.selected { background: rgba(59,130,246,0.1); }
    .file-row .file-icon { font-size: 24px; text-align: center; }
    .file-row .file-name { font-size: 14px; color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-row .file-size { font-size: 13px; color: #64748b; text-align: right; }
    .file-row .file-date { font-size: 13px; color: #64748b; }

    /* Modal */
    .file-modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .file-modal-overlay.active { display: flex; }
    .file-modal { background: #1e293b; border: 1px solid #334155; border-radius: 16px; max-width: 500px; width: 90%; max-height: 80vh; overflow: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    .file-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #334155; }
    .file-modal-title { font-size: 18px; font-weight: 600; color: #e2e8f0; }
    .file-modal-close { background: none; border: none; color: #64748b; font-size: 24px; cursor: pointer; padding: 4px 8px; border-radius: 8px; }
    .file-modal-close:hover { background: #334155; color: #e2e8f0; }
    .file-modal-body { padding: 24px; }
    .file-modal-footer { padding: 16px 24px; border-top: 1px solid #334155; display: flex; justify-content: flex-end; gap: 8px; }

    /* Upload Zone */
    .upload-zone { border: 2px dashed #334155; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .upload-zone:hover, .upload-zone.drag-over { border-color: #3b82f6; background: rgba(59,130,246,0.05); }
    .upload-zone-icon { font-size: 48px; margin-bottom: 12px; }
    .upload-zone-text { font-size: 16px; color: #e2e8f0; margin-bottom: 4px; }
    .upload-zone-hint { font-size: 13px; color: #64748b; }
    .upload-progress-item { display: flex; gap: 12px; align-items: center; padding: 12px; margin-top: 8px; background: #0f172a; border-radius: 8px; }
    .upload-progress-item.complete { background: rgba(34,197,94,0.1); }
    .upload-progress-item.error { background: rgba(239,68,68,0.1); }
    .upload-progress-bar { height: 4px; background: #334155; border-radius: 4px; overflow: hidden; margin-top: 4px; }
    .upload-progress-bar-fill { height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.3s; }

    /* Context Menu */
    .file-context-menu { display: none; position: absolute; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 4px; min-width: 180px; z-index: 1001; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .file-context-menu.active { display: block; }
    .context-menu-item { padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; color: #e2e8f0; transition: background 0.15s; }
    .context-menu-item:hover { background: #334155; }
    .context-menu-item.danger { color: #ef4444; }
    .context-menu-item.danger:hover { background: rgba(239,68,68,0.1); }
    .context-menu-divider { height: 1px; background: #334155; margin: 4px 0; }

    /* Folder Tree */
    .folder-tree { max-height: 200px; overflow-y: auto; border: 1px solid #334155; border-radius: 8px; }
    .folder-tree-item { padding: 8px 12px; cursor: pointer; font-size: 14px; color: #94a3b8; transition: all 0.15s; }
    .folder-tree-item:hover { background: #1e293b; color: #e2e8f0; }
    .folder-tree-item.selected { background: rgba(59,130,246,0.15); color: #3b82f6; }

    /* Loading */
    .file-loading { display: flex; justify-content: center; padding: 40px; }
    .file-loading-spinner { width: 32px; height: 32px; border: 3px solid #334155; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty state */
    .file-empty { text-align: center; padding: 60px 20px; color: #64748b; }
    .file-empty-icon { font-size: 48px; margin-bottom: 12px; }
    .file-empty-text { font-size: 16px; margin-bottom: 4px; }
    .file-empty-hint { font-size: 13px; }

    /* Selection bar */
    .selection-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #1e40af; border-radius: 8px; margin-bottom: 12px; color: white; font-size: 14px; }

    /* Responsive */
    @media (max-width: 640px) {
      .file-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
      .file-row { grid-template-columns: 32px 1fr 80px 32px; }
      .file-row .file-date { display: none; }
    }
  `;
}
