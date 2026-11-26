"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useStockageLocal } from "@/app/_hooks/use-stockage-local";
import type { Plage } from "@/app/_types/prof";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { construireCalendrier } from "@/lib/calendrier";
import { basculer, court, ecrireParamCours, estPerime, lireParamCours, PARAM_COURS, evenementsPourMoi, lienAvecMoi, memeChoix, nettoyer, type DonneesMesCours, type Lien, type MonCours } from "@/lib/mes-cours";

// « Mes cours » de l'étudiant, partagés par toute la page : choisir un groupe met à jour la liste des profs,
// la page Locaux et le bandeau sans recharger. Gardés dans le localStorage de ce navigateur seulement.
//
// Aperçu : une adresse avec ?mescours=SN1-1050,5N6-1020 montre le site avec ces cours, sans toucher à ceux de la
// personne. L'aperçu dure le temps de l'onglet (sessionStorage), même en changeant de page, jusqu'à « Quitter ».
type Apercu = { cours: MonCours[]; inconnus: string[] };
const CLE_APERCU = "mes-cours-apercu";

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
  /** l'aperçu en cours (lien avec ?mescours=), sinon null */
  apercu: Apercu | null;
  garderApercu: () => void;
  quitterApercu: () => void;
  /** mes cours (ou ceux de l'aperçu) pour ?mescours= : « SN1-1050,5M6-1020 » */
  paramCours: string;
};

const MesCoursContext = createContext<Valeur | undefined>(undefined);

export function MesCoursProvider({ donnees, children }: { donnees: DonneesMesCours; children: ReactNode }) {
  const [brut, setBrut] = useStockageLocal<unknown>("mes-cours", []);
  const [apercu, setApercu] = useState<Apercu | null>(null);

  // Lu après l'affichage : la page statique est la même pour tous
  useEffect(() => {
    const id = setTimeout(() => {
      const param = new URLSearchParams(window.location.search).get(PARAM_COURS);
      if (param !== null) {
        const lu = lireParamCours(param, donnees);
        sessionStorage.setItem(CLE_APERCU, JSON.stringify(lu));
        setApercu(lu);
        return;
      }
      try {
        const garde = JSON.parse(sessionStorage.getItem(CLE_APERCU) ?? "null");
        if (garde) setApercu({ cours: nettoyer(garde.cours), inconnus: [] });
      } catch {
        sessionStorage.removeItem(CLE_APERCU);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [donnees]);

  const changerApercu = useCallback((f: (avant: MonCours[]) => MonCours[]) => {
    setApercu((a) => {
      if (!a) return a;
      const nouveau = { cours: f(a.cours), inconnus: a.inconnus };
      sessionStorage.setItem(CLE_APERCU, JSON.stringify(nouveau));
      return nouveau;
    });
  }, []);

  const quitterApercu = useCallback(() => {
    sessionStorage.removeItem(CLE_APERCU);
    setApercu(null);
    // Sans quoi un rechargement relancerait l'aperçu
    const url = new URL(window.location.href);
    if (url.searchParams.has(PARAM_COURS)) {
      url.searchParams.delete(PARAM_COURS);
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);

  const valeur = useMemo<Valeur>(() => {
    const tous = apercu ? apercu.cours : nettoyer(brut);
    const perime = (m: MonCours) => estPerime(m, donnees.profs);
    const mesCours = tous.filter((m) => !perime(m));
    return {
      ...donnees,
      tous,
      mesCours,
      perime,
      // Pendant un aperçu, on modifie l'aperçu : les cours de la personne ne bougent pas
      basculer: (m) => (apercu ? changerApercu((a) => basculer(a, m)) : setBrut((avant: unknown) => basculer(nettoyer(avant), m))),
      retirer: (m) => (apercu ? changerApercu((a) => a.filter((x) => !memeChoix(x, m))) : setBrut((avant: unknown) => nettoyer(avant).filter((x) => !memeChoix(x, m)))),
      vider: () => (apercu ? changerApercu(() => []) : setBrut([])),
      lien: (id) => lienAvecMoi(id, donnees.profs[id]?.cours ?? [], mesCours),
      apercu,
      garderApercu: () => {
        if (apercu) setBrut(apercu.cours);
        quitterApercu();
      },
      quitterApercu,
      paramCours: ecrireParamCours(mesCours),
    };
  }, [brut, setBrut, donnees, apercu, changerApercu, quitterApercu]);
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
