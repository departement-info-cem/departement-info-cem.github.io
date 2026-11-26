// Raccourcis vers les sites des cours : /react/1P6/ mène à https://info.cegepmontpetit.ca/1P6/.
// Ils viennent tout seuls du catalogue (data/cours.yaml) : chaque cours qui a une « url » donne un raccourci
// pour son sigle (420-1P6-EM -> 1P6), et un pour chacun de ses anciens numéros (alias 420-4D5-EM -> 4D5).
// Logique pure, utilisée par lib/donnees.ts et scripts/valider-donnees.ts, et testée.
import type { Cours } from "@/app/_types/programme";
import { court } from "@/lib/mes-cours";

export type RaccourciCours = { sigle: string; url: string; no: string; nom: string };

/** Un sigle de raccourci : lettres et chiffres seulement, pour une adresse propre (1P6, SN1, Z03...). */
const SIGLE = /^[0-9A-Z]+$/;

/**
 * Les raccourcis du catalogue, triés par sigle, et les conflits : un même sigle qui mènerait à deux sites différents.
 * Le numéro actuel d'un cours a priorité sur l'ancien numéro d'un autre cours.
 */
export function raccourcisCours(catalogue: Pick<Cours, "no" | "nom" | "url" | "alias">[]): { raccourcis: RaccourciCours[]; conflits: string[] } {
  const parSigle = new Map<string, RaccourciCours & { ancien: boolean }>();
  const conflits: string[] = [];
  const candidats = catalogue
    .filter((c) => c.url)
    .flatMap((c) => [
      { sigle: court(c.no.toUpperCase()), url: c.url!, no: c.no, nom: c.nom, ancien: false },
      ...(c.alias ?? []).map((a) => ({ sigle: court(a.no.toUpperCase()), url: c.url!, no: c.no, nom: c.nom, ancien: true })),
    ])
    // Les numéros actuels d'abord : ils gardent leur sigle si un ancien numéro le réclame aussi
    .sort((a, b) => Number(a.ancien) - Number(b.ancien));
  for (const r of candidats) {
    if (!SIGLE.test(r.sigle)) continue;
    const deja = parSigle.get(r.sigle);
    if (!deja) parSigle.set(r.sigle, r);
    else if (deja.url !== r.url && deja.ancien === r.ancien) conflits.push(`le raccourci ${r.sigle} mènerait à deux sites : ${deja.no} (${deja.url}) et ${r.no} (${r.url})`);
  }
  const raccourcis = [...parSigle.values()].map(({ sigle, url, no, nom }) => ({ sigle, url, no, nom })).sort((a, b) => a.sigle.localeCompare(b.sigle));
  return { raccourcis, conflits };
}
