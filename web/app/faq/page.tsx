import type { Metadata } from "next";
import { Suspense } from "react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { FaqRecherche } from "@/components/faq-recherche";
import { faq } from "@/lib/donnees";

export const metadata: Metadata = { title: "Foire aux questions" };

export default function PageFaq() {
  return (
    <>
      <TitrePage titre="Foire aux questions" sousTitre="Les questions qu'on nous pose souvent : ordi, labos, travaux, intelligence artificielle..." />
      <Conteneur>
        <Suspense>
          <FaqRecherche questions={faq()} />
        </Suspense>
      </Conteneur>
    </>
  );
}
