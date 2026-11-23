import type { Metadata } from "next";
import Link from "next/link";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { CartesJeux } from "@/components/jeux/cartes-jeux";

export const metadata: Metadata = { title: "Teste ta logique" };

export default function PageJeux() {
  return (
    <>
      <TitrePage titre="Teste ta logique" sousTitre="Deux petits jeux, cinq niveaux chacun. Aucune connaissance préalable : si tu y prends plaisir, l'informatique est peut-être pour toi." />
      <Conteneur className="space-y-6">
        <CartesJeux />
        <p className="text-sm text-muted-foreground">
          Ta progression est gardée dans ton navigateur seulement. Pas le goût de jouer ?{" "}
          <Link href="/orientation" className="text-primary underline">Réponds plutôt aux questions du bot</Link>.
        </p>
      </Conteneur>
    </>
  );
}
