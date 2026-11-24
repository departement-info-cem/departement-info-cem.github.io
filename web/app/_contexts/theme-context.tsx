"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Context du thème clair / sombre (structure vue en 4W6 : déclaration, provider, intégration).
// La préférence « systeme » suit le réglage du système d'exploitation, même s'il change pendant la visite.
type Theme = "clair" | "sombre";
export type Preference = Theme | "systeme";
type ThemeContextType = { theme: Theme; preference: Preference; choisir: (preference: Preference) => void };

export const ThemeContext = createContext<ThemeContextType>({ theme: "clair", preference: "systeme", choisir: () => {} });

const SYSTEME_SOMBRE = "(prefers-color-scheme: dark)";

// Pas de valeur enregistrée = suivre le système (c'est aussi ce que fait le script dans layout.tsx).
// L'ancien site Angular, sur le même domaine, enregistrait la valeur entre guillemets.
function lirePreference(): Preference {
  try {
    const valeur = localStorage.getItem("theme")?.replaceAll('"', "");
    return valeur === "clair" || valeur === "sombre" ? valeur : "systeme";
  } catch {
    return "systeme";
  }
}

function appliquer(sombre: boolean): Theme {
  document.documentElement.classList.toggle("dark", sombre);
  return sombre ? "sombre" : "clair";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("clair");
  const [preference, setPreference] = useState<Preference>("systeme");

  // Au chargement : le script dans layout.tsx a déjà posé la classe .dark au besoin.
  useEffect(() => {
    const id = setTimeout(() => {
      setPreference(lirePreference());
      setTheme(document.documentElement.classList.contains("dark") ? "sombre" : "clair");
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (preference !== "systeme") return;
    const requete = matchMedia(SYSTEME_SOMBRE);
    const suivre = () => setTheme(appliquer(requete.matches));
    requete.addEventListener("change", suivre);
    return () => requete.removeEventListener("change", suivre);
  }, [preference]);

  function choisir(nouvelle: Preference) {
    setPreference(nouvelle);
    setTheme(appliquer(nouvelle === "sombre" || (nouvelle === "systeme" && matchMedia(SYSTEME_SOMBRE).matches)));
    try {
      if (nouvelle === "systeme") localStorage.removeItem("theme");
      else localStorage.setItem("theme", nouvelle);
    } catch {}
  }

  return <ThemeContext.Provider value={{ theme, preference, choisir }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
