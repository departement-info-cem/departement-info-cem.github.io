"use client";
import { useEffect, useRef } from "react";

// Part de la zone des formes qui doit être visible pour qu'elles y entrent.
const SEUIL = 0.75;

// Formes graphiques du coin inférieur droit du pied de page, reprises des sites de cours
// (voir .formes-pied-de-page dans globals.css). Elles entrent quand on arrive au bas de la page
// et ressortent, hors de l'écran, dès qu'on n'en voit plus rien, pour entrer de nouveau à la
// prochaine visite. On observe la zone des formes plutôt que tout le pied de page : sur un
// petit écran, le pied de page entier ne serait jamais visible aux trois quarts.
export function FormesPiedDePage() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= SEUIL) el.toggleAttribute("data-visibles", true);
        else if (e.intersectionRatio === 0) el.toggleAttribute("data-visibles", false);
      },
      { threshold: [0, SEUIL] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} aria-hidden className="formes-pied-de-page" />;
}
