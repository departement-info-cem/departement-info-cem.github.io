"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Globe } from "lucide-react";
import type { CoursAffiche, Programme } from "@/app/_types/programme";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { IconeTag, LIBELLES_TAGS } from "@/components/icone-tag";
import { totalHeures } from "@/lib/programmes";

export type ProfsParCours = Record<string, { id: string; nom: string }[]>;

function CarteCours({ c, attenue, commun, onClick }: { c: CoursAffiche; attenue: boolean; commun?: boolean; onClick: () => void }) {
  const ecole = c.ecole === "UdeS";
  // Le site du cours, sinon sa fiche officielle (UdeS)
  const lien = c.url ?? c.fiche;
  return (
    <div className="relative">
    <button
      onClick={onClick}
      className={`group w-full rounded-md border p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        ecole ? "border-cem-vert bg-cem-vert-pale text-cem-marine" : c.departement ? "border-l-4 border-l-primary bg-card" : "bg-muted"
      } ${attenue ? "opacity-25" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-snug group-hover:text-primary">{c.nom}</span>
        {lien && <span className="h-5 w-14 shrink-0" aria-hidden />}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {c.no && <span className="tabular-nums">{c.no}</span>}
        {c.heures ? <span>{c.heures} h</span> : null}
        {ecole && <span className="rounded bg-cem-foret px-1 text-white">UdeS</span>}
        {commun && <span className="rounded bg-secondary px-1 text-secondary-foreground">tronc commun</span>}
        <span className="ml-auto flex gap-1">
          {c.tags.slice(0, 3).map((t) => (
            <IconeTag key={t} tag={t} className="size-3.5" />
          ))}
        </span>
      </div>
    </button>
      {lien && (
        <a
          href={lien}
          target="_blank"
          rel="noreferrer"
          aria-label={`${c.url ? "Site web" : "Fiche"} du cours ${c.nom}`}
          className={`absolute right-2 top-2 flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground transition hover:brightness-110 ${attenue ? "opacity-25" : ""}`}
        >
          {c.url ? <Globe className="size-3" /> : <FileText className="size-3" />} {c.url ? "Site" : "Fiche"}
        </a>
      )}
    </div>
  );
}

export function GrilleProgramme({
  programme,
  coursCommuns = [],
  profsParCours = {},
}: {
  programme: Programme;
  /** numéros des cours partagés avec les autres programmes de la même famille */
  coursCommuns?: string[];
  profsParCours?: ProfsParCours;
}) {
  const [tag, setTag] = useState<string | null>(null);
  const [choisi, setChoisi] = useState<CoursAffiche | null>(null);
  const tous = programme.sessions.flatMap((s) => s.cours);
  // Les listes « au choix » ne comptent pas dans les totaux (on n'en suit qu'un)
  const suivis = programme.sessions.filter((s) => !s.auChoix).flatMap((s) => s.cours);
  const nbChoix = programme.sessions.filter((s) => s.auChoix).length;
  const tags = useMemo(() => [...new Set(tous.flatMap((c) => c.tags))].filter((t) => t !== "fg" && t !== "choix").sort(), [tous]);
  const heuresDep = totalHeures(suivis.filter((c) => c.departement));
  const total = totalHeures(suivis);
  const parColonnes = programme.sessions.length <= 6 && programme.sessions.every((s) => s.cours.length <= 8);

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-3">
          <div className="text-2xl font-bold text-primary">{suivis.length + nbChoix}</div>
          <div className="text-sm text-muted-foreground">cours{nbChoix ? ` (dont ${nbChoix} au choix)` : ""}</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="text-2xl font-bold text-primary">{total ? `${total} h` : "-"}</div>
          <div className="text-sm text-muted-foreground">heures de cours{programme.type === "dec-bac" ? " au cégep" : ""}</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="text-2xl font-bold text-primary">{heuresDep ? `${heuresDep} h` : suivis.filter((c) => c.departement).length}</div>
          <div className="text-sm text-muted-foreground">{heuresDep ? "en informatique (420)" : "cours d'informatique"}{nbChoix ? ", sans les cours au choix" : ""}</div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="no-print mb-4 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-sm text-muted-foreground">Filtrer :</span>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? null : t)}
              aria-pressed={tag === t}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs transition ${tag === t ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              <IconeTag tag={t} className="size-3" />
              {LIBELLES_TAGS[t] ?? t}
            </button>
          ))}
        </div>
      )}

      <div className={parColonnes ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-6"}>
        {programme.sessions.map((s) => (
          <section key={s.titre} className="rounded-lg border bg-muted p-3">
            <header className="mb-2 flex items-baseline justify-between gap-2">
              <h3 className="font-bold">{s.titre}</h3>
              {s.auChoix ? (
                <span className="text-xs text-muted-foreground">1 cours</span>
              ) : (
                totalHeures(s.cours) > 0 && <span className="text-xs text-muted-foreground">{totalHeures(s.cours)} h</span>
              )}
            </header>
            <div className={parColonnes ? "space-y-2" : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"}>
              {s.cours.map((c, i) => (
                <CarteCours key={`${c.no ?? c.nom}-${i}`} c={c} attenue={tag !== null && !c.tags.includes(tag)} commun={c.no ? coursCommuns.includes(c.no) : false} onClick={() => setChoisi(c)} />
              ))}
            </div>
            {s.note && <p className="mt-3 rounded-md bg-background/70 p-2 text-sm">{s.note}</p>}
          </section>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-4 rounded-sm border-l-4 border-l-primary bg-card" /> Cours du département d&apos;informatique
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-4 rounded-sm bg-muted" /> Autres cours (formation générale, sciences...)
        </span>
        {tous.some((c) => c.ecole === "UdeS") && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-4 rounded-sm border border-cem-vert bg-cem-vert-pale" /> Université de Sherbrooke (campus Longueuil)
          </span>
        )}
        <span className="flex items-center gap-1">
          <Globe className="size-3 text-primary" /> Bouton « Site » : ouvre le site web du cours
        </span>
        {tous.some((c) => c.fiche) && (
          <span className="flex items-center gap-1">
            <FileText className="size-3 text-primary" /> Bouton « Fiche » : ouvre la fiche du cours à l&apos;Université de Sherbrooke
          </span>
        )}
      </div>

      <Dialog open={choisi !== null} onOpenChange={(o) => !o && setChoisi(null)}>
        <DialogContent>
          <DialogTitle>{choisi?.nom}</DialogTitle>
          <DialogDescription>
            {[choisi?.no, choisi?.heures && `${choisi.heures} heures`, choisi?.ponderation && `pondération ${choisi.ponderation}`, choisi?.ecole === "UdeS" && "Université de Sherbrooke"]
              .filter(Boolean)
              .join(" · ")}
          </DialogDescription>
          {choisi?.description && <p>{choisi.description}</p>}
          {choisi && choisi.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {choisi.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  <IconeTag tag={t} className="size-3" /> {LIBELLES_TAGS[t] ?? t}
                </span>
              ))}
            </div>
          )}
          {choisi?.no && profsParCours[choisi.no.toUpperCase()]?.length ? (
            <div>
              <h4 className="mb-1 text-sm font-bold">Profs qui le donnent cette session</h4>
              <ul className="flex flex-wrap gap-2">
                {profsParCours[choisi.no.toUpperCase()].map((p) => (
                  <li key={p.id}>
                    <Link href={`/${p.id}`} className="text-sm text-primary underline">
                      {p.nom}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {choisi?.url && (
            <a href={choisi.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary underline">
              Site du cours <ExternalLink className="size-4" />
            </a>
          )}
          {choisi?.fiche && (
            <a href={choisi.fiche} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary underline">
              Fiche du cours (Université de Sherbrooke) <ExternalLink className="size-4" />
            </a>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
