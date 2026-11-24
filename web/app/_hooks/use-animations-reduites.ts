"use client";
import { useSyncExternalStore } from "react";

const requete = "(prefers-reduced-motion: reduce)";

function abonner(prevenir: () => void) {
  const media = window.matchMedia(requete);
  media.addEventListener("change", prevenir);
  return () => media.removeEventListener("change", prevenir);
}

// Vrai si le système demande de réduire les animations (ex. « Effets d'animation » désactivés dans Windows).
export function useAnimationsReduites() {
  return useSyncExternalStore(abonner, () => window.matchMedia(requete).matches, () => false);
}
