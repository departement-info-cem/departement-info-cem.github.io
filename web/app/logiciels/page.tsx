import type { Metadata } from "next";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { ListeLogiciels } from "@/components/liste-logiciels";
import { logicielsAvecCours } from "@/lib/donnees";

export const metadata: Metadata = { title: "Logiciels gratuits" };

export default function PageLogiciels() {
  return (
    <>
      <TitrePage
        titre="Logiciels gratuits"
        sousTitre="En tant qu'étudiant du département, tu as accès gratuitement à plein de logiciels pendant ta formation. Installe-les chez toi pour continuer tes travaux ou expérimenter."
      />
      <Conteneur>
        <p className="mb-6 max-w-3xl text-muted-foreground">
          Pour te connecter, utilise ton identifiant du cégep (parfois juste ton matricule, parfois matricule@cegepmontpetit.ca) avec le même mot de passe qu&apos;au collège.
        </p>
        <ListeLogiciels logiciels={logicielsAvecCours()} />
      </Conteneur>
    </>
  );
}
