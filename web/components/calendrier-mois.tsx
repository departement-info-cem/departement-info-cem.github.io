"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, List } from "lucide-react";
import type { CalendrierScolaire } from "@/app/_types/divers";
import type { EvenementProf, Plage } from "@/app/_types/prof";
import { construireCalendrier, semainesDuMois, type EvenementJour, type JourCalendrier } from "@/lib/calendrier";
import { dateDepuisIso, formaterDate, isoDepuisDate, LIBELLES_JOURS, MOIS } from "@/lib/temps";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { COULEURS_TYPES, couleurBordure, ordreDesCours } from "@/lib/horaire";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

// Calendrier mensuel d'un prof : congés du cégep + séances de ses cours + ses propres dates.
// Inspiré du composant MainDocsCalendar du cours 5N6.

// Couleurs officielles du cégep, avec un texte permis sur ce fond par la charte graphique.
const STYLES: Record<string, string> = {
  conge: "bg-cem-rouge text-white",
  pedagogique: "bg-cem-jaune-pale text-cem-marine",
  "mise-a-jour": "bg-cem-jaune-pale text-cem-marine",
  relache: "bg-cem-vert text-cem-marine font-semibold",
  encadrement: "bg-cem-jaune-pale text-cem-marine",
  suspension: "bg-cem-rouge text-white",
  "horaire-modifie": "bg-cem-bleu-pale text-cem-marine",
  reprise: "bg-cem-bleu-pale text-cem-marine",
  evaluations: "bg-cem-ciel text-cem-marine",
  "evaluations-horaire": "bg-cem-ciel text-cem-marine",
  limite: "bg-muted text-muted-foreground",
  info: "bg-muted text-muted-foreground",
  remise: "bg-cem-orange text-black font-semibold",
  examen: "bg-cem-rouge text-white font-semibold",
  absence: "bg-cem-rouge text-white font-semibold",
  cours: "bg-accent text-accent-foreground",
  deplacement: "bg-cem-jaune text-cem-marine font-semibold",
  activite: "bg-cem-bleu-pale text-cem-marine",
  autre: "bg-cem-bleu-pale text-cem-marine",
};

type Filtre = "scolaire" | "seance" | "prof";
const LIBELLES_FILTRES: Record<Filtre, string> = { prof: "Dates du prof", seance: "Séances de cours", scolaire: "Calendrier du cégep" };

const LIBELLES_EVALUATION = { sommative: "Sommative", formative: "Formative" };

/** Une évaluation sommative est encadrée : c'est la date à ne pas manquer. */
const encadre = (e: EvenementJour) => (e.evaluation === "sommative" ? "ring-2 ring-cem-marine ring-inset dark:ring-white" : "");

/** Une séance a les couleurs de son cours dans l'horaire de la semaine (« Mon horaire », horaire du prof) : fond vert pâle, bordure du cours. */
const styleSeance = (e: EvenementJour, coursOrdonnes: string[]) =>
  e.source === "seance" ? { background: COULEURS_TYPES.cours.fond, color: COULEURS_TYPES.cours.texte, borderLeft: `3px solid ${couleurBordure({ type: "cours", cours: e.cours }, coursOrdonnes)}` } : undefined;
const classeEvenement = (e: EvenementJour) => (e.source === "seance" ? "" : (STYLES[e.type] ?? STYLES.autre));

// Le groupe d'un cours n'est pas affiché : l'heure et le local suffisent à reconnaître la séance.
function Pastille({ e, compacte, coursOrdonnes }: { e: EvenementJour; compacte?: boolean; coursOrdonnes: string[] }) {
  const texte = (e.evaluation ? `${e.evaluation === "sommative" ? "S" : "F"} · ` : "") + (e.source === "seance" ? `${e.heure?.split("–")[0]} ${e.cours ?? e.titre}` : `${e.code ? `${e.code} · ` : e.type === "deplacement" && e.heure ? `${e.heure.split("–")[0]} ` : ""}${e.titre}`);
  return <div title={e.annulee ? `${texte} : ${e.annulee}` : texte} className={`truncate rounded ${encadre(e)} ${e.annulee ? "line-through opacity-50" : ""} px-1 py-0.5 text-[11px] leading-tight ${classeEvenement(e)} ${compacte ? "" : "text-xs"}`} style={styleSeance(e, coursOrdonnes)}>{texte}</div>;
}

