// Trouver un moment pour se rencontrer entre profs, d'après l'horaire de la semaine de leur fiche.
import type { Plage } from "@/app/_types/prof";
import { estDispo } from "@/lib/horaire";
import { heureEnMinutes, JOURS_OUVRABLES, normaliserJour, type Jour } from "@/lib/temps";

export type ProfRencontre = { id: string; nom: string; plages: Plage[] };

export type OptionsRencontre = {
  /** heures de la journée, en minutes depuis minuit */
  debut: number;
  fin: number;
  /** durée minimale de la rencontre, en minutes */
  duree: number;
  /** compter les dispos et le centre d'aide comme du temps libre (sinon, ils sont réservés aux étudiants) */
  disposLibres: boolean;
};

export type Creneau = { jour: Jour; debut: number; fin: number; absents: string[] };

/** Les moments où le prof est pris, par jour. */
function occupations(prof: ProfRencontre, disposLibres: boolean): Map<Jour, [number, number][]> {
  const parJour = new Map<Jour, [number, number][]>();
  for (const p of prof.plages) {
    if (disposLibres && estDispo(p)) continue;
    const jour = normaliserJour(p.jour);
    const debut = heureEnMinutes(p.debut);
    const fin = heureEnMinutes(p.fin);
    if (!jour || debut === null || fin === null || fin <= debut) continue;
    parJour.set(jour, [...(parJour.get(jour) ?? []), [debut, fin]]);
  }
  return parJour;
}

/**
 * Découpe chaque jour en tranches où la liste des profs pris ne change pas,
 * et regroupe les tranches voisines qui ont les mêmes absents.
 */
export function creneaux(profs: ProfRencontre[], options: Pick<OptionsRencontre, "debut" | "fin" | "disposLibres">): Creneau[] {
  const occ = profs.map((p) => ({ id: p.id, parJour: occupations(p, options.disposLibres) }));
  const resultat: Creneau[] = [];
  for (const jour of JOURS_OUVRABLES) {
    const bornes = new Set([options.debut, options.fin]);
    for (const o of occ)
      for (const [d, f] of o.parJour.get(jour) ?? []) {
        if (d > options.debut && d < options.fin) bornes.add(d);
        if (f > options.debut && f < options.fin) bornes.add(f);
      }
    const triees = [...bornes].sort((a, b) => a - b);
    let precedent: Creneau | undefined;
    for (let i = 0; i < triees.length - 1; i++) {
      const [debut, fin] = [triees[i], triees[i + 1]];
      const absents = occ.filter((o) => (o.parJour.get(jour) ?? []).some(([d, f]) => d < fin && f > debut)).map((o) => o.id);
      if (precedent && precedent.absents.join() === absents.join()) precedent.fin = fin;
      else resultat.push((precedent = { jour, debut, fin, absents }));
    }
  }
  return resultat;
}

/** Les créneaux assez longs où tout le monde est libre, dans l'ordre de la semaine. */
export function creneauxCommuns(profs: ProfRencontre[], options: OptionsRencontre): Creneau[] {
  return creneaux(profs, options).filter((c) => !c.absents.length && c.fin - c.debut >= options.duree);
}

/** Faute de mieux : les créneaux assez longs où il manque le moins de monde. */
export function meilleursCreneaux(profs: ProfRencontre[], options: OptionsRencontre, nombre = 8): Creneau[] {
  return creneaux(profs, options)
    .filter((c) => c.absents.length < profs.length && c.fin - c.debut >= options.duree)
    .sort((a, b) => a.absents.length - b.absents.length || b.fin - b.debut - (a.fin - a.debut))
    .slice(0, nombre);
}
