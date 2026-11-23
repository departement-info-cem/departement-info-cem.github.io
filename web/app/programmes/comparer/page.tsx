import type { Metadata } from "next";
import { Suspense } from "react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { Comparateur } from "@/components/comparateur";
import { programmes } from "@/lib/donnees";

export const metadata: Metadata = { title: "Comparer deux programmes" };

export default function PageComparer() {
  return (
    <>
      <TitrePage titre="Comparer deux programmes" sousTitre="Choisis deux programmes pour voir les cours qu'ils partagent et ce qui les distingue." />
      <Conteneur>
        <Suspense fallback={<p>Chargement...</p>}>
          <Comparateur programmes={programmes()} />
        </Suspense>
      </Conteneur>
    </>
  );
}
