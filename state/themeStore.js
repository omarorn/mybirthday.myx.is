export const STORAGE_KEY = 'myx-family-theme';
export const DEFAULT_THEME = 'bond';

export function getStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'bond' || value === 'deathBecomesHer' || value === 'pinkPanther' || value === 'retro80s') {
      return value;
    }
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
