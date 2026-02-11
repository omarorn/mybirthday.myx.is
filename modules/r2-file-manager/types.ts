// R2 File Manager Types

export interface FileItem {
  key: string;
  size: number;
  uploaded: string;
  httpMetadata?: {
    contentType?: string;
  };
  customMetadata?: Record<string, string>;
}

export interface FolderItem {
  prefix: string;
  name: string;
}

export interface ListFilesResponse {
  objects: FileItem[];
  folders: FolderItem[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes?: string[];
}

export interface UploadResponse {
  success: boolean;
  key: string;
  size: number;
}

export interface FileManagerState {
  currentPath: string;
  viewMode: 'grid' | 'list';
  selectedFiles: Set<string>;
  files: FileItem[];
  folders: FolderItem[];
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  searchQuery: string;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}
