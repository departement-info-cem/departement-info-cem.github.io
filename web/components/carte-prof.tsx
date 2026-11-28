import Image from "next/image";
import Link from "next/link";
import type { Prof } from "@/app/_types/prof";
import { photo } from "@/lib/chemins";
import { StatutProf } from "@/components/statut-prof";
import { PastilleLien } from "@/components/choix-groupe";
import type { Lien } from "@/lib/mes-cours";

export function initiales(nom: string): string {
  return nom
    .split(/[\s-]+/)
    .filter((m) => /^[A-ZÀ-Ý]/.test(m))
    .map((m) => m[0])
    .slice(0, 2)
    .join("");
}

export function AvatarProf({ prof, taille }: { prof: Pick<Prof, "nom" | "photo">; taille: number }) {
  if (prof.photo) {
    return <Image src={photo(prof.photo)} alt={`Photo de ${prof.nom}`} width={taille} height={taille} className="aspect-square rounded-full object-cover" style={{ width: taille, height: taille }} />;
  }
  return (
    <span className="flex aspect-square items-center justify-center rounded-full bg-cem-marine font-bold text-white dark:bg-cem-vert dark:text-cem-marine" style={{ width: taille, height: taille, fontSize: taille / 2.6 }} aria-hidden>
      {initiales(prof.nom)}
    </span>
  );
}

// lien : mon prof (encadré vert) ou prof d'un de mes cours, selon « Mes cours »
export function CarteProf({ prof, lien }: { prof: Prof; lien?: Lien }) {
  return (
    <Link href={`/${prof.id}`} className={`group flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md ${lien?.niveau === "mon-prof" ? "border-cem-vert ring-2 ring-cem-vert" : ""}`}>
      <AvatarProf prof={prof} taille={64} />
      <div className="min-w-0">
        <div className="font-semibold group-hover:text-primary">{prof.nom}</div>
        {prof.role && <div className="text-sm font-medium text-primary">{prof.role}</div>}
        {prof.bureau && <div className="text-sm text-muted-foreground">Bureau {prof.bureau}</div>}
        <div className="mt-1 flex flex-wrap gap-1">
          {lien && <PastilleLien lien={lien} />}
          <StatutProf prof={prof} compact />
        </div>
      </div>
    </Link>
  );
}
