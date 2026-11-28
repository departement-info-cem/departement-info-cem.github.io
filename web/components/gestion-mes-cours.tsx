"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, BookmarkPlus, ChevronDown, ExternalLink, Pencil, Trash2, TriangleAlert, X } from "lucide-react";
import { useMesCours, useMonCalendrier } from "@/app/_contexts/mes-cours-context";
import { AgendaMesCours } from "@/components/agenda-mes-cours";
import { AVenir } from "@/components/a-venir";
import { MonCalendrier, MonHoraire } from "@/components/mon-horaire";
import { AjoutCours, SANS_HORAIRE, texteSeance, texteSeances } from "@/components/choix-groupe";
import { AvatarProf } from "@/components/carte-prof";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CarteInstallation } from "@/components/installer-appli";
import { bouton } from "@/lib/bouton";
import { chemin } from "@/lib/chemins";
import { court, libelle, type MonCours } from "@/lib/mes-cours";
import type { LogicielAffiche } from "@/lib/donnees";

// Page « Mes cours » : le résumé de mes cours, mon horaire avec les dispos de mes profs, les logiciels de mes cours.
// Les choix se modifient rarement (une fois par session) : dans une fenêtre, pour laisser la page à ce qui sert chaque semaine.
export function GestionMesCours({ logiciels }: { logiciels: LogicielAffiche[] }) {
  const { tous, mesCours, perime } = useMesCours();
  // La fenêtre « Modifier mes cours » : fermée (null), ou ouverte, au besoin sur le choix du groupe d'un cours
  const [fenetre, setFenetre] = useState<{ cours?: string } | null>(null);
  const perimes = tous.filter(perime);

  const { jours } = useMonCalendrier();
  const mesNumeros = new Set(mesCours.map((m) => m.cours));
  const utiles = logiciels.filter((l) => l.coursLies.some((no) => mesNumeros.has(no)));

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold">Mes cours</h2>
          <div className="flex flex-col items-center">
            <button onClick={() => setFenetre({})} className={bouton({ variant: tous.length ? "outline" : "default" })}>
              {tous.length ? <Pencil className="size-4" /> : <BookmarkPlus className="size-4" />}
              {tous.length ? "Modifier mes cours" : "Ajouter mes cours"}
            </button>
            {tous.length === 0 && <ArrowUp className="mt-1 size-6 text-primary motion-safe:animate-bounce" aria-hidden />}
          </div>
        </div>
        {tous.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-muted-foreground">
            <strong className="text-foreground">Aucun cours pour l&apos;instant.</strong> Ajoute-les avec le bouton ci-dessus : tes profs passent en premier sur le site, avec leurs disponibilités, et tu
            retrouves ici ton horaire. Tu peux aussi utiliser « C&apos;est mon prof » sur la page d&apos;un prof, ou « C&apos;est mon cours » dans une{" "}
            <Link href="/programmes" className="text-primary underline">grille de cours</Link>.
          </p>
        ) : (
          <>
            {perimes.length > 0 && (
              <p className="mb-3 flex items-start gap-2 rounded-md border border-cem-jaune bg-cem-jaune-pale p-3 text-sm text-cem-marine">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" /> Certains choix datent d&apos;une session passée : l&apos;horaire de ces profs a changé. Ouvre-les pour choisir tes nouveaux groupes.
              </p>
            )}
            <ul className="grid items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {/* Un seul choix par cours : changer de groupe garde le cours déplié */}
              {tous.map((m) => (
                <li key={m.cours}>
                  <ResumeCours m={m} choisirGroupe={() => setFenetre({ cours: m.cours })} />
                </li>
              ))}
            </ul>
          </>
        )}
        <CarteInstallation />
        <FenetreMesCours fenetre={fenetre} fermer={() => setFenetre(null)} />
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
          <h2 id="horaire" className="mb-1 text-2xl font-bold">Mon horaire</h2>
          <MonHoraire />
        </section>
      )}

      {mesCours.length > 0 && (
        <section>
          <h2 id="calendrier" className="mb-1 text-2xl font-bold">Mon calendrier</h2>
          <MonCalendrier />
        </section>
      )}

      {mesCours.length > 0 && (
        <section>
          <h2 id="agenda" className="mb-1 text-2xl font-bold">Ajouter à mon agenda</h2>
          <AgendaMesCours />
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

/** Un de mes cours : son sigle et son titre ; un clic montre le groupe, le prof et l'horaire. */
function ResumeCours({ m, choisirGroupe }: { m: MonCours; choisirGroupe: () => void }) {
  const { groupes, profs, cours: index, perime } = useMesCours();
  const prof = m.prof ? profs[m.prof] : undefined;
  const g = m.prof ? groupes[m.cours]?.find((x) => x.prof === m.prof && x.groupe === m.groupe) : undefined;
  const passe = perime(m);
  return (
    <details className={`group rounded-lg border bg-card ${passe ? "border-cem-jaune" : ""}`}>
      {/* Hauteur de deux lignes de titre : un titre court donne une carte aussi haute que les autres */}
      <summary className="flex min-h-18 cursor-pointer list-none items-center gap-3 rounded-lg p-3 hover:bg-accent [&::-webkit-details-marker]:hidden">
        <span className="w-10 shrink-0 font-semibold tabular-nums text-primary">{court(m.cours)}</span>
        <span className="min-w-0 flex-1 font-medium">{index[m.cours]?.nom ?? m.cours}</span>
        {passe && <TriangleAlert className="size-4 shrink-0 text-cem-jaune" aria-label="Session passée" />}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="flex items-start gap-3 border-t p-3 text-sm">
        {m.prof && <AvatarProf prof={{ nom: prof?.nom ?? m.prof, photo: prof?.photo }} taille={56} />}
        <div className="min-w-0 flex-1 space-y-1">
          {m.prof ? (
            <>
              <Link href={`/${m.prof}`} className="font-semibold text-primary underline">
                {prof?.nom ?? m.prof}
              </Link>
              {m.groupe && <div>Groupe {m.groupe}</div>}
              {passe ? (
                <p className="text-muted-foreground">Session passée : l&apos;horaire de ce prof a changé.</p>
              ) : (
                <ul className="text-muted-foreground">{g?.seances.length ? g.seances.map((s) => <li key={`${s.jour}|${s.debut}`}>{texteSeance(s)}</li>) : <li>{SANS_HORAIRE}</li>}</ul>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Groupe pas choisi.</p>
          )}
          {(passe || !m.prof) && (
            <button onClick={choisirGroupe} className={bouton({ variant: "outline", size: "sm" }, "mt-1")}>
              {passe ? "Choisir mon nouveau groupe" : "Choisir mon groupe"}
            </button>
          )}
        </div>
      </div>
    </details>
  );
}

/** La fenêtre « Modifier mes cours » : retirer un choix, en ajouter un. Ouverte sur un cours : directement le choix de son groupe. */
function FenetreMesCours({ fenetre, fermer }: { fenetre: { cours?: string } | null; fermer: () => void }) {
  const { tous, groupes, profs, cours: index, perime, retirer, vider } = useMesCours();
  const groupeDe = (m: MonCours) => (m.prof ? groupes[m.cours]?.find((g) => g.prof === m.prof && g.groupe === m.groupe) : undefined);
  return (
    <Dialog open={fenetre !== null} onOpenChange={(o) => !o && fermer()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogTitle>Modifier mes cours</DialogTitle>
        <DialogDescription>Tes choix restent dans ce navigateur : rien n&apos;est envoyé, et ils n&apos;apparaissent pas sur un autre appareil.</DialogDescription>
        <div className="grid items-start gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold">Mes choix</h3>
            {tous.length === 0 && <p className="text-muted-foreground">Aucun cours pour l&apos;instant.</p>}
            <ul className="space-y-2">
              {tous.map((m) => {
                const g = groupeDe(m);
                return (
                  <li key={`${m.cours}|${m.prof ?? ""}|${m.groupe ?? ""}`} className={`flex items-start gap-3 rounded-md border bg-card p-3 ${perime(m) ? "opacity-60" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">
                        {libelle(m)} · {index[m.cours]?.nom ?? m.cours}
                      </div>
                      <div className="text-muted-foreground">
                        {m.prof ? profs[m.prof]?.nom ?? m.prof : "Groupe pas choisi"}
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
          </div>
          {/* Ouverte sur un cours, sur téléphone : le choix du groupe d'abord, sans avoir à descendre */}
          <div className={`rounded-lg border bg-muted p-4 ${fenetre?.cours ? "max-md:order-first" : ""}`}>
            <h3 className="mb-2 font-semibold">Ajouter un cours</h3>
            <AjoutCours initial={fenetre?.cours} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