export function CalendrierMois({
  scolaire,
  plages,
  evenements,
  sessionId,
  coursFiltre,
  coursOrdonnes: ordreImpose,
}: {
  scolaire: CalendrierScolaire;
  plages?: Plage[];
  evenements?: EvenementProf[];
  sessionId?: string;
  /** n'affiche que les dates de ce cours (lien direct depuis un site de cours) */
  coursFiltre?: string;
  /** ordre des cours pour leurs couleurs, s'il diffère de celui de « plages » (calendrier d'un prof filtré sur mon groupe) */
  coursOrdonnes?: string[];
}) {
  const maintenant = useMaintenant(3_600_000);
  const isoActuel = maintenant ? isoDepuisDate(maintenant) : undefined;
  const session = scolaire.sessions.find((s) => s.id === sessionId) ?? scolaire.sessions.find((s) => isoActuel && isoActuel <= s.fin) ?? scolaire.sessions[0];
  const [mois, setMois] = useState<{ annee: number; mois: number } | null>(null);
  const [vue, setVue] = useState<"mois" | "liste">("mois");
  const [filtres, setFiltres] = useState<Set<Filtre>>(new Set(["scolaire", "seance", "prof"]));
  const [jourChoisi, setJourChoisi] = useState<JourCalendrier | null>(null);

  const coursOrdonnes = useMemo(() => ordreImpose ?? ordreDesCours(plages ?? []), [ordreImpose, plages]);
  const jours = useMemo(() => construireCalendrier(scolaire, { plages, evenements, sessionId: session?.id }), [scolaire, plages, evenements, session]);
  // Les événements sans numéro de cours (absence, activité...) concernent tous les cours
  const duCours = (e: EvenementJour) => !coursFiltre || e.source === "scolaire" || !e.cours || e.cours.toUpperCase() === coursFiltre.toUpperCase();

  // Mois affiché : celui choisi, sinon le mois courant s'il est dans la session, sinon le début de la session.
  const affiche = useMemo(() => {
    if (mois) return mois;
    const reference = maintenant && session && isoDepuisDate(maintenant) >= session.debut && isoDepuisDate(maintenant) <= session.fin ? maintenant : dateDepuisIso(session?.debut ?? isoDepuisDate(new Date()));
    return { annee: reference.getFullYear(), mois: reference.getMonth() };
  }, [mois, maintenant, session]);

  const aujourdhui = maintenant ? isoDepuisDate(maintenant) : "";
  const filtrer = (j?: JourCalendrier) => (j ? j.evenements.filter((e) => filtres.has(e.source) && duCours(e)) : []);

  function changerMois(delta: number) {
    const d = new Date(affiche.annee, affiche.mois + delta, 1);
    setMois({ annee: d.getFullYear(), mois: d.getMonth() });
  }

  // Pas de cours la fin de semaine : samedi et dimanche ne paraissent que si une date du mois y tombe (ex. une remise le dimanche)
  const finDeSemaine = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const toutesLesSemaines = semainesDuMois(affiche.annee, affiche.mois);
  const avecFinsDeSemaine = toutesLesSemaines.some((s) => s.some((d) => finDeSemaine(d) && d.getMonth() === affiche.mois && filtrer(jours.get(isoDepuisDate(d))).length > 0));
  const semaines = toutesLesSemaines
    .map((s) => (avecFinsDeSemaine ? s : s.filter((d) => !finDeSemaine(d))))
    .filter((s) => s.some((d) => d.getMonth() === affiche.mois));
  const colonnes = avecFinsDeSemaine ? "grid-cols-7" : "grid-cols-5";
  const liste = [...jours.values()]
    .filter((j) => filtrer(j).length && (!session || (j.iso >= session.debut && j.iso <= session.fin)) && j.evenements.some((e) => e.source !== "seance" && filtres.has(e.source)))
    .sort((a, b) => a.iso.localeCompare(b.iso));

  return (
    <div>
      <div className="no-print mb-3 flex flex-wrap items-center gap-2">
        {(Object.keys(LIBELLES_FILTRES) as Filtre[]).filter(() => plages || evenements).map((f) => (
          <button
            key={f}
            aria-pressed={filtres.has(f)}
            onClick={() =>
              setFiltres((avant) => {
                const apres = new Set(avant);
                if (apres.has(f)) apres.delete(f);
                else apres.add(f);
                return apres;
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${filtres.has(f) ? "" : "opacity-40 line-through"}`}
          >
            {/* Même pastille que la légende de l'horaire de la semaine */}
            {f === "seance" && <span className="size-3 rounded-full border" style={{ background: COULEURS_TYPES.cours.fond }} />}
            {LIBELLES_FILTRES[f]}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <Button variant={vue === "mois" ? "default" : "outline"} size="sm" onClick={() => setVue("mois")}>
            <CalendarDays className="size-4" /> Mois
          </Button>
          <Button variant={vue === "liste" ? "default" : "outline"} size="sm" onClick={() => setVue("liste")}>
            <List className="size-4" /> Dates importantes
          </Button>
        </div>
      </div>

      {vue === "liste" ? (
        <ul className="divide-y rounded-lg border bg-card">
          {liste.length === 0 && <li className="p-4 text-muted-foreground">Aucune date pour cette session.</li>}
          {liste.map((j) => (
            <li key={j.iso} className={`flex flex-col gap-1 p-3 sm:flex-row sm:items-start sm:gap-4 ${j.iso < aujourdhui ? "opacity-50" : ""}`}>
              <span className="w-44 shrink-0 text-sm font-semibold">{formaterDate(j.iso)}</span>
              <div className="flex flex-wrap gap-1">
                {filtrer(j)
                  .filter((e) => e.source !== "seance")
                  .map((e, i) => (
                    <span key={i} className={`rounded px-2 py-0.5 text-sm ${encadre(e)} ${STYLES[e.type] ?? STYLES.autre}`}>
                      {e.code && <strong className="mr-1">{e.code}</strong>}
                      {e.evaluation && <strong className="mr-1">{LIBELLES_EVALUATION[e.evaluation]} ·</strong>}
                      {e.titre}
                      {e.heure && ` · ${e.heure}`}
                      {e.local && ` · ${e.local}`}
                      {e.cours && ` (${e.cours})`}
                    </span>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b p-2">
            <Button variant="ghost" size="icon" onClick={() => changerMois(-1)} aria-label="Mois précédent">
              <ChevronLeft />
            </Button>
            <h3 className="text-lg font-bold first-letter:uppercase">
              {MOIS[affiche.mois]} {affiche.annee}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => changerMois(1)} aria-label="Mois suivant">
              <ChevronRight />
            </Button>
          </div>
          <div className={`grid ${colonnes} border-b text-center text-xs font-semibold text-muted-foreground`}>
            {(["lundi", "mardi", "mercredi", "jeudi", "vendredi", ...(avecFinsDeSemaine ? (["samedi", "dimanche"] as const) : [])] as const).map((j) => (
              <div key={j} className="py-1">
                <span className="hidden sm:inline">{LIBELLES_JOURS[j]}</span>
                <span className="sm:hidden">{LIBELLES_JOURS[j].slice(0, 3)}</span>
              </div>
            ))}
          </div>
          {semaines.map((semaine, i) => (
            <div key={i} className={`grid ${colonnes}`}>
              {semaine.map((d) => {
                const iso = isoDepuisDate(d);
                const jour = jours.get(iso);
                const evts = filtrer(jour);
                const horsMois = d.getMonth() !== affiche.mois;
                return (
                  <button
                    key={iso}
                    onClick={() => jour && evts.length && setJourChoisi(jour)}
                    className={`flex min-h-24 min-w-0 flex-col items-stretch border-b border-r p-1 text-left transition hover:bg-accent/40 ${horsMois ? "opacity-40" : ""} ${finDeSemaine(d) ? "bg-muted" : ""} ${
                      jour?.sansCours && filtres.has("scolaire") ? "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,var(--muted)_6px,var(--muted)_8px)]" : ""
                    }`}
                  >
                    <span className={`mb-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${iso === aujourdhui ? "bg-primary font-bold text-primary-foreground" : ""}`}>{d.getDate()}</span>
                    <div className="space-y-0.5">
                      {evts.slice(0, 3).map((e, k) => (
                        <Pastille key={k} e={e} compacte coursOrdonnes={coursOrdonnes} />
                      ))}
                      {evts.length > 3 && <div className="text-[11px] text-muted-foreground">+{evts.length - 3} autre(s)</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <Dialog open={jourChoisi !== null} onOpenChange={(o) => !o && setJourChoisi(null)}>
        <DialogContent>
          <DialogTitle>{jourChoisi && formaterDate(jourChoisi.iso)}</DialogTitle>
          <DialogDescription>
            {jourChoisi?.horaireSuivi ? `On suit l'horaire du ${jourChoisi.horaireSuivi}.` : jourChoisi?.sansCours ? "Pas de cours réguliers." : "Horaire régulier."}
          </DialogDescription>
          <ul className="space-y-2">
            {filtrer(jourChoisi ?? undefined).map((e, i) => (
              <li key={i} className={`rounded-md p-2 ${encadre(e)} ${classeEvenement(e)}`} style={styleSeance(e, coursOrdonnes)}>
                <div className={`font-semibold ${e.annulee ? "line-through" : ""}`}>
                  {e.code && `${e.code} · `}
                  {e.evaluation && `Évaluation ${e.evaluation} · `}
                  {e.titre}
                </div>
                {e.annulee && <div className="text-sm font-bold uppercase">{e.annulee[0].toUpperCase() + e.annulee.slice(1)}</div>}
                <div className="text-sm opacity-90">
                  {[e.heure, e.cours, e.local && `local ${e.local}`].filter(Boolean).join(" · ")}
                </div>
                {e.description && <p className="text-sm">{e.description}</p>}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
