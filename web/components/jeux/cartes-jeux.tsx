"use client";
import Link from "next/link";
import { ArrowRight, Bot, Network } from "lucide-react";
import { useStockageLocal } from "@/app/_hooks/use-stockage-local";

const JEUX = [
  { href: "/jeux/programmation", icone: Bot, titre: "Octet, le robot", texte: "Programme un petit robot en Python : séquences, boucles, conditions… jusqu'à un algorithme de labyrinthe.", cle: "jeu-robot-reussis", grille: "DEC Dév" },
  { href: "/jeux/reseau", icone: Network, titre: "Panne à la salle réseau", texte: "Promène-toi dans la salle, lis les diodes, rebranche et configure jusqu'à ce que le ping passe.", cle: "jeu-reseau-reussis", grille: "DEC Réseau" },
];

function Carte({ jeu }: { jeu: (typeof JEUX)[number] }) {
  const [reussis] = useStockageLocal<number[]>(jeu.cle, []);
  return (
    <Link href={jeu.href} className="group flex h-full gap-4 rounded-lg border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-cem-marine text-cem-vert">
        <jeu.icone className="size-8" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between font-bold group-hover:text-primary">
          {jeu.titre} <ArrowRight className="size-4" />
        </span>
        <span className="block text-sm text-muted-foreground">{jeu.texte}</span>
        <span className="mt-2 flex items-center gap-1" aria-label={`${reussis.length} niveaux réussis sur 5`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-1.5 w-8 rounded-full ${reussis.includes(i) ? "bg-primary" : "bg-muted"}`} />
          ))}
          <span className="ml-2 text-xs text-muted-foreground">{jeu.grille}</span>
        </span>
      </span>
    </Link>
  );
}

export function CartesJeux() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {JEUX.map((j) => (
        <Carte key={j.href} jeu={j} />
      ))}
    </div>
  );
}
