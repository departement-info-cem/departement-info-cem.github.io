import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { VueDirecte } from "@/components/filtre-cours";
import { StatutProf } from "@/components/statut-prof";
import { BoutonPartager } from "@/components/bouton-partager";
import { indexCours, prof, profs } from "@/lib/donnees";

// Adresse directe /react/<prof>/horaire/ (avec ?cours=... au besoin), pour les liens des sites de cours.
export const dynamicParams = false;

export function generateStaticParams() {
  return profs().map((p) => ({ prof: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/[prof]/horaire">): Promise<Metadata> {
  const p = prof((await params).prof);
  return p ? { title: `Horaire de ${p.nom}` } : {};
}

export default async function Page({ params }: PageProps<"/[prof]/horaire">) {
  const p = prof((await params).prof);
  if (!p) notFound();
  return (
    <>
      <TitrePage titre={`Horaire de ${p.nom}`}>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <StatutProf prof={p} />
          <Link href={`/${p.id}`} className="text-primary underline">
            Page complète
          </Link>
          <Link href={`/${p.id}/calendrier`} className="text-primary underline">
            Calendrier
          </Link>
          <BoutonPartager titre={`Horaire de ${p.nom}`} />
        </div>
      </TitrePage>
      <Conteneur>
        <Suspense fallback={null}>
          <VueDirecte prof={p} vue="horaire" cours={indexCours()} />
        </Suspense>
      </Conteneur>
    </>
  );
}
