import type { Metadata } from "next";
import Link from "next/link";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { ListeProfs } from "@/components/liste-profs";
import { idsProfsActifs, indexCours, profs } from "@/lib/donnees";

export const metadata: Metadata = { title: "Les profs" };

export default function PageProfs() {
  // Seulement les profs actifs cette session : les autres gardent leur page, mais ne sont pas listés.
  const actifs = idsProfsActifs();
  const profsActifs = profs().filter((p) => actifs.includes(p.id));
  return (
    <>
      <TitrePage titre="Les profs" sousTitre="Tous les profs offrent des disponibilités en dehors des cours : utilise-les, ce sont des experts du domaine.">
        <p className="mt-3 text-sm">
          Tu es prof ? <Link href="/modifier-mon-profil" className="font-semibold text-primary underline">Modifie ta page, ton horaire et ton calendrier</Link>.
        </p>
      </TitrePage>
      <Conteneur>
        <ListeProfs profs={profsActifs} cours={indexCours()} />
      </Conteneur>
    </>
  );
}
