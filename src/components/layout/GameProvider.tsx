'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface GamePreferences {
  soundEnabled: boolean;
  reducedMotion: boolean;
  theme: 'light' | 'dark';
  toggleSound: () => void;
  setReducedMotion: (value: boolean) => void;
  toggleTheme: () => void;
}

const GamePreferencesContext = createContext<GamePreferences | null>(null);

const SOUND_KEY = 'gti-sound';
const THEME_KEY = 'gti-theme';
const MOTION_KEY = 'gti-reduced-motion';

export function useGamePreferences(): GamePreferences {
  const ctx = useContext(GamePreferencesContext);
  if (!ctx) throw new Error('useGamePreferences must be used within GameProvider');
  return ctx;
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function initialSound(): boolean {
  if (typeof window === 'undefined') return true;
  return (readStored(SOUND_KEY) ?? '1') === '1';
}

function initialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = readStored(THEME_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

function initialReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = readStored(MOTION_KEY);
  if (stored !== null) return stored === '1';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(initialSound);
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [reducedMotion, setReducedMotionState] = useState(initialReducedMotion);

  // Reflect theme + reduced motion on <html> for CSS hooks and persist choices.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('reduce-motion', reducedMotion);
    try {
      window.localStorage.setItem(SOUND_KEY, soundEnabled ? '1' : '0');
      window.localStorage.setItem(THEME_KEY, theme);
      window.localStorage.setItem(MOTION_KEY, reducedMotion ? '1' : '0');
    } catch {
      /* storage unavailable (private mode) — preferences just won't persist */
    }
  }, [soundEnabled, theme, reducedMotion]);

  const toggleSound = useCallback(() => setSoundEnabled((v) => !v), []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
  const setReducedMotion = useCallback((value: boolean) => setReducedMotionState(value), []);

  const value = useMemo(
    () => ({ soundEnabled, reducedMotion, theme, toggleSound, setReducedMotion, toggleTheme }),
    [soundEnabled, reducedMotion, theme, toggleSound, setReducedMotion, toggleTheme],
  );

  return <GamePreferencesContext.Provider value={value}>{children}</GamePreferencesContext.Provider>;
}
