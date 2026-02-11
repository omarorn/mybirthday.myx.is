/**
 * R2 File Manager Component Library
 * Extracted from: boklifsins (production)
 *
 * Exports all file manager components for use in HTML pages.
 * Uses server-side HTML generation pattern (Cloudflare Workers).
 */

export { getFileManagerCSS } from './file-manager-css';
export { getFileManagerJS } from './file-manager-js';
export { getUploadModalHTML, getUploadModalJS } from './upload-modal';
export { getFileOperationsModalHTML, getFileOperationsModalJS } from './file-operations-modal';

import { getFileManagerCSS } from './file-manager-css';
import { getFileManagerJS } from './file-manager-js';
import { getUploadModalHTML, getUploadModalJS } from './upload-modal';
import { getFileOperationsModalHTML, getFileOperationsModalJS } from './file-operations-modal';

/**
 * Get complete file manager bundle — drop this into any page.
 * Returns all CSS, HTML modals, and JavaScript needed.
 */
export function getFileManagerBundle(): {
  css: string;
  modals: string;
  js: string;
} {
  return {
    css: getFileManagerCSS(),
    modals: getUploadModalHTML() + getFileOperationsModalHTML(),
    js: getFileManagerJS() + getUploadModalJS() + getFileOperationsModalJS(),
  };
}
