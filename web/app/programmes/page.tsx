import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { programmes } from "@/lib/donnees";
import { totalHeures } from "@/lib/programmes";
import { Apparition } from "@/components/apparition";
import { bouton } from "@/lib/bouton";

export const metadata: Metadata = { title: "Programmes et grilles de cours" };

const GROUPES = [
  { types: ["dec", "dec-bac"], titre: "Formation régulière", texte: "Après le secondaire : la technique en 3 ans ou le DEC-BAC en 5 ans." },
  { types: ["aec"], titre: "Formation aux adultes (AEC)", texte: "Des parcours intensifs pour se réorienter vers l'informatique." },
];

export default function PageProgrammes() {
  const liste = programmes();
  return (
    <>
      <TitrePage titre="Programmes et grilles de cours" sousTitre="Toutes les grilles sont présentées de la même façon : clique sur un cours pour voir ses détails, filtre par techno, compare deux programmes.">
        <Link href="/programmes/comparer" className={bouton(undefined, "mt-4")}>
          <Scale className="size-4" /> Comparer deux programmes
        </Link>
      </TitrePage>
      <Conteneur className="space-y-12">
        {GROUPES.map((g) => (
          <section key={g.titre}>
            <h2 className="text-2xl font-bold">{g.titre}</h2>
            <p className="mb-4 text-muted-foreground">{g.texte}</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {liste
                .filter((p) => g.types.includes(p.type))
                .map((p, i) => {
                  const cours = p.sessions.filter((s) => !s.auChoix).flatMap((s) => s.cours);
                  return (
                    <Apparition key={p.id} delai={i * 80}>
                      <Link href={`/programmes/${p.id}`} className="group flex h-full flex-col rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
                        <span className="mb-2 w-fit rounded bg-secondary px-2 py-0.5 text-xs font-semibold uppercase text-secondary-foreground">{p.court}</span>
                        <h3 className="text-lg font-bold leading-snug group-hover:text-primary">{p.nom}</h3>
                        <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.resume}</p>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {p.duree.split(/ ?[,(]/)[0]} · {cours.length} cours{totalHeures(cours) ? ` · ${totalHeures(cours)} h` : ""}
                          </span>
                          <ArrowRight className="size-4 text-primary transition group-hover:translate-x-1" />
                        </div>
                      </Link>
                    </Apparition>
                  );
                })}
            </div>
          </section>
        ))}
        <section>
          <h2 className="text-2xl font-bold">Le département ailleurs au cégep</h2>
          <p className="mb-4 text-muted-foreground">Sciences de la nature, intégration multimédia, administration, cours à option.</p>
          <Link href="/cours-service" className={bouton({ variant: "outline" })}>
            Voir les cours de service <ArrowRight className="size-4" />
          </Link>
        </section>
      </Conteneur>
    </>
  );
}
