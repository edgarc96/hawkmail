"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Determine initial theme based on pathname
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  
  const isPublicPage = window.location.pathname === '/' ||
    window.location.pathname === '/login' ||
    window.location.pathname === '/register';

  return isPublicPage ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
  const [mounted, setMounted] = useState(false);

  // Apply theme immediately on mount
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync theme on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const isPublicPage = window.location.pathname === '/' ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/register';
      
      const newTheme = isPublicPage ? 'light' : 'dark';
      setThemeState(newTheme);
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}