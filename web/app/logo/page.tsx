import type { Metadata } from "next";
import Image from "next/image";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { Logo, SymboleLogo, type VarianteLogo } from "@/components/logo";
import { chemin } from "@/lib/chemins";

export const metadata: Metadata = { title: "Propositions de logo", robots: { index: false } };

const PROPOSITIONS: { variante: VarianteLogo; nom: string; idee: string }[] = [
  { variante: "binaire", nom: "A. Binaire", idee: "L'évolution de l'ancien logo : la colonne blanche avec le 0 et le 1, et une invite de commande >_ aux couleurs du cégep. C'est celle utilisée sur le site." },
  { variante: "accolades", nom: "B. Accolades", idee: "Un « i » d'informatique entre deux accolades de code, simple et lisible même en tout petit." },
  { variante: "pixels", nom: "C. Pixels", idee: "Le M de Montpetit dessiné en pixels ; les pixels verts tracent un V comme dans le symbole du cégep." },
];

export default function PageLogo() {
  return (
    <>
      <TitrePage titre="Propositions de logo" sousTitre="Trois pistes pour revisiter le logo du département, dans la palette officielle du cégep. À choisir en réunion de département !" />
      <Conteneur className="space-y-8">
        <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-card p-4">
          <span className="text-sm text-muted-foreground">Ancien logo :</span>
          <Image src={chemin("/images/logo-ancien.svg")} alt="Ancien logo du département" width={120} height={80} unoptimized />
        </div>
        {PROPOSITIONS.map((p) => (
          <section key={p.variante} className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-bold">{p.nom}</h2>
            <p className="mb-4 text-muted-foreground">{p.idee}</p>
            <div className="grid items-center gap-6 md:grid-cols-4">
              <div className="flex items-center justify-center rounded-lg bg-white p-6">
                <SymboleLogo variante={p.variante} taille={128} />
              </div>
              <div className="flex items-center justify-center rounded-lg bg-white p-6">
                <Logo variante={p.variante} taille={48} />
              </div>
              <div className="flex items-center justify-center rounded-lg bg-cem-marine p-6">
                <Logo variante={p.variante} taille={48} inverse />
              </div>
              <div className="flex items-end justify-center gap-4 rounded-lg bg-muted p-6">
                <SymboleLogo variante={p.variante} taille={16} />
                <SymboleLogo variante={p.variante} taille={32} />
                <SymboleLogo variante={p.variante} taille={64} />
              </div>
            </div>
          </section>
        ))}
      </Conteneur>
    </>
  );
}
