// Raccourcis vers les sites des cours : /4W6/ (ou /4w6/) mène à https://info.cegepmontpetit.ca/4W6-WebServices/.
// Ils viennent tout seuls du catalogue (data/cours.yaml) : chaque cours qui a une « url » donne un raccourci
// pour son sigle (420-1P6-EM -> 1P6), et un pour chacun de ses anciens numéros (alias 420-4D5-EM -> 4D5).
// Logique pure, utilisée par lib/donnees.ts, scripts/valider-donnees.ts et la page 404, et testée.
//
// Les majuscules ne comptent pas :
//  - une page est générée pour le sigle en majuscules et en minuscules (1P6 et 1p6), les deux façons de l'écrire ;
//  - toute autre casse (Sn1) est rattrapée par la page 404 (components/raccourci-introuvable.tsx).
import type { Cours } from "@/app/_types/programme";
import { court } from "@/lib/mes-cours";

export type RaccourciCours = { sigle: string; url: string; no: string; nom: string };

/** Un sigle de raccourci : lettres et chiffres seulement, pour une adresse propre (1P6, SN1, Z03...). */
const SIGLE = /^[0-9A-Z]+$/;

/**
 * Les raccourcis du catalogue, triés par sigle, et les conflits : un même sigle qui mènerait à deux sites différents,
 * ou qui prendrait une adresse déjà utilisée (« reserves » : identifiants des profs, pages du site), peu importe la casse.
 * Le numéro actuel d'un cours a priorité sur l'ancien numéro d'un autre cours.
 */
export function raccourcisCours(
  catalogue: Pick<Cours, "no" | "nom" | "url" | "alias">[],
  reserves: string[] = [],
): { raccourcis: RaccourciCours[]; conflits: string[] } {
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
  const prises = new Map(reserves.map((x) => [x.toLowerCase(), x]));
  for (const r of parSigle.values()) {
    const prise = prises.get(r.sigle.toLowerCase());
    if (prise) conflits.push(`le raccourci ${r.sigle} (${r.no}) prendrait l'adresse /${prise}/, déjà utilisée par une page ou un prof`);
  }
  const raccourcis = [...parSigle.values()].map(({ sigle, url, no, nom }) => ({ sigle, url, no, nom })).sort((a, b) => a.sigle.localeCompare(b.sigle));
  return { raccourcis, conflits };
}

/** Le raccourci d'un segment d'adresse, peu importe la casse (1p6, 1P6, Sn1...). */
export function trouverRaccourci(raccourcis: RaccourciCours[], segment: string): RaccourciCours | undefined {
  const s = segment.toUpperCase();
  return raccourcis.find((r) => r.sigle === s);
}

/**
 * Les pages à générer : le sigle en majuscules et en minuscules. On saute une page qui redirigerait vers elle-même :
 * le site est à la racine du domaine, /1P6/ est donc l'adresse même du site du 1P6 : une redirection tournerait en rond.
 * « racine » : l'adresse du site, avec le basePath s'il y en a un (ex. https://info.cegepmontpetit.ca).
 */
export function pagesRaccourcis(raccourcis: RaccourciCours[], racine: string): { segment: string; raccourci: RaccourciCours }[] {
  return raccourcis.flatMap((r) =>
    [...new Set([r.sigle, r.sigle.toLowerCase()])].filter((segment) => `${racine}/${segment}/` !== r.url).map((segment) => ({ segment, raccourci: r })),
  );
}
