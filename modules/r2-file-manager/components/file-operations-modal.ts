/**
 * File Operations Modal Component
 * Create folder, rename, move, delete, media player, image preview, context menu.
 * Extracted from: boklifsins (production)
 */

export function getFileOperationsModalHTML(): string {
  return `
    <!-- Create Folder Modal -->
    <div class="file-modal-overlay" id="createFolderModal">
      <div class="file-modal">
        <div class="file-modal-header">
          <h3 class="file-modal-title">New folder</h3>
          <button class="file-modal-close" onclick="closeCreateFolderModal()">&times;</button>
        </div>
        <div class="file-modal-body">
          <label class="block text-sm font-medium mb-2">Folder name</label>
          <input type="text" id="newFolderName" class="w-full px-4 py-2 bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg" placeholder="Enter name..." autofocus>
        </div>
        <div class="file-modal-footer">
          <button class="btn btn-ghost" onclick="closeCreateFolderModal()">Cancel</button>
          <button class="btn btn-primary" onclick="createFolder()">Create</button>
        </div>
      </div>
    </div>

    <!-- Rename Modal -->
    <div class="file-modal-overlay" id="renameModal">
      <div class="file-modal">
        <div class="file-modal-header">
          <h3 class="file-modal-title">Rename</h3>
          <button class="file-modal-close" onclick="closeRenameModal()">&times;</button>
        </div>
        <div class="file-modal-body">
          <label class="block text-sm font-medium mb-2">New name</label>
          <input type="text" id="renameInput" class="w-full px-4 py-2 bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg">
          <input type="hidden" id="renameOriginalKey">
          <input type="hidden" id="renameIsFolder">
        </div>
        <div class="file-modal-footer">
          <button class="btn btn-ghost" onclick="closeRenameModal()">Cancel</button>
          <button class="btn btn-primary" onclick="renameFile()">Save</button>
        </div>
      </div>
    </div>

    <!-- Move Modal -->
    <div class="file-modal-overlay" id="moveModal">
      <div class="file-modal">
        <div class="file-modal-header">
          <h3 class="file-modal-title">Move files</h3>
          <button class="file-modal-close" onclick="closeMoveModal()">&times;</button>
        </div>
        <div class="file-modal-body">
          <p class="text-sm text-slate-500 mb-4" id="moveFileCount">1 file selected</p>
          <label class="block text-sm font-medium mb-2">Choose destination</label>
          <div class="folder-tree" id="folderTree"><div class="file-loading"><div class="file-loading-spinner"></div></div></div>
          <div class="mt-4">
            <label class="block text-sm font-medium mb-2">Or enter path</label>
            <input type="text" id="moveDestinationInput" class="w-full px-4 py-2 bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-lg" placeholder="e.g. uploads/2024/">
          </div>
          <input type="hidden" id="moveSourceKeys">
        </div>
        <div class="file-modal-footer">
          <button class="btn btn-ghost" onclick="closeMoveModal()">Cancel</button>
          <button class="btn btn-primary" onclick="moveFiles()">Move</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div class="file-modal-overlay" id="deleteModal">
      <div class="file-modal">
        <div class="file-modal-header">
          <h3 class="file-modal-title">Delete file</h3>
          <button class="file-modal-close" onclick="closeDeleteModal()">&times;</button>
        </div>
        <div class="file-modal-body">
          <div class="text-center mb-4">
            <div class="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
            <p id="deleteMessage">Are you sure you want to delete this file?</p>
            <p class="text-sm text-slate-500 mt-2">This cannot be undone.</p>
          </div>
          <input type="hidden" id="deleteKeys">
        </div>
        <div class="file-modal-footer">
          <button class="btn btn-ghost" onclick="closeDeleteModal()">Cancel</button>
          <button class="btn btn-danger" onclick="confirmDelete()">Delete</button>
        </div>
      </div>
    </div>

    <!-- Media Player Modal -->
    <div class="file-modal-overlay" id="mediaModal">
      <div class="file-modal" style="max-width: 800px; background: rgba(0,0,0,0.95);">
        <div class="file-modal-header">
          <h3 class="file-modal-title" id="mediaTitle">Player</h3>
          <button class="file-modal-close" onclick="closeMediaModal()">&times;</button>
        </div>
        <div class="file-modal-body" style="text-align: center;"><div id="mediaContainer"></div></div>
        <div class="file-modal-footer" style="justify-content: center;">
          <a id="mediaDownloadLink" href="#" download class="btn btn-primary">Download</a>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div class="file-modal-overlay" id="imagePreviewModal">
      <div class="file-modal" style="max-width: 90vw; max-height: 90vh; background: transparent; box-shadow: none; overflow: visible;">
        <button class="file-modal-close" style="position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.5); border-radius: 50%; width: 40px; height: 40px;" onclick="closeImagePreview()">&times;</button>
        <img id="previewImage" style="max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 8px;" alt="">
        <div style="text-align: center; margin-top: 16px;"><a id="imageDownloadLink" href="#" download class="btn btn-primary">Download</a></div>
      </div>
    </div>

    <!-- Context Menu -->
    <div class="file-context-menu" id="contextMenu">
      <div class="context-menu-item" onclick="contextMenuAction('open')">Open</div>
      <div class="context-menu-item" onclick="contextMenuAction('download')">Download</div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" onclick="contextMenuAction('rename')">Rename</div>
      <div class="context-menu-item" onclick="contextMenuAction('move')">Move</div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item danger" onclick="contextMenuAction('delete')">Delete</div>
    </div>
  `;
}

