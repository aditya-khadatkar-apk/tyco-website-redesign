import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Track themes per scope so two independent providers don't conflict
const scopeThemes: Record<string, Theme> = {};

function applyDocumentTheme() {
  const isDark = Object.values(scopeThemes).some(t => t === 'dark');
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeProvider({
  children,
  storageKey,
}: {
  children: React.ReactNode;
  storageKey: string;
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return (saved as Theme) || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    scopeThemes[storageKey] = theme;
    try {
      localStorage.setItem(storageKey, theme);
    } catch { /* ignore */ }
    applyDocumentTheme();

    return () => {
      delete scopeThemes[storageKey];
      applyDocumentTheme();
    };
  }, [theme, storageKey]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
