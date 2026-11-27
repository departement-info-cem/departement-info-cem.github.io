// Mode rétro (easter egg) : le site prend l'allure d'un terminal des années 80.
// On l'active (et on le quitte) avec le code Konami : ↑ ↑ ↓ ↓ ← → ← → B A au clavier.
// Sur un écran tactile, les flèches sont des glissements du doigt, et B A deux touchers.
// L'affichage est dans components/retro/ et la fin de app/globals.css.

export type Entree = "haut" | "bas" | "gauche" | "droite" | "b" | "a" | "toucher";

const FLECHES: Entree[] = ["haut", "haut", "bas", "bas", "gauche", "droite", "gauche", "droite"];
export const CODE_CLAVIER: readonly Entree[] = [...FLECHES, "b", "a"];
export const CODE_TACTILE: readonly Entree[] = [...FLECHES, "toucher", "toucher"];

const TOUCHES: Record<string, Entree> = { ArrowUp: "haut", ArrowDown: "bas", ArrowLeft: "gauche", ArrowRight: "droite", b: "b", a: "a" };

// La touche du clavier, ou null si elle ne fait pas partie du code.
export function entreeClavier(touche: string): Entree | null {
  return TOUCHES[touche.length === 1 ? touche.toLowerCase() : touche] ?? null;
}

// Garde les dernières entrées, juste assez pour reconnaître le code.
// Une entrée qui ne fait pas partie du code (null) efface tout : ↑ ↑ X ↓ ↓… ne compte pas.
export function ajouterEntree(historique: readonly Entree[], entree: Entree | null, code: readonly Entree[]): Entree[] {
  return entree ? [...historique, entree].slice(-code.length) : [];
}

// Maj, Ctrl, etc. ne comptent pas, pour qu'on puisse taper B A en majuscules.
const MODIFICATEURS = new Set(["Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock"]);

export function ajouterTouche(historique: readonly Entree[], touche: string): readonly Entree[] {
  return MODIFICATEURS.has(touche) ? historique : ajouterEntree(historique, entreeClavier(touche), CODE_CLAVIER);
}

export function codeComplet(historique: readonly Entree[], code: readonly Entree[]): boolean {
  return historique.length === code.length && historique.every((e, i) => e === code[i]);
}

// Un geste du doigt : glissement (assez long, et franchement dans un axe), toucher (presque immobile et bref), ou rien.
export function geste(dx: number, dy: number, dureeMs: number): Entree | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < 12 && ay < 12) return dureeMs < 400 ? "toucher" : null;
  if (Math.max(ax, ay) < 40 || Math.max(ax, ay) < 2 * Math.min(ax, ay)) return null;
  if (ax > ay) return dx > 0 ? "droite" : "gauche";
  return dy > 0 ? "bas" : "haut";
}

// Couleur du phosphore, comme sur les moniteurs monochromes : vert (P1), ambre (P3) ou blanc (P4).
export const PHOSPHORES = ["vert", "ambre", "blanc"] as const;
export type Phosphore = (typeof PHOSPHORES)[number];

export function phosphoreSuivant(p: Phosphore): Phosphore {
  return PHOSPHORES[(PHOSPHORES.indexOf(p) + 1) % PHOSPHORES.length];
}

export function lirePhosphore(valeur: string | null | undefined): Phosphore | null {
  return PHOSPHORES.find((p) => p === valeur) ?? null;
}

// L'adresse de la page à la façon de MS-DOS : /centre-aide/ devient C:\DEPINFO\CENTRE~1.
// Sous DOS, un nom de dossier avait au plus 8 caractères, en majuscules et sans accents.
export function cheminDos(chemin: string): string {
  const dossiers = chemin
    .split("/")
    .filter(Boolean)
    .map((d) => {
      let nom = d;
      try {
        nom = decodeURIComponent(d);
      } catch {}
      nom = nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      return nom.length > 8 ? `${nom.slice(0, 6)}~1` : nom;
    });
  return ["C:", "DEPINFO", ...dossiers].join("\\");
}
