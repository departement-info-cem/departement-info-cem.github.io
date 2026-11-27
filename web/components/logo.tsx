// Propositions de logo du département (SVG, sans dépendance à une police pour le symbole).
// L'ancien logo écrivait « MONTPETIT » avec un 0 et un 1 dans une colonne blanche :
// on garde l'idée du binaire, aux couleurs officielles du cégep.

export type VarianteLogo = "binaire" | "accolades" | "pixels";

const MARINE = "#0c3455";
const VERT = "#8dc640";
const FORET = "#278637";
const CIEL = "#14b1e7";

export function SymboleLogo({ variante = "binaire", taille = 40, className }: { variante?: VarianteLogo; taille?: number; className?: string }) {
  if (variante === "accolades") {
    return (
      <svg viewBox="0 0 64 64" width={taille} height={taille} className={className} role="img" aria-label="Logo du département d'informatique">
        <rect width="64" height="64" rx="14" fill={MARINE} />
        <path d="M22 12c-6 0-7 3-7 8v6c0 3-2 5-5 6 3 1 5 3 5 6v6c0 5 1 8 7 8" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42 12c6 0 7 3 7 8v6c0 3 2 5 5 6-3 1-5 3-5 6v6c0 5-1 8-7 8" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="20" r="4.5" fill={VERT} />
        <rect x="28" y="28" width="8" height="22" rx="3" fill={VERT} />
      </svg>
    );
  }
  if (variante === "pixels") {
    // Un « M » de Montpetit dessiné en pixels ; les pixels verts forment un 0 et un 1.
    const M = ["10001", "11011", "10101", "10001", "10001"];
    const verts = new Set(["0,0", "1,1", "2,2", "3,3", "4,4"]);
    return (
      <svg viewBox="0 0 64 64" width={taille} height={taille} className={className} role="img" aria-label="Logo du département d'informatique">
        <rect width="64" height="64" rx="14" fill={MARINE} />
        {M.flatMap((ligne, y) =>
          [...ligne].map((b, x) =>
            b === "1" ? (
              <rect key={`${x}-${y}`} x={9 + x * 9.5} y={9 + y * 9.5} width="8" height="8" rx="1.5" fill={verts.has(`${x},${y}`) || verts.has(`${4 - x},${y}`) ? VERT : "#fff"} />
            ) : (
              <rect key={`${x}-${y}`} x={9 + x * 9.5} y={9 + y * 9.5} width="8" height="8" rx="1.5" fill="#fff" opacity="0.08" />
            ),
          ),
        )}
      </svg>
    );
  }
  // « binaire » : invite de commande > et colonne blanche avec 0 et 1 (clin d'œil à l'ancien logo)
  return (
    <svg viewBox="0 0 64 64" width={taille} height={taille} className={className} role="img" aria-label="Logo du département d'informatique">
      <rect width="64" height="64" rx="14" fill={MARINE} />
      <path d="M11 21l12 11-12 11" fill="none" stroke={VERT} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11" y="48" width="14" height="4.5" rx="2" fill={CIEL} />
      <rect x="33" y="8" width="21" height="48" rx="5" fill="#fff" />
      <ellipse cx="43.5" cy="21" rx="5" ry="7.5" fill="none" stroke={MARINE} strokeWidth="3.6" />
      <path d="M40 38.5l4-3v15" fill="none" stroke={FORET} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** classeTexte : pour cacher le nom à côté du symbole, ex. dans l'en-tête sur un écran étroit. */
export function Logo({ variante = "binaire", taille = 40, inverse = false, classeTexte = "" }: { variante?: VarianteLogo; taille?: number; inverse?: boolean; classeTexte?: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <SymboleLogo variante={variante} taille={taille} />
      <span className={`flex flex-col leading-tight ${classeTexte}`}>
        <span className={`font-heading text-lg font-bold tracking-tight ${inverse ? "text-white" : "text-cem-marine dark:text-white"}`}>Informatique</span>
        <span className={`text-xs ${inverse ? "hidden text-cem-ciel sm:inline" : "text-muted-foreground"}`}>Cégep Édouard-Montpetit</span>
      </span>
    </span>
  );
}
