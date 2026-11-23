import type { Metadata } from "next";
import Link from "next/link";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { ListeProfs } from "@/components/liste-profs";
import { indexCours, profs } from "@/lib/donnees";

export const metadata: Metadata = { title: "Les profs" };

export default function PageProfs() {
  return (
    <>
      <TitrePage titre="Les profs" sousTitre="Tous les profs offrent des disponibilités en dehors des cours : utilise-les, ce sont des experts du domaine.">
        <p className="mt-3 text-sm">
          Tu es prof ? <Link href="/modifier-mon-profil" className="font-semibold text-primary underline">Modifie ta page, ton horaire et ton calendrier</Link>.
        </p>
      </TitrePage>
      <Conteneur>
        <ListeProfs profs={profs()} cours={indexCours()} />
      </Conteneur>
    </>
  );
}
