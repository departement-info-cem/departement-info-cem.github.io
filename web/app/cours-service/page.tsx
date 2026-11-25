import type { Metadata } from "next";
import { ExternalLink, Globe } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { coursService, profsParCours, type ServiceAffiche } from "@/lib/donnees";
import Link from "next/link";
import { BoutonChoixGroupe } from "@/components/choix-groupe";

export const metadata: Metadata = { title: "Sciences de la nature et cours de service" };

export default function PageCoursService() {
  const profs = profsParCours();
  const disciplines = coursService().filter((p) => p.discipline);
  const services = coursService().filter((p) => !p.discipline);
  return (
    <>
      <TitrePage titre="Sciences de la nature et cours de service" sousTitre="L'informatique est une discipline du programme Sciences de la nature. Le département donne aussi des cours de service dans d'autres programmes du cégep." />
      <Conteneur className="space-y-10">
        {/* Sciences de la nature d'abord : c'est une discipline du programme, pas un cours de service */}
        <div className="space-y-6">
          {disciplines.map((p) => (
            <Programme key={p.programme} p={p} profs={profs} />
          ))}
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">Cours de service</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((p) => (
              <Programme key={p.programme} p={p} profs={profs} />
            ))}
          </div>
        </div>
      </Conteneur>
    </>
  );
}

function Programme({ p, profs }: { p: ServiceAffiche; profs: ReturnType<typeof profsParCours> }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold uppercase text-secondary-foreground">{p.court}</span>
      <h3 className="mt-2 text-xl font-bold">{p.programme}</h3>
      {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
      <ul className="mt-4 space-y-3">
        {p.cours.map((c) => (
          <li key={c.no} className="rounded-md border border-l-4 border-l-primary p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold">{c.info.nom}</span>
              {c.info.url && (
                <a href={c.info.url} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-1 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  <Globe className="size-3" /> Site
                </a>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="tabular-nums">{c.info.no}</span>
              {c.info.ponderation && ` · ${c.info.ponderation}`}
              {c.info.heures && ` · ${c.info.heures} h`}
            </div>
            {c.quand.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-sm">
                {c.quand.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            )}
            {profs[c.info.no!.toUpperCase()] && (
              <p className="mt-1 text-sm">
                Donné par{" "}
                {profs[c.info.no!.toUpperCase()].map((x, i) => (
                  <span key={x.id}>
                    {i > 0 && ", "}
                    <Link href={`/${x.id}`} className="text-primary underline">{x.nom}</Link>
                  </span>
                ))}
              </p>
            )}
            <BoutonChoixGroupe cours={c.info.no!.toUpperCase()} className="mt-2" />
          </li>
        ))}
      </ul>
      {p.lien && (
        <a href={p.lien} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-primary underline">
          Le programme <ExternalLink className="size-3" />
        </a>
      )}
    </section>
  );
}
