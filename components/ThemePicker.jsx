import React from 'react';

const themes = [
  { id: 'bond', label: 'Bond' },
  { id: 'deathBecomesHer', label: 'Death Becomes Her' },
  { id: 'pinkPanther', label: 'Pink Panther' },
  { id: 'retro80s', label: '80s Retro' },
];

export function ThemePicker({ activeTheme, onSelectTheme }) {
  return (
    <div role="group" aria-label="Veldu útlitsþema">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          className={`theme-chip ${activeTheme === theme.id ? 'active' : ''}`}
          onClick={() => onSelectTheme(theme.id)}
        >
          {theme.label}
        </button>
      ))}
    </div>
  );
}
