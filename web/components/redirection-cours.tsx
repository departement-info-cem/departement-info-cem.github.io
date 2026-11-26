"use client";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import type { RaccourciCours } from "@/lib/raccourcis-cours";
import { bouton } from "@/lib/bouton";

// Page d'un raccourci /react/<sigle>/ : le site est statique (GitHub Pages), sans redirection côté serveur.
// La balise meta redirige dès le chargement, même sans JavaScript ; l'effet couvre une arrivée par navigation
// interne (la balise n'y est pas relue) ; le lien reste au cas où les deux seraient bloqués.
export function RedirectionCours({ raccourci }: { raccourci: RaccourciCours }) {
  useEffect(() => {
    window.location.replace(raccourci.url);
  }, [raccourci.url]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <meta httpEquiv="refresh" content={`0; url=${raccourci.url}`} />
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{raccourci.no}</p>
      <h1 className="mt-2 text-2xl font-bold">{raccourci.nom}</h1>
      <p className="mt-2 text-muted-foreground">Redirection vers le site du cours...</p>
      <a href={raccourci.url} className={bouton(undefined, "mt-6")}>
        Aller au site du cours <ExternalLink className="size-4" />
      </a>
    </div>
  );
}
