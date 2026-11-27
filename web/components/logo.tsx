import Image from "next/image";
import { chemin } from "@/lib/chemins";

// Logo du département : le M du symbole Édouard-Montpetit dessiné en pixels (grille de 22 × 24 cellules),
// suivi d'un curseur de terminal cyan. Les fichiers sont dans public/images/ : logo.svg (statique) et
// logo-anime.svg (les colonnes apparaissent une à une, puis le curseur clignote).
// Les deux SVG ont 2 cellules de marge tout autour : les marges négatives les retirent pour aligner le M.
const STATIQUE = "/images/logo.svg";
const ANIME = "/images/logo-anime.svg";

/**
 * taille : hauteur du M en pixels (une cellule = taille / 24 px). 30 px, la hauteur visible de l'ancien logo,
 * adoucit un peu les bords des pixels ; seuls 24 et 48 px (et 36 px sur les écrans haute densité) sont parfaitement nets.
 * classeTexte : pour cacher le nom à côté du symbole, ex. dans l'en-tête sur un écran étroit.
 */
export function Logo({ taille = 30, anime = false, classeTexte = "" }: { taille?: number; anime?: boolean; classeTexte?: string }) {
  const cellule = taille / 24;
  const image = (
    <Image
      src={chemin(anime ? ANIME : STATIQUE)}
      alt=""
      width={Math.round(33 * cellule)}
      height={Math.round(28 * cellule)}
      unoptimized
      loading="eager"
      // max-w-none : sinon max-width: 100 % rapetisse l'image à la largeur de son parent, réduite par les marges négatives
      className="block max-w-none"
      style={{ width: 33 * cellule, height: 28 * cellule, margin: -2 * cellule }}
    />
  );
  return (
    <span className="inline-flex items-center gap-3">
      {anime ? (
        // Logo statique pour qui a réduit les animations dans son système
        <picture className="shrink-0">
          <source media="(prefers-reduced-motion: reduce)" srcSet={chemin(STATIQUE)} />
          {image}
        </picture>
      ) : (
        <span className="shrink-0">{image}</span>
      )}
      <span className={`flex flex-col leading-tight ${classeTexte}`}>
        <span className="font-heading text-lg font-bold tracking-tight text-white">Informatique</span>
        <span className="hidden text-xs text-cem-ciel sm:inline">Cégep Édouard-Montpetit</span>
      </span>
    </span>
  );
}
