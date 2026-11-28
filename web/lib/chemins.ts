// Si le site est servi sous un préfixe (basePath), les liens <Link> de Next l'ajoutent tout seuls,
// mais pas les <img> ni les URL construites à la main.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Le domaine du site (sans le basePath). */
export const SITE = "https://info.cegepmontpetit.ca";

export function chemin(p: string): string {
  return `${BASE}${p.startsWith("/") ? p : `/${p}`}`;
}

export function photo(fichier: string): string {
  return chemin(`/photos/${fichier}`);
}

export const DEPOT = "https://github.com/departement-info-cem/departement-info-cem.github.io";

/** Lien direct vers l'éditeur GitHub d'un fichier de données. */
export function lienEdition(fichier: string): string {
  return `${DEPOT}/edit/main/data/${fichier}`;
}

export function lienCreation(dossier: string, nom: string): string {
  return `${DEPOT}/new/main/data/${dossier}?filename=${encodeURIComponent(nom)}`;
}
