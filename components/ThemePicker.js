export const THEME_OPTIONS = [
  { id: 'bond', label: 'Bond' },
  { id: 'deathBecomesHer', label: 'Death Becomes Her' },
  { id: 'pinkPanther', label: 'Pink Panther' },
  { id: 'retro80s', label: '80s Retro' },
];

export function renderThemePicker(container, activeTheme, onSelect) {
  if (!container) return;
  container.innerHTML = THEME_OPTIONS.map((theme) => {
    const active = theme.id === activeTheme ? ' active' : '';
    return `<button type="button" class="theme-chip${active}" data-theme-select="${theme.id}">${theme.label}</button>`;
  }).join('');

  container.querySelectorAll('[data-theme-select]').forEach((button) => {
    button.addEventListener('click', () => onSelect(button.getAttribute('data-theme-select')));
  });
}
