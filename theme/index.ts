import { baseSemanticTokens, cssVarMap, type SemanticThemeTokens, type ThemeName } from './tokens';
import { bondTheme } from './variants/bond';
import { deathBecomesHerTheme } from './variants/deathBecomesHer';
import { pinkPantherTheme } from './variants/pinkPanther';
import { retro80sTheme } from './variants/retro80s';

export const themeRegistry: Record<ThemeName, SemanticThemeTokens> = {
  bond: bondTheme,
  deathBecomesHer: deathBecomesHerTheme,
  pinkPanther: pinkPantherTheme,
  retro80s: retro80sTheme,
};

export const defaultThemeName: ThemeName = 'bond';

export function resolveTheme(name?: string): { name: ThemeName; tokens: SemanticThemeTokens } {
  const valid = (name && name in themeRegistry ? (name as ThemeName) : defaultThemeName);
  return {
    name: valid,
    tokens: { ...baseSemanticTokens, ...themeRegistry[valid] },
  };
}

export function applyThemeToDocument(themeName: ThemeName): void {
  const root = document.documentElement;
  const resolved = resolveTheme(themeName);

  (Object.keys(cssVarMap) as Array<keyof SemanticThemeTokens>).forEach((key) => {
    root.style.setProperty(cssVarMap[key], resolved.tokens[key]);
  });
  root.setAttribute('data-theme', resolved.name);
}
