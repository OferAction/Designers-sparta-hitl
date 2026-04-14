import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

// HQ theme is fully independent from the Portal theme.
// Mechanism mirrors the Portal: toggle a CSS class on <html>.
//   dark           → no class
//   light (default) → .hq-light on <html>
// CSS scoping in .hq-layout ensures these classes never affect Portal pages.

type HQTheme = 'dark' | 'light';

interface HQThemeContextValue {
  theme: HQTheme;
  toggle: () => void;
}

const HQThemeContext = createContext<HQThemeContextValue>({ theme: 'light', toggle: () => {} });

function applyTheme(theme: HQTheme) {
  document.documentElement.classList.toggle('hq-light', theme === 'light');
}

export function HQThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<HQTheme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('hq-theme') as HQTheme | null;
    const initial = stored ?? 'light';
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next: HQTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('hq-theme', next);
  }

  return (
    <HQThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </HQThemeContext.Provider>
  );
}

export const useHQTheme = () => useContext(HQThemeContext);

// ActOne panel open state + cross-panel blur coordination
interface HQActOneContextValue {
  actoneOpen: boolean;
  setActoneOpen: (open: boolean) => void;
  registerActOneBlur: (fn: () => void) => void;
  blurActOneInput: () => void;
}

const HQActOneContext = createContext<HQActOneContextValue>({
  actoneOpen: false,
  setActoneOpen: () => {},
  registerActOneBlur: () => {},
  blurActOneInput: () => {},
});

export function HQActOneProvider({ children }: { children: ReactNode }) {
  const [actoneOpen, setActoneOpen] = useState(false);
  const blurFnRef = useRef<() => void>(() => {});

  function registerActOneBlur(fn: () => void) {
    blurFnRef.current = fn;
  }

  function blurActOneInput() {
    blurFnRef.current();
  }

  return (
    <HQActOneContext.Provider value={{ actoneOpen, setActoneOpen, registerActOneBlur, blurActOneInput }}>
      {children}
    </HQActOneContext.Provider>
  );
}

export const useHQActOne = () => useContext(HQActOneContext);

// Role context — tracks which role the reviewer is currently acting as
import type { SpartaRole } from '@/hq/types';

interface HQRoleContextValue {
  roleFilter: SpartaRole;
  setRoleFilter: (role: SpartaRole) => void;
}

const HQRoleContext = createContext<HQRoleContextValue>({
  roleFilter: 'approver',
  setRoleFilter: () => {},
});

export function HQRoleProvider({ children }: { children: ReactNode }) {
  const [roleFilter, setRoleFilter] = useState<SpartaRole>('approver');
  return (
    <HQRoleContext.Provider value={{ roleFilter, setRoleFilter }}>
      {children}
    </HQRoleContext.Provider>
  );
}

export const useHQRole = () => useContext(HQRoleContext);
