import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { EtatLaboratoireMaintenant } from "@/components/etat-laboratoire";
import { HoraireLabo } from "@/components/horaire-labos";
import { indexCours, laboratoires, profsHoraire } from "@/lib/donnees";
import { profsUtiles } from "@/lib/maintenant";

// Une page par laboratoire : /locaux/D-0003, générée au build pour chaque local de data/laboratoires.yaml
export const dynamicParams = false;

export function generateStaticParams() {
  return laboratoires().map((l) => ({ local: l.local }));
}

const trouver = (local: string) => laboratoires().find((l) => l.local === local);

export async function generateMetadata({ params }: PageProps<"/locaux/[local]">): Promise<Metadata> {
  const labo = trouver((await params).local);
  return labo ? { title: `Laboratoire ${labo.local}`, description: `Horaire de la semaine du laboratoire ${labo.local} du département d'informatique.` } : {};
}

export default async function PageLabo({ params }: PageProps<"/locaux/[local]">) {
  const labo = trouver((await params).local);
  if (!labo) notFound();
  const profs = profsUtiles(profsHoraire(), laboratoires());

  return (
    <>
      <TitrePage titre={`Laboratoire ${labo.local}`} sousTitre={[labo.centreAide && "★ Centre d'aide", labo.nom, labo.postes && `${labo.postes} postes`, labo.description].filter(Boolean).join(" · ")}>
        <Link href="/locaux" className="mt-2 inline-block text-sm text-primary underline">
          Tous les locaux
        </Link>
      </TitrePage>
      <Conteneur className="space-y-6">
        <div className="max-w-md">
          <EtatLaboratoireMaintenant labo={labo} profs={profs} />
        </div>
        <HoraireLabo labo={labo} profs={profs} cours={indexCours()} />
      </Conteneur>
    </>
  );
}