export function getFileOperationsModalJS(): string {
  return `
    let contextMenuTarget = null;
    let contextMenuIsFolder = false;

    function showCreateFolderModal() {
      document.getElementById('createFolderModal').classList.add('active');
      document.getElementById('newFolderName').value = '';
      document.getElementById('newFolderName').focus();
    }
    function closeCreateFolderModal() { document.getElementById('createFolderModal').classList.remove('active'); }

    async function createFolder() {
      const name = document.getElementById('newFolderName').value.trim();
      if (!name) return;
      try {
        const response = await fetch('/api/files/folder', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, prefix: state.currentPath }), credentials: 'include'
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Failed');
        closeCreateFolderModal();
        loadFiles();
      } catch (err) { alert('Error: ' + err.message); }
    }

    function showRenameModal(key, isFolder) {
      const name = key.split('/').filter(Boolean).pop();
      document.getElementById('renameInput').value = name;
      document.getElementById('renameOriginalKey').value = key;
      document.getElementById('renameIsFolder').value = isFolder;
      document.getElementById('renameModal').classList.add('active');
      document.getElementById('renameInput').select();
    }
    function closeRenameModal() { document.getElementById('renameModal').classList.remove('active'); }

    async function renameFile() {
      const newName = document.getElementById('renameInput').value.trim();
      const originalKey = document.getElementById('renameOriginalKey').value;
      const isFolder = document.getElementById('renameIsFolder').value === 'true';
      if (!newName) return;
      const parts = originalKey.split('/').filter(Boolean); parts.pop();
      let newKey = parts.length > 0 ? parts.join('/') + '/' + newName : newName;
      if (isFolder) newKey += '/';
      if (newKey === originalKey) { closeRenameModal(); return; }
      try {
        const response = await fetch('/api/files/move', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceKey: originalKey, destinationKey: newKey }), credentials: 'include'
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Failed');
        closeRenameModal(); loadFiles();
      } catch (err) { alert('Error: ' + err.message); }
    }

    function showMoveModal(keys) {
      if (!keys || keys.length === 0) keys = Array.from(state.selectedFiles);
      if (keys.length === 0) return;
      document.getElementById('moveSourceKeys').value = JSON.stringify(keys);
      document.getElementById('moveFileCount').textContent = keys.length + ' file(s) selected';
      document.getElementById('moveDestinationInput').value = state.currentPath;
      document.getElementById('moveModal').classList.add('active');
      loadFolderTree();
    }
    function closeMoveModal() { document.getElementById('moveModal').classList.remove('active'); }

    async function loadFolderTree() {
      const tree = document.getElementById('folderTree');
      tree.innerHTML = '<div class="file-loading"><div class="file-loading-spinner"></div></div>';
      try {
        const response = await fetch('/api/files/folders', { credentials: 'include' });
        const data = await response.json();
        let html = '<div class="folder-tree-item" onclick="selectMoveDestination(\\'\\')" data-path="">Root</div>';
        data.folders.forEach(folder => {
          const depth = folder.prefix.split('/').filter(Boolean).length - 1;
          html += '<div class="folder-tree-item" onclick="selectMoveDestination(\\'' + folder.prefix + '\\')" data-path="' + folder.prefix + '" style="padding-left: ' + (12 + depth * 16) + 'px">' + folder.name + '</div>';
        });
        tree.innerHTML = html;
      } catch (err) { tree.innerHTML = '<div class="text-red-400">Failed to load folders</div>'; }
    }

    function selectMoveDestination(path) {
      document.querySelectorAll('.folder-tree-item').forEach(item => item.classList.toggle('selected', item.dataset.path === path));
      document.getElementById('moveDestinationInput').value = path;
    }

    async function moveFiles() {
      const keys = JSON.parse(document.getElementById('moveSourceKeys').value);
      let destination = document.getElementById('moveDestinationInput').value.trim();
      if (destination && !destination.endsWith('/')) destination += '/';
      try {
        for (const sourceKey of keys) {
          const fileName = sourceKey.split('/').pop();
          const destinationKey = destination + fileName;
          if (sourceKey === destinationKey) continue;
          const response = await fetch('/api/files/move', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceKey, destinationKey }), credentials: 'include'
          });
          if (!response.ok) throw new Error((await response.json()).error || 'Failed to move ' + fileName);
        }
        closeMoveModal(); clearSelection(); loadFiles();
      } catch (err) { alert('Error: ' + err.message); }
    }

    function showDeleteConfirm(key) {
      const keys = key ? [key] : Array.from(state.selectedFiles);
      if (keys.length === 0) return;
      document.getElementById('deleteKeys').value = JSON.stringify(keys);
      document.getElementById('deleteMessage').textContent = keys.length === 1
        ? 'Are you sure you want to delete this file?'
        : 'Are you sure you want to delete ' + keys.length + ' files?';
      document.getElementById('deleteModal').classList.add('active');
    }
    function showBulkDeleteConfirm() { showDeleteConfirm(null); }
    function closeDeleteModal() { document.getElementById('deleteModal').classList.remove('active'); }

    async function confirmDelete() {
      const keys = JSON.parse(document.getElementById('deleteKeys').value);
      try {
        if (keys.length === 1) {
          const response = await fetch('/api/files/' + encodeURIComponent(keys[0]), { method: 'DELETE', credentials: 'include' });
          if (!response.ok) throw new Error('Delete failed');
        } else {
          const response = await fetch('/api/files/bulk-delete', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keys }), credentials: 'include'
          });
          if (!response.ok) throw new Error('Bulk delete failed');
        }
        closeDeleteModal(); clearSelection(); loadFiles();
      } catch (err) { alert('Error: ' + err.message); }
    }

    function downloadFile(key) {
      const url = '/api/files/stream/' + encodeURIComponent(key);
      const link = document.createElement('a'); link.href = url; link.download = key.split('/').pop(); link.click();
    }

    function playMedia(key, type) {
      const url = '/api/files/stream/' + encodeURIComponent(key);
      const fileName = key.split('/').pop();
      document.getElementById('mediaTitle').textContent = fileName;
      document.getElementById('mediaDownloadLink').href = url;
      document.getElementById('mediaDownloadLink').download = fileName;
      const container = document.getElementById('mediaContainer');
      if (type === 'video') {
        container.innerHTML = '<video controls autoplay playsinline style="max-width:100%; max-height:60vh; border-radius:8px;"><source src="' + url + '" type="video/mp4"></video>';
      } else {
        container.innerHTML = '<audio controls autoplay style="width:100%; max-width:500px;"><source src="' + url + '" type="audio/mpeg"></audio>';
      }
      document.getElementById('mediaModal').classList.add('active');
    }
    function closeMediaModal() {
      const c = document.getElementById('mediaContainer');
      const v = c.querySelector('video'); const a = c.querySelector('audio');
      if (v) v.pause(); if (a) a.pause(); c.innerHTML = '';
      document.getElementById('mediaModal').classList.remove('active');
    }

    function previewImage(key) {
      const url = '/api/files/stream/' + encodeURIComponent(key);
      document.getElementById('previewImage').src = url;
      document.getElementById('imageDownloadLink').href = url;
      document.getElementById('imageDownloadLink').download = key.split('/').pop();
      document.getElementById('imagePreviewModal').classList.add('active');
    }
    function closeImagePreview() {
      document.getElementById('previewImage').src = '';
      document.getElementById('imagePreviewModal').classList.remove('active');
    }

    function handleContextMenu(event, key, isFolder) {
      event.preventDefault();
      contextMenuTarget = key; contextMenuIsFolder = isFolder;
      const menu = document.getElementById('contextMenu');
      menu.style.left = event.pageX + 'px'; menu.style.top = event.pageY + 'px';
      menu.classList.add('active');
      setTimeout(() => document.addEventListener('click', closeContextMenu, { once: true }), 0);
    }
    function closeContextMenu() { document.getElementById('contextMenu').classList.remove('active'); }

    function contextMenuAction(action) {
      closeContextMenu();
      if (!contextMenuTarget) return;
      switch (action) {
        case 'open': contextMenuIsFolder ? navigateTo(contextMenuTarget) : (() => { const t = getFileType(contextMenuTarget); (t === 'video' || t === 'audio') ? playMedia(contextMenuTarget, t) : t === 'image' ? previewImage(contextMenuTarget) : downloadFile(contextMenuTarget); })(); break;
        case 'download': downloadFile(contextMenuTarget); break;
        case 'rename': showRenameModal(contextMenuTarget, contextMenuIsFolder); break;
        case 'move': showMoveModal([contextMenuTarget]); break;
        case 'delete': showDeleteConfirm(contextMenuTarget); break;
      }
    }

    function closeAllModals() {
      document.querySelectorAll('.file-modal-overlay').forEach(m => m.classList.remove('active'));
      closeContextMenu(); closeMediaModal();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (document.getElementById('createFolderModal').classList.contains('active')) createFolder();
        else if (document.getElementById('renameModal').classList.contains('active')) renameFile();
      }
    });
  `;
}
