import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, Clock, ExternalLink, Link2, Mail, MapPin, Pencil, Phone, Video } from "lucide-react";
import { calendrierScolaire, indexCours, prof, profs } from "@/lib/donnees";
import { lienEdition, photo } from "@/lib/chemins";
import { AvatarProf } from "@/components/carte-prof";
import { SessionPerimee } from "@/components/session-perimee";
import { StatutProf } from "@/components/statut-prof";
import { HorairePrerempli } from "@/components/horaire-prerempli";
import { HoraireSemaine } from "@/components/horaire-semaine";
import { CalendrierMois } from "@/components/calendrier-mois";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fusionnerDispos } from "@/lib/horaire";
import { bouton } from "@/lib/bouton";

// Une page par prof : /react/<identifiant>, générée au build pour chaque fichier data/profs/*.yaml
export const dynamicParams = false;

export function generateStaticParams() {
  return profs().map((p) => ({ prof: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/[prof]">): Promise<Metadata> {
  const p = prof((await params).prof);
  if (!p) return {};
  return {
    title: p.nom,
    description: `Horaire, disponibilités et calendrier de ${p.nom}, prof au département d'informatique du Cégep Édouard-Montpetit.`,
    openGraph: p.photo ? { images: [photo(p.photo)] } : undefined,
  };
}

export default async function PageProf({ params }: PageProps<"/[prof]">) {
  const p = prof((await params).prof);
  if (!p) notFound();

  const scolaire = calendrierScolaire();
  const cours = indexCours();
  const session = scolaire.sessions.find((s) => s.id === p.session);
  const coursDonnes = [...new Set([...(p.cours ?? []), ...(p.horaire?.plages.flatMap((x) => (x.cours ? [x.cours] : [])) ?? [])].map((c) => c.toUpperCase()))];
  const dispos = fusionnerDispos(p.horaire?.plages ?? []);

  return (
    <>
      <section className="border-b bg-secondary/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center">
          <AvatarProf prof={p} taille={144} />
          <div className="flex-1 space-y-2">
            <div className="h-1 w-16 rounded bg-cem-vert" />
            <h1 className="text-3xl font-bold md:text-4xl">{p.nom}</h1>
            <StatutProf prof={p} />
            <SessionPerimee session={p.session} />
            {p.presentation && <p className="max-w-2xl text-muted-foreground">{p.presentation}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
              <a href={`mailto:${p.courriel}@cegepmontpetit.ca`} className={bouton({ size: "sm" })}>
                <Mail className="size-4" /> {p.courriel}@cegepmontpetit.ca
              </a>
              {p.bureau && (
                <span className={bouton({ variant: "outline", size: "sm" })}>
                  <MapPin className="size-4" /> Bureau {p.bureau}
                </span>
              )}
              {p.poste && (
                <a href={`tel:+14506792631,${p.poste}`} className={bouton({ variant: "outline", size: "sm" })}>
                  <Phone className="size-4" /> Poste {p.poste}
                </a>
              )}
              {p.github && (
                <a href={`https://github.com/${p.github}`} target="_blank" rel="noreferrer" className={bouton({ variant: "outline", size: "sm" })}>
                  GitHub
                </a>
              )}
              {p.linkedin && (
                <a href={`https://www.linkedin.com/in/${p.linkedin}`} target="_blank" rel="noreferrer" className={bouton({ variant: "outline", size: "sm" })}>
                  LinkedIn
                </a>
              )}
              {p.site && (
                <a href={p.site} target="_blank" rel="noreferrer" className={bouton({ variant: "outline", size: "sm" })}>
                  <ExternalLink className="size-4" /> Site web
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <Tabs defaultValue="horaire">
            <TabsList className="mb-4">
              <TabsTrigger value="horaire">
                <Clock className="size-4" /> Horaire
              </TabsTrigger>
              <TabsTrigger value="calendrier">
                <CalendarDays className="size-4" /> Calendrier
              </TabsTrigger>
              {p.video && (
                <TabsTrigger value="video">
                  <Video className="size-4" /> Présentation
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="horaire">
              {session && <p className="mb-3 text-sm text-muted-foreground">Horaire de la session {session.nom}. Survole une plage pour les détails.</p>}
              {p.horaire?.prerempli && <HorairePrerempli />}
              <HoraireSemaine plages={p.horaire?.plages ?? []} debut={p.horaire?.debut} fin={p.horaire?.fin} cours={cours} />
            </TabsContent>
            <TabsContent value="calendrier">
              <p className="mb-3 text-sm text-muted-foreground">
                Les congés et journées spéciales du cégep, les séances de cours{session ? ` de la session ${session.nom}` : ""} et les dates propres à {p.nom.split(" ")[0]}. Clique sur un jour pour les détails.
              </p>
              <CalendrierMois scolaire={scolaire} plages={p.horaire?.plages} evenements={p.calendrier} sessionId={p.session} />
            </TabsContent>
            {p.video && (
              <TabsContent value="video">
                <div className="aspect-video overflow-hidden rounded-lg border">
                  <iframe className="size-full" src={`https://www.youtube-nocookie.com/embed/${p.video}`} title={`Présentation de ${p.nom}`} allowFullScreen />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <aside className="space-y-6">
          {coursDonnes.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h2 className="mb-2 flex items-center gap-2 font-semibold">
                <BookOpen className="size-4" /> Cours
              </h2>
              <ul className="space-y-2 text-sm">
                {coursDonnes.map((c) => {
                  const info = cours[c];
                  return (
                    <li key={c}>
                      {info?.url ? (
                        <a href={info.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                          {info.nom} <ExternalLink className="inline size-3" />
                        </a>
                      ) : (
                        <span className="font-medium">{info?.nom ?? c}</span>
                      )}
                      <div className="text-xs text-muted-foreground">{c}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {dispos.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h2 className="mb-2 font-semibold">Disponibilités</h2>
              <ul className="space-y-1 text-sm">
                {dispos.map((d, i) => (
                  <li key={i}>
                    <span className="capitalize">{d.jour}</span> {d.debut}–{d.fin}
                    {d.local && <strong> · {d.local}</strong>}
                    {d.centreAide && <span className="text-muted-foreground"> (centre d&apos;aide)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-lg border bg-card p-4 text-sm">
            <h2 className="mb-2 flex items-center gap-2 font-semibold">
              <Link2 className="size-4" /> Liens directs
            </h2>
            <ul className="space-y-1">
              <li><Link href={`/${p.id}/horaire`} className="text-primary underline">Horaire</Link></li>
              <li><Link href={`/${p.id}/calendrier`} className="text-primary underline">Calendrier</Link></li>
            </ul>
            {coursDonnes[0] && (
              <p className="mt-2 text-xs text-muted-foreground">
                Depuis le site d&apos;un cours, ajoute <code className="break-all">?cours={coursDonnes[0]}</code> pour n&apos;afficher que ce cours.
              </p>
            )}
          </div>
          <div className="rounded-lg border border-dashed p-4 text-sm">
            <p className="mb-2 text-muted-foreground">C&apos;est ta page ? Modifie-la directement sur GitHub.</p>
            <a href={lienEdition(`profs/${p.id}.yaml`)} target="_blank" rel="noreferrer" className={bouton({ variant: "outline", size: "sm" })}>
              <Pencil className="size-4" /> Modifier ma page
            </a>
            <Link href="/modifier-mon-profil" className="mt-2 block text-xs text-primary underline">
              Mode d&apos;emploi
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
