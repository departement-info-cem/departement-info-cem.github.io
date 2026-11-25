"use client";
import Image from "next/image";
import { ExternalLink, KeyRound, Star } from "lucide-react";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { Apparition } from "@/components/apparition";
import type { LogicielAffiche } from "@/lib/donnees";
import { bouton } from "@/lib/bouton";
import { chemin } from "@/lib/chemins";
import { court } from "@/lib/mes-cours";

// Les logiciels gratuits. Avec « Mes cours », ceux qui servent dans mes cours passent juste après le logiciel vedette.
export function ListeLogiciels({ logiciels }: { logiciels: LogicielAffiche[] }) {
  const { mesCours } = useMesCours();
  const pourMoi = (l: LogicielAffiche) => l.coursLies.filter((no) => mesCours.some((m) => m.cours === no));
  const rang = (l: LogicielAffiche) => (l.vedette ? 0 : pourMoi(l).length ? 1 : 2);
  const tries = logiciels.map((l, i) => ({ l, i })).sort((a, b) => rang(a.l) - rang(b.l) || a.i - b.i).map(({ l }) => l);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tries.map((l, i) => {
        const miens = pourMoi(l);
        return (
          <Apparition key={l.nom} delai={i * 60} className={l.vedette ? "md:col-span-2" : ""}>
            <article className={`flex h-full flex-col rounded-lg border p-5 shadow-sm ${l.vedette ? "border-primary bg-accent" : miens.length ? "border-cem-vert bg-card ring-2 ring-cem-vert" : "bg-card"}`}>
              {l.vedette && <span className="mb-2 w-fit rounded bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">À faire dès la première session</span>}
              {miens.length > 0 && (
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-cem-vert px-2 py-0.5 text-xs font-semibold text-cem-marine">
                  <Star className="size-3 fill-current" /> Pour tes cours : {miens.map(court).join(", ")}
                </span>
              )}
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
        );
      })}
    </div>
  );
}
