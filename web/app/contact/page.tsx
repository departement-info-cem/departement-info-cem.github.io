import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { bouton } from "@/lib/bouton";

export const metadata: Metadata = { title: "Nous joindre" };

export default function PageContact() {
  return (
    <>
      <TitrePage titre="Nous joindre" sousTitre="Une seule adresse pour toutes tes questions sur les programmes du département." />
      <Conteneur className="space-y-6">
        <a href="mailto:coordination.info@cegepmontpetit.ca" className={bouton({ size: "lg" }, "h-auto max-w-full whitespace-normal py-3 text-base")}>
          {/* Sur un écran étroit, l'adresse passe à la ligne après le @ */}
          <Mail className="size-5" /> <span>coordination.info@<wbr />cegepmontpetit.ca</span>
        </a>
        <p className="max-w-2xl text-muted-foreground">
          Tu cherches un prof en particulier ? Chaque prof a sa page avec son bureau et ses disponibilités ; pour lui écrire, passe par Teams : <Link href="/profs" className="text-primary underline">voir les profs</Link>.
        </p>
      </Conteneur>
    </>
  );
}
