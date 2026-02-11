/**
 * File Manager Client-Side JavaScript
 * State management, navigation, rendering, search, sort.
 * Extracted from: boklifsins (production)
 */

export function getFileManagerJS(): string {
  return `
    // State
    const state = {
      currentPath: '',
      files: [],
      folders: [],
      viewMode: localStorage.getItem('fm_view') || 'grid',
      sortBy: 'name',
      sortDir: 'asc',
      searchQuery: '',
      selectedFiles: new Set(),
      cursor: null,
      truncated: false,
      loading: false,
    };

    // Init
    document.addEventListener('DOMContentLoaded', () => {
      const params = new URLSearchParams(window.location.search);
      state.currentPath = params.get('path') || '';
      loadFiles();
      setupDropzone();
      updateViewToggle();
    });

    // Format file size
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Escape HTML for safe rendering
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function escapeForJs(text) { return text.replace(/'/g, "\\\\'"); }

    // Get file type from key
    function getFileType(key) {
      const ext = key.split('.').pop()?.toLowerCase() || '';
      if (['jpg','jpeg','png','gif','webp','svg','bmp','ico'].includes(ext)) return 'image';
      if (['mp4','webm','mov','avi'].includes(ext)) return 'video';
      if (['mp3','wav','ogg','m4a','aac'].includes(ext)) return 'audio';
      if (ext === 'pdf') return 'pdf';
      if (['doc','docx','xls','xlsx','ppt','pptx'].includes(ext)) return 'document';
      if (['zip','rar','7z','tar','gz'].includes(ext)) return 'archive';
      if (['js','ts','py','html','css','json','md','txt','xml','csv'].includes(ext)) return 'code';
      return 'file';
    }

    // Get file icon emoji
    function getFileIcon(key, isFolder) {
      if (isFolder) return '\\u{1F4C1}';
      const type = getFileType(key);
      const icons = {
        image: '\\u{1F5BC}', video: '\\u{1F3AC}', audio: '\\u{1F3B5}',
        pdf: '\\u{1F4C4}', document: '\\u{1F4DD}', archive: '\\u{1F4E6}',
        code: '\\u{1F4BB}', file: '\\u{1F4C4}'
      };
      return icons[type] || icons.file;
    }

    // Load files from API
    async function loadFiles(append = false) {
      if (state.loading) return;
      state.loading = true;

      const fileContainer = document.getElementById('fileContainer');
      if (!append) {
        fileContainer.innerHTML = '<div class="file-loading"><div class="file-loading-spinner"></div></div>';
      }

      try {
        const params = new URLSearchParams({ prefix: state.currentPath, limit: '50' });
        if (append && state.cursor) params.set('cursor', state.cursor);

        const response = await fetch('/api/files/list?' + params.toString(), { credentials: 'include' });
        const data = await response.json();

        if (!append) {
          state.files = [];
          state.folders = [];
        }

        if (data.folders) state.folders.push(...data.folders);
        if (data.objects) state.files.push(...data.objects.filter(o => !o.key.endsWith('/')));

        state.truncated = data.truncated;
        state.cursor = data.cursor;

        renderFiles();
        updateBreadcrumbs();
      } catch (err) {
        fileContainer.innerHTML = '<div class="file-empty"><div class="file-empty-icon">\\u{26A0}\\u{FE0F}</div><div class="file-empty-text">Failed to load files</div></div>';
      } finally {
        state.loading = false;
      }
    }

    // Render files based on view mode
    function renderFiles() {
      const container = document.getElementById('fileContainer');
      let items = [...state.folders.map(f => ({ ...f, isFolder: true })), ...state.files.map(f => ({ ...f, isFolder: false }))];

      // Search filter
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        items = items.filter(item => {
          const name = item.isFolder ? item.name : item.key.replace(state.currentPath, '');
          return name.toLowerCase().includes(q);
        });
      }

      // Sort
      items.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        let cmp = 0;
        if (state.sortBy === 'name') {
          const nameA = a.isFolder ? a.name : a.key.split('/').pop();
          const nameB = b.isFolder ? b.name : b.key.split('/').pop();
          cmp = nameA.localeCompare(nameB);
        } else if (state.sortBy === 'size') cmp = (a.size || 0) - (b.size || 0);
        else if (state.sortBy === 'date') cmp = new Date(a.uploaded || 0) - new Date(b.uploaded || 0);
        return state.sortDir === 'desc' ? -cmp : cmp;
      });

      if (items.length === 0) {
        container.innerHTML = '<div class="file-empty"><div class="file-empty-icon">\\u{1F4C2}</div><div class="file-empty-text">Empty folder</div><div class="file-empty-hint">Upload files or create a folder</div></div>';
        return;
      }

      if (state.viewMode === 'grid') renderGrid(container, items);
      else renderList(container, items);

      // Load more button
      if (state.truncated) {
        container.innerHTML += '<div style="text-align:center; padding:20px;"><button class="btn btn-ghost" onclick="loadFiles(true)">Load more...</button></div>';
      }
    }

    function renderGrid(container, items) {
      let html = '<div class="file-grid">';
      items.forEach(item => {
        const key = item.isFolder ? item.prefix : item.key;
        const name = item.isFolder ? item.name : item.key.replace(state.currentPath, '');
        const icon = getFileIcon(key, item.isFolder);
        const size = item.isFolder ? '' : formatFileSize(item.size || 0);
        const selected = state.selectedFiles.has(key) ? 'selected' : '';
        html += '<div class="file-card ' + selected + '" '
          + 'onclick="handleFileClick(event, \\'' + escapeForJs(key) + '\\', ' + item.isFolder + ')" '
          + 'oncontextmenu="handleContextMenu(event, \\'' + escapeForJs(key) + '\\', ' + item.isFolder + ')" '
          + 'ondblclick="' + (item.isFolder ? 'navigateTo(\\'' + escapeForJs(key) + '\\')' : 'openFile(\\'' + escapeForJs(key) + '\\')') + '">'
          + '<input type="checkbox" class="file-checkbox" ' + (selected ? 'checked' : '') + ' onclick="event.stopPropagation(); toggleSelect(\\'' + escapeForJs(key) + '\\')">'
          + '<div class="file-icon">' + icon + '</div>'
          + '<div class="file-name">' + escapeHtml(name) + '</div>'
          + (size ? '<div class="file-size">' + size + '</div>' : '')
          + '</div>';
      });
      html += '</div>';
      container.innerHTML = html;
    }

    function renderList(container, items) {
      let html = '<div class="file-list">';
      items.forEach(item => {
        const key = item.isFolder ? item.prefix : item.key;
        const name = item.isFolder ? item.name : item.key.replace(state.currentPath, '');
        const icon = getFileIcon(key, item.isFolder);
        const size = item.isFolder ? '-' : formatFileSize(item.size || 0);
        const date = item.uploaded ? new Date(item.uploaded).toLocaleDateString() : '-';
        const selected = state.selectedFiles.has(key) ? 'selected' : '';
        html += '<div class="file-row ' + selected + '" '
          + 'onclick="handleFileClick(event, \\'' + escapeForJs(key) + '\\', ' + item.isFolder + ')" '
          + 'oncontextmenu="handleContextMenu(event, \\'' + escapeForJs(key) + '\\', ' + item.isFolder + ')" '
          + 'ondblclick="' + (item.isFolder ? 'navigateTo(\\'' + escapeForJs(key) + '\\')' : 'openFile(\\'' + escapeForJs(key) + '\\')') + '">'
          + '<div class="file-icon">' + icon + '</div>'
          + '<div class="file-name">' + escapeHtml(name) + '</div>'
          + '<div class="file-size">' + size + '</div>'
          + '<div class="file-date">' + date + '</div>'
          + '<div><input type="checkbox" ' + (selected ? 'checked' : '') + ' onclick="event.stopPropagation(); toggleSelect(\\'' + escapeForJs(key) + '\\')" style="cursor:pointer"></div>'
          + '</div>';
      });
      html += '</div>';
      container.innerHTML = html;
    }

    // Navigation
    function navigateTo(prefix) {
      state.currentPath = prefix;
      state.selectedFiles.clear();
      state.cursor = null;
      window.history.pushState({}, '', '?path=' + encodeURIComponent(prefix));
      loadFiles();
    }

    function openFile(key) {
      const type = getFileType(key);
      if (type === 'image') previewImage(key);
      else if (type === 'video' || type === 'audio') playMedia(key, type);
      else downloadFile(key);
    }

    // Breadcrumbs
    function updateBreadcrumbs() {
      const bc = document.getElementById('breadcrumbs');
      if (!bc) return;
      const parts = state.currentPath.split('/').filter(Boolean);
      let html = '<span class="breadcrumb-item' + (!state.currentPath ? ' active' : '') + '" onclick="navigateTo(\\'\\')">Root</span>';
      let path = '';
      parts.forEach((part, i) => {
        path += part + '/';
        const isLast = i === parts.length - 1;
        html += '<span class="breadcrumb-sep">/</span>';
        html += '<span class="breadcrumb-item' + (isLast ? ' active' : '') + '" onclick="navigateTo(\\'' + escapeForJs(path) + '\\')">' + escapeHtml(part) + '</span>';
      });
      bc.innerHTML = html;
    }

    // Selection
    function toggleSelect(key) {
      if (state.selectedFiles.has(key)) state.selectedFiles.delete(key);
      else state.selectedFiles.add(key);
      renderFiles();
      updateSelectionBar();
    }

    function clearSelection() {
      state.selectedFiles.clear();
      renderFiles();
      updateSelectionBar();
    }

    function handleFileClick(event, key, isFolder) {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        toggleSelect(key);
      }
    }

    function updateSelectionBar() {
      let bar = document.getElementById('selectionBar');
      if (state.selectedFiles.size === 0) {
        if (bar) bar.remove();
        return;
      }
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'selectionBar';
        bar.className = 'selection-bar';
        document.getElementById('fileContainer').parentNode.insertBefore(bar, document.getElementById('fileContainer'));
      }
      bar.innerHTML = '<span>' + state.selectedFiles.size + ' selected</span>'
        + '<div style="display:flex; gap:8px;">'
        + '<button class="btn btn-ghost" style="color:white; border-color:white/30" onclick="showMoveModal()">Move</button>'
        + '<button class="btn btn-danger" onclick="showBulkDeleteConfirm()">Delete</button>'
        + '<button class="btn btn-ghost" style="color:white; border-color:white/30" onclick="clearSelection()">Cancel</button>'
        + '</div>';
    }

    // View toggle
    function toggleView(mode) {
      state.viewMode = mode;
      localStorage.setItem('fm_view', mode);
      renderFiles();
      updateViewToggle();
    }

    function updateViewToggle() {
      document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === state.viewMode);
      });
    }

    // Search
    function handleSearch(event) {
      state.searchQuery = event.target.value;
      renderFiles();
    }

    // Sort
    function handleSort(by) {
      if (state.sortBy === by) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortBy = by; state.sortDir = 'asc'; }
      renderFiles();
    }

    // Back navigation
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.search);
      state.currentPath = params.get('path') || '';
      loadFiles();
    });
  `;
}
