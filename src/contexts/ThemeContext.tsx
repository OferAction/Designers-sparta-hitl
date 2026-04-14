import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

export type ColorMode = "light" | "dark" | "system";

type ThemeContextValue = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  currentTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children, initialValue }: { children: React.ReactNode; initialValue?: ColorMode }) {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (initialValue) {
      return initialValue;
    }
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme as ColorMode;
    }
    return "light";
  });
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">(() => {
    if (colorMode === "dark") {
      return "dark";
    } else if (colorMode === "light") {
      return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const handler = () => {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        setColorMode(storedTheme as ColorMode);
        setCurrentTheme(storedTheme);
      } else {
        setColorMode("light");
        setCurrentTheme("light");
      }
    };
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }, []);

  useLayoutEffect(() => {
    const mediaWatcher = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      const isDark = colorMode === "dark" || ((!localStorage.getItem("theme") || colorMode === "system") && mediaWatcher.matches);
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("theme", colorMode);
      setCurrentTheme(isDark ? "dark" : "light");
    };

    handleMediaChange();
    mediaWatcher.addEventListener("change", handleMediaChange);
    return () => {
      mediaWatcher.removeEventListener("change", handleMediaChange);
    };
  }, [colorMode]);

  return <ThemeContext.Provider value={{ colorMode, setColorMode, currentTheme }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
