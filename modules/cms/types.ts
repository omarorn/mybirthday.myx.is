// CMS Module Types

export interface CMSSection {
  id: number;
  section_key: string;
  section_name: string;
  section_type: string;
  content_json: Record<string, unknown>;
  version: number;
  is_published: boolean;
  updated_by: string;
  updated_at: string;
  created_at: string;
}

export interface CMSImage {
  id: number;
  image_key: string;
  image_name: string;
  image_url: string;
  image_type: 'icon' | 'photo' | 'video' | 'background';
  section_key?: string;
  alt_text?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CMSSectionHistory {
  id: number;
  section_key: string;
  version: number;
  content_json: Record<string, unknown>;
  updated_by: string;
  change_summary?: string;
  created_at: string;
}

export interface MarkdownFile {
  path: string;
  content: string;
  version: number;
  updated_by: string;
  updated_at: string;
}

export interface HeroVideoSlide {
  id: string;
  label: string;
  desktop: { mp4: string; webm?: string };
  mobile: { mp4: string; webm?: string };
  thumbnail?: string;
  duration?: number;
}

export interface HeroSlideshowConfig {
  slides: HeroVideoSlide[];
  crossfadeDuration?: number;
  autoAdvance?: boolean;
  showThumbnails?: boolean;
}
