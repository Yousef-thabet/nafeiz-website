import { useEffect, useState, useCallback } from 'react';

const THEME_KEY = 'nafeiz_theme';

function isTheme(value) {
  return value === 'light' || value === 'dark';
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY);
  return isTheme(stored) ? stored : getSystemTheme();
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.dispatchEvent(new CustomEvent('nafeiz-theme-change', { detail: theme }));
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (isTheme(event.detail)) setThemeState(event.detail);
    };
    const handleSystemChange = (event) => {
      if (!isTheme(localStorage.getItem(THEME_KEY))) setThemeState(event.matches ? 'dark' : 'light');
    };
    const handleStorageChange = (event) => {
      if (event.key === THEME_KEY) setThemeState(isTheme(event.newValue) ? event.newValue : getSystemTheme());
    };
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    window.addEventListener('nafeiz-theme-change', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    media.addEventListener('change', handleSystemChange);
    return () => {
      window.removeEventListener('nafeiz-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
      media.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const setTheme = useCallback((nextTheme) => {
    if (!isTheme(nextTheme)) return;
    localStorage.setItem(THEME_KEY, nextTheme);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((previousTheme) => {
      const nextTheme = previousTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  return { theme, toggleTheme, setTheme };
}
