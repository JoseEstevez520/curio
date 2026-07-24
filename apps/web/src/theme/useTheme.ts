import { useCallback, useEffect, useState } from 'react';

/**
 * Light/dark theme, applied as `data-theme` on <html> so tokens.css's
 * `:root[data-theme='...']` overrides win over the `prefers-color-scheme` media query.
 * Initial value: `?theme=` URL override (handy for screenshots) → saved choice → system.
 */
export type Theme = 'light' | 'dark';

const KEY = 'curio.theme';

function getInitial(): Theme {
  if (typeof window === 'undefined') return 'light';
  const urlTheme = new URLSearchParams(window.location.search).get('theme');
  if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // private mode / quota — the choice just won't persist
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return [theme, toggle];
}
