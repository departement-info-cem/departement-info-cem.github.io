"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Trash2, TriangleAlert, X } from "lucide-react";
import type { Plage } from "@/app/_types/prof";
import { useMesCours, useMonCalendrier } from "@/app/_contexts/mes-cours-context";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { AVenir } from "@/components/a-venir";
import { CalendrierMois } from "@/components/calendrier-mois";
import { AjoutCours, texteSeances } from "@/components/choix-groupe";
import { HoraireSemaine } from "@/components/horaire-semaine";
import { bouton } from "@/lib/bouton";
import { chemin } from "@/lib/chemins";
import { court, libelle, type MonCours } from "@/lib/mes-cours";
import type { LogicielAffiche } from "@/lib/donnees";

// Page « Mes cours » : les choix de l'étudiant, son horaire avec les dispos de ses profs, les logiciels de ses cours.
export function GestionMesCours({ logiciels }: { logiciels: LogicielAffiche[] }) {
  const { tous, mesCours, groupes, profs, cours: index, perime, retirer, vider } = useMesCours();
  const [autresProfs, setAutresProfs] = useState(false);
  const groupeDe = (m: MonCours) => (m.prof ? groupes[m.cours]?.find((g) => g.prof === m.prof && g.groupe === m.groupe) : undefined);
  const perimes = tous.filter(perime);

  const { seances, evenements, session, jours } = useMonCalendrier();
  const scolaire = useScolaire();
  // Mon horaire : les séances de mes groupes, puis les dispos de mes profs (et, au choix, des autres profs de mes cours)
  const mesProfs = new Set(mesCours.flatMap((m) => (m.prof ? [m.prof] : [])));
  const profsDeMesCours = new Set(mesCours.flatMap((m) => (groupes[m.cours] ?? []).map((g) => g.prof)).filter((id) => !mesProfs.has(id)));
  const plages: Plage[] = [
    ...seances,
    ...[...mesProfs, ...(autresProfs ? profsDeMesCours : [])].flatMap((id) => (profs[id]?.dispos ?? []).map((d) => ({ ...d, titre: `${d.type === "centre-aide" ? "Centre d'aide" : "Dispo"} · ${profs[id].nom}` }))),
  ];
  const mesNumeros = new Set(mesCours.map((m) => m.cours));
  const utiles = logiciels.filter((l) => l.coursLies.some((no) => mesNumeros.has(no)));

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="mb-3 text-2xl font-bold">Mes cours</h2>
          {tous.length === 0 && (
            <p className="text-muted-foreground">
              Aucun cours pour l&apos;instant. Ajoute-les ici, ou avec le bouton « C&apos;est mon prof » sur la page d&apos;un prof, ou « C&apos;est mon cours » dans une{" "}
              <Link href="/programmes" className="text-primary underline">grille de cours</Link>.
            </p>
          )}
          {perimes.length > 0 && (
            <p className="mb-3 flex items-start gap-2 rounded-md border border-cem-jaune bg-cem-jaune-pale p-3 text-sm text-cem-marine">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" /> Certains choix datent d&apos;une session passée : l&apos;horaire de ces profs a changé. Retire-les et choisis tes nouveaux groupes.
            </p>
          )}
          <ul className="space-y-2">
            {tous.map((m) => {
              const g = groupeDe(m);
              return (
                <li key={`${m.cours}|${m.prof ?? ""}|${m.groupe ?? ""}`} className={`flex items-start gap-3 rounded-md border bg-card p-3 ${perime(m) ? "opacity-60" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">
                      {libelle(m)} · {index[m.cours]?.nom ?? m.cours}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {m.prof ? (
                        <Link href={`/${m.prof}`} className="text-primary underline">{profs[m.prof]?.nom ?? m.prof}</Link>
                      ) : (
                        "Groupe pas choisi"
                      )}
                      {perime(m) ? " · session passée" : g ? ` · ${texteSeances(g.seances)}` : ""}
                    </div>
                  </div>
                  <button onClick={() => retirer(m)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={`Retirer ${libelle(m)}`} title="Retirer">
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          {tous.length > 0 && (
            <button onClick={vider} className={bouton({ variant: "ghost", size: "sm" }, "mt-2 text-muted-foreground")}>
              <Trash2 className="size-4" /> Tout effacer
            </button>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Tes choix restent dans ce navigateur : rien n&apos;est envoyé, et ils n&apos;apparaissent pas sur un autre appareil.</p>
        </div>
        <div className="rounded-lg border bg-muted p-4">
          <h2 className="mb-3 text-xl font-bold">Ajouter un cours</h2>
          <AjoutCours />
        </div>
      </section>

      {mesCours.length > 0 && (
        <section>
          <h2 className="mb-1 text-2xl font-bold">À venir</h2>
          <p className="mb-3 text-sm text-muted-foreground">Les trois prochaines semaines : évaluations, remises, cours annulés ou déplacés, congés. Mis à jour dès que ton prof modifie sa fiche.</p>
          <AVenir jours={jours} nbJours={21} />
        </section>
      )}

      {mesCours.length > 0 && (
        <section>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold">Mon horaire</h2>
            {profsDeMesCours.size > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={autresProfs} onChange={(e) => setAutresProfs(e.target.checked)} className="size-4 accent-[var(--primary)]" />
                Ajouter les dispos des autres profs de mes cours
              </label>
            )}
          </div>
          <p className="mb-3 text-sm text-muted-foreground">Tes cours et les disponibilités de tes profs. Les congés et les horaires modifiés sont dans le calendrier de chaque prof.</p>
          <HoraireSemaine plages={plages} cours={index} vide="Tes profs n'ont pas encore inscrit l'horaire de tes groupes." impression={{ titre: "Mon horaire", details: mesCours.map(libelle) }} />
        </section>
      )}

      {mesCours.length > 0 && (
        <section>
          <h2 className="mb-1 text-2xl font-bold">Mon calendrier</h2>
          <p className="mb-3 text-sm text-muted-foreground">Tes séances, les dates que tes profs ont inscrites pour tes cours et ton groupe, et le calendrier du cégep. Les évaluations sommatives sont encadrées.</p>
          <CalendrierMois scolaire={scolaire} plages={seances} evenements={evenements} sessionId={session} />
        </section>
      )}

      {utiles.length > 0 && (
        <section>
          <h2 className="mb-3 text-2xl font-bold">Logiciels gratuits pour mes cours</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {utiles.map((l) => (
              <li key={l.nom} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                {l.logo && (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/10">
                    <Image src={chemin(`/images/logiciels/${l.logo}`)} alt="" width={28} height={28} unoptimized className="size-7 object-contain" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{l.nom}</div>
                  <div className="text-xs text-muted-foreground">Pour {l.coursLies.filter((no) => mesNumeros.has(no)).map(court).join(", ")}</div>
                </div>
                <a href={l.lien} target="_blank" rel="noreferrer" className={bouton({ variant: "outline", size: "sm" })} aria-label={l.bouton}>
                  <ExternalLink className="size-4" />
                </a>
              </li>
            ))}
          </ul>
          <Link href="/logiciels" className="mt-2 inline-block text-sm text-primary underline">Tous les logiciels gratuits</Link>
        </section>
      )}
    </div>
  );
}
