import type { ThemeName } from '../theme/tokens';
import { defaultThemeName } from '../theme';

const STORAGE_KEY = 'myx-family-theme';

export function getStoredTheme(): ThemeName {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'bond' || value === 'deathBecomesHer' || value === 'pinkPanther' || value === 'retro80s') {
      return value;
    }
  } catch {
    // ignore localStorage failures and fall back
  }
  return defaultThemeName;
}

export function setStoredTheme(theme: ThemeName): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore localStorage failures
  }
}

export function clearStoredTheme(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore localStorage failures
  }
}
