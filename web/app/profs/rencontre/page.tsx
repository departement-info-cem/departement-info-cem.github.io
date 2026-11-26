import type { Metadata } from "next";
import { Suspense } from "react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { TrouverRencontre } from "@/components/trouver-rencontre";
import { idsProfsActifs, profs } from "@/lib/donnees";

// Outil pour les profs : pas dans le menu ni dans la recherche, seulement un lien depuis « Modifier mon profil ».
export const metadata: Metadata = { title: "Trouver un moment pour se rencontrer", robots: { index: false } };

export default function PageRencontre() {
  const actifs = idsProfsActifs();
  const liste = profs()
    .map((p) => ({ id: p.id, nom: p.nom, session: p.session, actif: actifs.includes(p.id), plages: p.horaire?.plages ?? [] }))
    .sort((a, b) => Number(b.actif) - Number(a.actif) || a.nom.localeCompare(b.nom, "fr"));
  return (
    <>
      <TitrePage titre="Trouver un moment pour se rencontrer" sousTitre="Pour les profs : les moments libres en commun, d'après l'horaire de la semaine de chaque fiche." />
      <Conteneur>
        <Suspense fallback={<p>Chargement...</p>}>
          <TrouverRencontre profs={liste} />
        </Suspense>
        <p className="mt-8 text-sm text-muted-foreground">
          Seul l&apos;horaire de la semaine compte : les absences et les journées particulières du calendrier ne sont pas prises en compte.
          Un horaire incomplet donne un résultat trop optimiste : la réunion de département, par exemple, n&apos;est pas dans toutes les fiches.
        </p>
      </Conteneur>
    </>
  );
}
