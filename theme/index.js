import { baseSemanticTokens, cssVarMap } from './tokens.js';
import { bondTheme } from './variants/bond.js';
import { deathBecomesHerTheme } from './variants/deathBecomesHer.js';
import { pinkPantherTheme } from './variants/pinkPanther.js';
import { retro80sTheme } from './variants/retro80s.js';

export const themeRegistry = {
  bond: bondTheme,
  deathBecomesHer: deathBecomesHerTheme,
  pinkPanther: pinkPantherTheme,
  retro80s: retro80sTheme,
};

export const defaultThemeName = 'bond';

export function resolveTheme(name) {
  const safe = name && themeRegistry[name] ? name : defaultThemeName;
  return { name: safe, tokens: { ...baseSemanticTokens, ...themeRegistry[safe] } };
}

export function applyThemeToDocument(themeName) {
  const root = document.documentElement;
  const resolved = resolveTheme(themeName);

  Object.keys(cssVarMap).forEach((key) => {
    root.style.setProperty(cssVarMap[key], resolved.tokens[key]);
  });
  root.setAttribute('data-theme', resolved.name);
}
