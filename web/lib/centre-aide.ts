// Centre d'aide : qui y est, quand, et pour quels cours. Logique pure, testée.
import type { Plage } from "@/app/_types/prof";
import type { PlageAffichee } from "@/lib/horaire";
import { court, type DonneesMesCours } from "@/lib/mes-cours";

type Profs = DonneesMesCours["profs"];

export type Aidant = { id: string; nom: string; /** les cours demandés pour lesquels il peut aider (tous ses cours si rien n'est demandé) */ cours: string[]; plages: Plage[] };

/**
 * Les profs présents au centre d'aide. Avec « cours », seulement ceux qui peuvent aider dans au moins un de ces cours.
 * Avec « session », seulement les horaires de cette session (une fiche pas encore à jour ne doit envoyer personne au mauvais moment).
 */
export function aidants(profs: Profs, options: { cours?: string[]; session?: string } = {}): Aidant[] {
  return Object.entries(profs).flatMap(([id, p]) => {
    if (options.session && p.session !== options.session) return [];
    const plages = p.dispos.filter((d) => d.type === "centre-aide");
    const cours = options.cours ? options.cours.filter((no) => p.aide.includes(no)) : p.aide;
    return plages.length && cours.length ? [{ id, nom: p.nom, cours, plages }] : [];
  });
}

/** L'horaire du centre d'aide : le nom du prof et, avec des cours choisis, pour lesquels (« 5M6, SN1 »). */
export function horaireCentreAide(liste: Aidant[], avecCours: boolean): PlageAffichee[] {
  return liste.flatMap((a) => a.plages.map((p) => ({ ...p, titre: undefined, noms: [a.nom], precision: avecCours ? a.cours.map(court).join(", ") : undefined })));
}

/** Les profs qui peuvent aider dans un cours mais ne sont pas au centre d'aide : leurs dispos au bureau restent une solution. */
export function aidantsHorsCentre(profs: Profs, no: string, session?: string): { id: string; nom: string; dispos: Plage[] }[] {
  return Object.entries(profs).flatMap(([id, p]) => {
    if (!p.aide.includes(no) || p.dispos.some((d) => d.type === "centre-aide") || (session && p.session !== session)) return [];
    const dispos = p.dispos.filter((d) => d.type === "dispo");
    return dispos.length ? [{ id, nom: p.nom, dispos }] : [];
  });
}
