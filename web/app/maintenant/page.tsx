import type { Metadata } from "next";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { EnCeMoment } from "@/components/en-ce-moment";
import { HoraireLabos } from "@/components/horaire-labos";
import { indexCours, laboratoires, profsHoraire } from "@/lib/donnees";
import { lienEdition } from "@/lib/chemins";

export const metadata: Metadata = { title: "En ce moment : profs et laboratoires" };

export default function PageMaintenant() {
  return (
    <>
      <TitrePage titre="En ce moment" sousTitre="Quels profs sont disponibles, et où ? Quels laboratoires sont libres ?" />
      <Conteneur className="space-y-10">
        <EnCeMoment profs={profsHoraire()} labos={laboratoires()} />
        <section>
          <h2 className="mb-3 text-2xl font-bold">Horaire des laboratoires</h2>
          <HoraireLabos labos={laboratoires()} profs={profsHoraire()} cours={indexCours()} />
          <p className="mt-3 text-sm text-muted-foreground">
            Horaire officiel des locaux de la session (
            <a href="https://departement-info-cem.github.io/420-SN1/pdf/horairelabos.pdf" target="_blank" rel="noreferrer" className="text-primary underline">
              PDF
            </a>
            ), recopié dans{" "}
            <a href={lienEdition("laboratoires.yaml")} target="_blank" rel="noreferrer" className="text-primary underline">
              data/laboratoires.yaml
            </a>
            , plus les cours des fiches de profs.
          </p>
        </section>
      </Conteneur>
    </>
  );
}
