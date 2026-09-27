import React, { useEffect, useState } from 'react';
import { Moon, Sun, Wheat } from 'lucide-react';

const STORAGE_KEY = 'nirdhoom-theme';
export type ThemeMode = 'dark' | 'kisan' | 'light';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'kisan';
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode;
      if (stored === 'light' || stored === 'dark' || stored === 'kisan') return stored;
    } catch {
      // ignore storage error
    }
    return 'kisan';
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
      const colorMap: Record<ThemeMode, string> = {
        kisan: '#0d130a',
        dark: '#03060f',
        light: '#f5f8f3',
      };
      meta.setAttribute('content', colorMap[theme]);
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme((current) => {
      if (current === 'kisan') return 'dark';
      if (current === 'dark') return 'light';
      return 'kisan';
    });
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-slate-900/90 hover:bg-slate-800 text-amber-300 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-bold font-mono"
      title={`Current Theme: ${theme.toUpperCase()} (Click to Cycle: Kisan Vibe → Night Sky → Daylight)`}
      aria-label="Toggle theme"
    >
      {theme === 'kisan' && (
        <>
          <Wheat className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span className="hidden sm:inline text-amber-300 font-semibold">Kisan Gold</span>
        </>
      )}
      {theme === 'dark' && (
        <>
          <Moon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-cyan-300 font-semibold">Night Sky</span>
        </>
      )}
      {theme === 'light' && (
        <>
          <Sun className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline text-emerald-700 font-semibold">Daylight</span>
        </>
      )}
    </button>
  );
};
