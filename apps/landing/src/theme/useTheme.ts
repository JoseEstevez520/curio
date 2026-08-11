import { useCallback, useEffect, useState } from 'react';

/**
 * Light/dark theme, applied as `data-theme` on <html> so tokens.css's
 * `:root[data-theme='dark']` override wins. Unlike the app, this defaults to light regardless
 * of system preference — a saved choice or `?theme=` override are the only ways to start dark.
 */
export type Theme = 'light' | 'dark';

const KEY = 'curio.landing.theme';

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
  return 'light';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.add('theme-switching');
    if (theme === 'dark') el.dataset.theme = 'dark';
    else delete el.dataset.theme;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => el.classList.remove('theme-switching')),
    );
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // private mode / quota — the choice just won't persist
    }
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return [theme, toggle];
}
