/**
 * Upload Modal Component
 * Drag & drop upload with progress bars and queue management.
 * Extracted from: boklifsins (production)
 */

export function getUploadModalHTML(): string {
  return `
    <div class="file-modal-overlay" id="uploadModal">
      <div class="file-modal" style="max-width: 600px;">
        <div class="file-modal-header">
          <h3 class="file-modal-title">Hla&eth;a upp skr&aacute;m</h3>
          <button class="file-modal-close" onclick="closeUploadModal()">&times;</button>
        </div>
        <div class="file-modal-body">
          <div class="upload-zone" id="uploadDropzone">
            <div class="upload-zone-icon">&#x1F4E4;</div>
            <div class="upload-zone-text">Drag&eth;u skr&aacute;r hinga&eth;</div>
            <div class="upload-zone-hint">e&eth;a smelltu til a&eth; velja</div>
            <input type="file" id="uploadInput" multiple style="display:none">
          </div>
          <div class="upload-progress-list" id="uploadProgressList"></div>
        </div>
        <div class="file-modal-footer">
          <button class="btn btn-ghost" onclick="closeUploadModal()">Loka</button>
        </div>
      </div>
    </div>
  `;
}

export function getUploadModalJS(): string {
  return `
    const uploadState = { queue: [], uploading: false, completed: 0, failed: 0 };

    function showUploadModal() {
      document.getElementById('uploadModal').classList.add('active');
      document.getElementById('uploadProgressList').innerHTML = '';
      uploadState.queue = [];
      uploadState.completed = 0;
      uploadState.failed = 0;
    }

    function closeUploadModal() {
      document.getElementById('uploadModal').classList.remove('active');
      if (uploadState.completed > 0) loadFiles();
    }

    function setupDropzone() {
      const modal = document.getElementById('uploadModal');
      const dropzone = document.getElementById('uploadDropzone');
      const input = document.getElementById('uploadInput');
      if (!dropzone) return;

      dropzone.addEventListener('click', () => input.click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
      dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
      input.addEventListener('change', (e) => { handleFiles(e.target.files); e.target.value = ''; });

      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.addEventListener('dragover', (e) => { e.preventDefault(); if (!modal.classList.contains('active')) showUploadModal(); });
        mainContent.addEventListener('drop', (e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) {
            if (!modal.classList.contains('active')) showUploadModal();
            handleFiles(e.dataTransfer.files);
          }
        });
      }
    }

    async function handleFiles(files) {
      const progressList = document.getElementById('uploadProgressList');
      for (const file of files) {
        const id = 'upload-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const fileSize = formatFileSize(file.size);
        const fileIcon = getFileIcon(file.name, false);
        progressList.innerHTML += '<div class="upload-progress-item" id="' + id + '">' +
          '<div class="file-icon">' + fileIcon + '</div>' +
          '<div class="file-info">' +
            '<div class="file-name">' + escapeHtml(file.name) + '</div>' +
            '<div class="upload-progress-bar"><div class="upload-progress-bar-fill" style="width: 0%"></div></div>' +
            '<div class="upload-progress-status">' + fileSize + '</div>' +
          '</div></div>';
        uploadState.queue.push({ id, file });
      }
      processUploadQueue();
    }

    async function processUploadQueue() {
      if (uploadState.uploading || uploadState.queue.length === 0) return;
      uploadState.uploading = true;
      while (uploadState.queue.length > 0) {
        const { id, file } = uploadState.queue.shift();
        await uploadFile(id, file);
      }
      uploadState.uploading = false;
    }

    async function uploadFile(id, file) {
      const item = document.getElementById(id);
      if (!item) return;
      const progressBar = item.querySelector('.upload-progress-bar-fill');
      const statusText = item.querySelector('.upload-progress-status');

      try {
        statusText.textContent = 'Uploading...';
        const formData = new FormData();
        formData.append('file', file);
        const key = state.currentPath + file.name;
        formData.append('key', key);

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              progressBar.style.width = percent + '%';
              statusText.textContent = percent + '%';
            }
          });
          xhr.addEventListener('load', () => xhr.status < 300 ? resolve(xhr.response) : reject(new Error('Upload failed')));
          xhr.addEventListener('error', () => reject(new Error('Network error')));
          xhr.open('POST', '/api/upload');
          xhr.send(formData);
        });

        progressBar.style.width = '100%';
        statusText.textContent = 'Done';
        item.classList.add('complete');
        uploadState.completed++;
      } catch (err) {
        statusText.textContent = 'Failed';
        item.classList.add('error');
        uploadState.failed++;
      }
    }
  `;
}
