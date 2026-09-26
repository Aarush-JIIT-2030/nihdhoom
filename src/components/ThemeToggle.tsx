import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'nirdhoom-theme';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // ignore storage error
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#03060f' : '#f4f9f7');
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-1.5 rounded-lg border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-all cursor-pointer shadow-sm flex items-center justify-center"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
      ) : (
        <Moon className="w-4 h-4 text-emerald-600" />
      )}
    </button>
  );
};
