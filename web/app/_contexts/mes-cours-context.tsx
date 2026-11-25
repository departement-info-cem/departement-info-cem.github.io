"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useStockageLocal } from "@/app/_hooks/use-stockage-local";
import type { Plage } from "@/app/_types/prof";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { construireCalendrier } from "@/lib/calendrier";
import { basculer, court, estPerime, evenementsPourMoi, lienAvecMoi, memeChoix, nettoyer, type DonneesMesCours, type Lien, type MonCours } from "@/lib/mes-cours";

// « Mes cours » de l'étudiant, partagés par toute la page : choisir un groupe met à jour la liste des profs,
// la page Locaux et le bandeau sans recharger. Gardés dans le localStorage de ce navigateur seulement.
type Valeur = DonneesMesCours & {
  /** tous les choix, même ceux d'une session passée (affichés sur la page « Mes cours ») */
  tous: MonCours[];
  /** les choix encore valables : ce sont eux qui mettent les profs en avant */
  mesCours: MonCours[];
  perime: (m: MonCours) => boolean;
  basculer: (m: MonCours) => void;
  retirer: (m: MonCours) => void;
  vider: () => void;
  lien: (profId: string) => Lien;
};

const MesCoursContext = createContext<Valeur | undefined>(undefined);

export function MesCoursProvider({ donnees, children }: { donnees: DonneesMesCours; children: ReactNode }) {
  const [brut, setBrut] = useStockageLocal<unknown>("mes-cours", []);
  const valeur = useMemo<Valeur>(() => {
    const tous = nettoyer(brut);
    const perime = (m: MonCours) => estPerime(m, donnees.profs);
    const mesCours = tous.filter((m) => !perime(m));
    return {
      ...donnees,
      tous,
      mesCours,
      perime,
      basculer: (m) => setBrut((avant: unknown) => basculer(nettoyer(avant), m)),
      retirer: (m) => setBrut((avant: unknown) => nettoyer(avant).filter((x) => !memeChoix(x, m))),
      vider: () => setBrut([]),
      lien: (id) => lienAvecMoi(id, donnees.profs[id]?.cours ?? [], mesCours),
    };
  }, [brut, setBrut, donnees]);
  return <MesCoursContext.Provider value={valeur}>{children}</MesCoursContext.Provider>;
}

export function useMesCours(): Valeur {
  const contexte = useContext(MesCoursContext);
  if (!contexte) throw new Error("useMesCours doit être utilisé dans un MesCoursProvider");
  return contexte;
}

/** Mon horaire de cours (mes groupes) et mon calendrier : séances, dates de mes profs pour mes cours, calendrier du cégep. */
export function useMonCalendrier() {
  const { mesCours, groupes, profs } = useMesCours();
  const scolaire = useScolaire();
  return useMemo(() => {
    const seances: Plage[] = mesCours.flatMap((m) =>
      (groupes[m.cours]?.find((g) => g.prof === m.prof && g.groupe === m.groupe)?.seances ?? []).map((s) => ({ ...s, type: "cours" as const, cours: m.cours, groupe: m.groupe, titre: `${court(m.cours)} · ${profs[m.prof!]?.nom ?? ""}` })),
    );
    const evenements = evenementsPourMoi(mesCours, profs);
    const session = mesCours.find((m) => m.session)?.session;
    return { seances, evenements, session, jours: construireCalendrier(scolaire, { plages: seances, evenements, sessionId: session }) };
  }, [mesCours, groupes, profs, scolaire]);
}
