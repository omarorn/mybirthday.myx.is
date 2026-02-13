export type ThemeName = 'bond' | 'deathBecomesHer' | 'pinkPanther' | 'retro80s';

export interface SemanticThemeTokens {
  bg: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textMuted: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryText: string;
  secondary: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  shadow: string;
  glow: string;
  gradient: string;
}

export const baseSemanticTokens: SemanticThemeTokens = {
  bg: '#0f1115',
  surface: '#191c22',
  surfaceHover: '#232833',
  text: '#f3f4f6',
  textMuted: '#b1b8c7',
  border: '#2a303d',
  borderLight: '#3a4356',
  primary: '#d4af37',
  primaryText: '#0b0d11',
  secondary: '#6b7280',
  accent: '#e5c76b',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  shadow: 'rgba(0, 0, 0, 0.45)',
  glow: 'rgba(212, 175, 55, 0.24)',
  gradient: 'linear-gradient(160deg, rgba(212, 175, 55, 0.14), rgba(17, 24, 39, 0.9))',
};

export const cssVarMap: Record<keyof SemanticThemeTokens, string> = {
  bg: '--bg',
  surface: '--surface',
  surfaceHover: '--surface-hover',
  text: '--text',
  textMuted: '--text-muted',
  border: '--border',
  borderLight: '--border-light',
  primary: '--primary',
  primaryText: '--primary-text',
  secondary: '--secondary',
  accent: '--accent',
  danger: '--danger',
  success: '--success',
  warning: '--warning',
  shadow: '--shadow',
  glow: '--glow',
  gradient: '--gradient',
};
