"use client";
import { useEffect } from "react";
import { BASE } from "@/lib/chemins";
import { trouverRaccourci, type RaccourciCours } from "@/lib/raccourcis-cours";

// Dans la page 404 : une adresse comme /Sn1/ ou /4w6/ est un raccourci vers le site d'un cours écrit avec une autre casse.
// Les pages générées couvrent le sigle en majuscules et en minuscules ; ce rattrapage couvre les autres façons de l'écrire.
// GitHub Pages sert le 404.html de la racine du domaine : il ne joue donc qu'une fois le site à la racine (basePath "").
export function RaccourciIntrouvable({ raccourcis }: { raccourcis: RaccourciCours[] }) {
  useEffect(() => {
    const chemin = window.location.pathname.startsWith(`${BASE}/`) ? window.location.pathname.slice(BASE.length) : window.location.pathname;
    const segments = chemin.split("/").filter(Boolean);
    if (segments.length !== 1) return;
    const r = trouverRaccourci(raccourcis, decodeURIComponent(segments[0]));
    if (r && r.url !== window.location.href) window.location.replace(r.url);
  }, [raccourcis]);
  return null;
}
