"use client";
import { useEffect, useState } from "react";

// Retourne l'heure actuelle, mise à jour chaque minute.
// Vaut null pendant le rendu statique (build) : on ne connaît l'heure que dans le navigateur.
export function useMaintenant(intervalleMs = 60_000): Date | null {
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  useEffect(() => {
    const maj = () => setMaintenant(new Date());
    const premier = setTimeout(maj, 0);
    const id = setInterval(maj, intervalleMs);
    return () => {
      clearTimeout(premier);
      clearInterval(id);
    };
  }, [intervalleMs]);
  return maintenant;
}
