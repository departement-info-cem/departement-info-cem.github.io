"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { CalendrierScolaire } from "@/app/_types/divers";

// Le calendrier scolaire, accessible partout (les statuts « disponible maintenant » tiennent compte des congés).
const ScolaireContext = createContext<CalendrierScolaire | undefined>(undefined);

export function ScolaireProvider({ calendrier, children }: { calendrier: CalendrierScolaire; children: ReactNode }) {
  return <ScolaireContext.Provider value={calendrier}>{children}</ScolaireContext.Provider>;
}

export function useScolaire(): CalendrierScolaire {
  const contexte = useContext(ScolaireContext);
  if (!contexte) throw new Error("useScolaire doit être utilisé dans un ScolaireProvider");
  return contexte;
}
