import type { Metadata } from "next";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { ListeSites } from "@/components/liste-sites";
import { sitesCours } from "@/lib/donnees";
import { FILTRES_SITES } from "@/lib/raccourcis";

export const metadata: Metadata = { title: "Sites web des cours" };

export default function PageSites() {
  return (
    <>
      <TitrePage titre="Sites web des cours" sousTitre="Le matériel de chaque cours, en un clic. Le filtre que tu choisis est retenu pour ta prochaine visite." />
      <Conteneur>
        <ListeSites sites={sitesCours()} filtres={FILTRES_SITES} />
      </Conteneur>
    </>
  );
}
