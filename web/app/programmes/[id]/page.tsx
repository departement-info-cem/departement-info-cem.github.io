import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Info, Scale } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { GrilleProgramme } from "@/components/grille-programme";
import { coursCommuns, programme, programmes, profsParCours } from "@/lib/donnees";
import { bouton } from "@/lib/bouton";

export const dynamicParams = false;

export function generateStaticParams() {
  return programmes().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/programmes/[id]">): Promise<Metadata> {
  const p = programme((await params).id);
  return p ? { title: `Grille de cours — ${p.court}`, description: p.resume } : {};
}

export default async function PageProgramme({ params }: PageProps<"/programmes/[id]">) {
  const p = programme((await params).id);
  if (!p) notFound();
  const autres = programmes().filter((x) => x.id !== p.id);
  const famille = p.famille ? programmes().filter((x) => x.famille === p.famille && x.id !== p.id) : [];

  return (
    <>
      <TitrePage titre={p.nom} sousTitre={p.resume}>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          {p.code && <span className="rounded bg-background px-2 py-1 font-mono">{p.code}</span>}
          <span className="rounded bg-background px-2 py-1">{p.duree}</span>
          {famille.map((f) => (
            <Link key={f.id} href={`/programmes/${f.id}`} className={bouton({ variant: "outline", size: "sm" })}>
              Voir l&apos;autre profil : {f.court}
            </Link>
          ))}
          <Link href={`/programmes/comparer/?a=${p.id}&b=${famille[0]?.id ?? autres[0].id}`} className={bouton({ variant: "outline", size: "sm" })}>
            <Scale className="size-4" /> Comparer
          </Link>
          {p.lien && (
            <a href={p.lien} target="_blank" rel="noreferrer" className={bouton({ variant: "outline", size: "sm" })}>
              Plus d&apos;infos <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      </TitrePage>
      <Conteneur>
        {p.remarque && (
          <p className="mb-6 flex gap-2 rounded-md border border-cem-ciel/40 bg-cem-ciel/10 p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-cem-ciel" /> {p.remarque}
          </p>
        )}
        <GrilleProgramme programme={p} coursCommuns={coursCommuns(p.id)} profsParCours={profsParCours()} />
        {p.source && (
          <p className="mt-6 text-xs text-muted-foreground">
            Source :{" "}
            <a href={p.source} target="_blank" rel="noreferrer" className="underline">
              {p.source}
            </a>
          </p>
        )}
      </Conteneur>
    </>
  );
}
