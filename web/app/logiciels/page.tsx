import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, KeyRound } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { Apparition } from "@/components/apparition";
import { logiciels } from "@/lib/donnees";
import { bouton } from "@/lib/bouton";
import { chemin } from "@/lib/chemins";

export const metadata: Metadata = { title: "Logiciels gratuits" };

export default function PageLogiciels() {
  const liste = logiciels();
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
        <div className="grid gap-4 md:grid-cols-2">
          {liste.map((l, i) => (
            <Apparition key={l.nom} delai={i * 60} className={l.vedette ? "md:col-span-2" : ""}>
              <article className={`flex h-full flex-col rounded-lg border p-5 shadow-sm ${l.vedette ? "border-primary bg-accent" : "bg-card"}`}>
                {l.vedette && <span className="mb-2 w-fit rounded bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">À faire dès la première session</span>}
                <div className="flex items-center gap-3">
                  {l.logo && (
                    // Pastille blanche : certains logos (GitHub, JetBrains) sont noirs et disparaîtraient en thème sombre
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/10">
                      <Image src={chemin(`/images/logiciels/${l.logo}`)} alt="" width={32} height={32} unoptimized className="size-8 object-contain" />
                    </span>
                  )}
                  <h2 className="text-xl font-bold">{l.nom}</h2>
                </div>
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <KeyRound className="size-4" /> Identifiant : {l.identifiant}
                </p>
                <p className="mt-3 flex-1">{l.description}</p>
                <a href={l.lien} target="_blank" rel="noreferrer" className={bouton({ variant: l.vedette ? "default" : "outline" }, "mt-4 w-fit")}>
                  {l.bouton} <ExternalLink className="size-4" />
                </a>
              </article>
            </Apparition>
          ))}
        </div>
      </Conteneur>
    </>
  );
}
