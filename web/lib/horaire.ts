// Logique de l'horaire de la semaine (positionnement des plages, couleurs).
import type { Plage, TypePlage } from "@/app/_types/prof";
import { heureEnMinutes, JOURS_OUVRABLES, minutesEnHeure, normaliserJour, type Jour } from "@/lib/temps";

/** Couleurs (fond / texte) par type de plage : couleurs officielles du cégep et texte permis sur ce fond
 *  par la charte graphique. Les mêmes en thème clair et sombre. */
export const COULEURS_TYPES: Record<TypePlage, { fond: string; texte: string }> = {
  cours: { fond: "#cfe5ae", texte: "#0c3455" }, // vert pâle, bleu marine
  dispo: { fond: "#8ed8f8", texte: "#0c3455" }, // bleu pâle, bleu marine
  "centre-aide": { fond: "#ffdf5d", texte: "#0c3455" }, // jaune pâle, bleu marine
  reunion: { fond: "#e6e6e6", texte: "#0c3455" }, // gris 1, bleu marine
  autre: { fond: "#f37021", texte: "#000000" }, // orangé, noir
};

/** Pour distinguer les cours entre eux : une bordure de couleur différente par numéro de cours. */
const BORDURES_COURS = ["#278637", "#14b1e7", "#fdb913", "#f37021", "#0c3455", "#8dc640", "#d93b20"];

export function couleurBordure(plage: Pick<Plage, "type" | "cours">, coursOrdonnes: string[]): string {
  if (plage.type !== "cours") return "transparent";
  const i = coursOrdonnes.indexOf((plage.cours ?? "").toUpperCase());
  return BORDURES_COURS[(i < 0 ? 0 : i) % BORDURES_COURS.length];
}

export type PlagePositionnee = Plage & {
  jourNormalise: Jour;
  debutMin: number;
  finMin: number;
  /** colonne et nombre de colonnes quand des plages se chevauchent */
  colonne: number;
  colonnes: number;
};

/** Regroupe les plages par jour et calcule les colonnes pour les chevauchements. */
export function positionnerPlages(plages: Plage[]): Record<Jour, PlagePositionnee[]> {
  const parJour = Object.fromEntries(JOURS_OUVRABLES.map((j) => [j, [] as PlagePositionnee[]])) as Record<Jour, PlagePositionnee[]>;

  for (const p of plages) {
    const jour = normaliserJour(p.jour);
    const debutMin = heureEnMinutes(p.debut);
    const finMin = heureEnMinutes(p.fin);
    if (!jour || debutMin === null || finMin === null) continue;
    (parJour[jour] ??= []).push({ ...p, jourNormalise: jour, debutMin, finMin, colonne: 0, colonnes: 1 });
  }

  for (const liste of Object.values(parJour)) {
    liste.sort((a, b) => a.debutMin - b.debutMin || b.finMin - a.finMin);
    // Groupes de plages qui se chevauchent : chaque plage prend la première colonne libre.
    let groupe: PlagePositionnee[] = [];
    let finGroupe = -1;
    const fermer = () => {
      const n = Math.max(...groupe.map((p) => p.colonne)) + 1;
      groupe.forEach((p) => (p.colonnes = n));
      groupe = [];
    };
    for (const p of liste) {
      if (groupe.length && p.debutMin >= finGroupe) fermer();
      const prises = new Set(groupe.filter((g) => g.finMin > p.debutMin).map((g) => g.colonne));
      let c = 0;
      while (prises.has(c)) c++;
      p.colonne = c;
      groupe.push(p);
      finGroupe = Math.max(finGroupe, p.finMin);
    }
    if (groupe.length) fermer();
  }
  return parJour;
}

export const estDispo = (p: Pick<Plage, "type">) => p.type === "dispo" || p.type === "centre-aide";

export type PlageDispo = { jour: Jour; debut: string; fin: string; local?: string; centreAide: boolean };

/**
 * Regroupe les disponibilités (dispo et centre d'aide) qui se suivent dans le même local :
 * 10:00-11:00 + 11:00-12:00 au D-0008 -> une seule plage 10:00-12:00.
 */
export function fusionnerDispos(plages: Plage[]): PlageDispo[] {
  const triees = plages
    .filter(estDispo)
    .flatMap((p) => {
      const jour = normaliserJour(p.jour);
      const [d, f] = [heureEnMinutes(p.debut), heureEnMinutes(p.fin)];
      return jour && d !== null && f !== null ? [{ jour, d, f, local: p.local, centreAide: p.type === "centre-aide" }] : [];
    })
    .sort((a, b) => JOURS_OUVRABLES.indexOf(a.jour) - JOURS_OUVRABLES.indexOf(b.jour) || a.d - b.d);
  const resultat: typeof triees = [];
  for (const p of triees) {
    const avant = resultat.findLast((r) => r.jour === p.jour && r.local === p.local && p.d <= r.f);
    if (avant) {
      avant.f = Math.max(avant.f, p.f);
      avant.centreAide ||= p.centreAide;
    } else resultat.push({ ...p });
  }
  return resultat.map((r) => ({ jour: r.jour, debut: minutesEnHeure(r.d), fin: minutesEnHeure(r.f), local: r.local, centreAide: r.centreAide }));
}
