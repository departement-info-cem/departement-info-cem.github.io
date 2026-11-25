import type { Metadata } from "next";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { GestionMesCours } from "@/components/gestion-mes-cours";
import { logicielsAvecCours } from "@/lib/donnees";

export const metadata: Metadata = { title: "Mes cours" };

export default function PageMesCours() {
  return (
    <>
      <TitrePage titre="Mes cours" sousTitre="Indique tes cours et ton groupe : le site met tes profs en premier, avec leurs disponibilités, et te montre ton horaire." />
      <Conteneur>
        <GestionMesCours logiciels={logicielsAvecCours()} />
      </Conteneur>
    </>
  );
}
