"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Context du thème clair / sombre (structure vue en 4W6 : déclaration, provider, intégration).
type Theme = "clair" | "sombre";
type ThemeContextType = { theme: Theme; basculer: () => void };

export const ThemeContext = createContext<ThemeContextType>({ theme: "clair", basculer: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("clair");

  // Au chargement : le script dans layout.tsx a déjà posé la classe .dark au besoin.
  useEffect(() => {
    const id = setTimeout(() => setTheme(document.documentElement.classList.contains("dark") ? "sombre" : "clair"), 0);
    return () => clearTimeout(id);
  }, []);

  function basculer() {
    const nouveau: Theme = theme === "clair" ? "sombre" : "clair";
    setTheme(nouveau);
    document.documentElement.classList.toggle("dark", nouveau === "sombre");
    localStorage.setItem("theme", nouveau);
  }

  return <ThemeContext.Provider value={{ theme, basculer }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
