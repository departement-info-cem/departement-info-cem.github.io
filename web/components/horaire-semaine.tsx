"use client";
import { useMemo, useState } from "react";
import { MapPin, Printer } from "lucide-react";
import type { Plage, TypePlage } from "@/app/_types/prof";
import { LIBELLES_TYPES_PLAGE } from "@/app/_types/prof";
import { COULEURS_TYPES, couleurBordure, positionnerPlages } from "@/lib/horaire";
import { heureEnMinutes, JOURS_OUVRABLES, jourDeLaSemaine, LIBELLES_JOURS, minutesEnHeure } from "@/lib/temps";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useTheme } from "@/app/_contexts/theme-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export type InfoCours = Record<string, { no: string; nom: string; url?: string }>;

const PIXELS_PAR_MINUTE = 1.1;

// Horaire de la semaine d'un prof. Porté du composant WeeklySchedule du cours 5N6.
export function HoraireSemaine({ plages, debut = "08:00", fin = "18:00", cours = {}, vide = "Aucun horaire publié pour l'instant." }: { plages: Plage[]; debut?: string; fin?: string; cours?: InfoCours; vide?: string }) {
  const maintenant = useMaintenant();
  const { theme } = useTheme();
  const [types, setTypes] = useState<Set<TypePlage>>(new Set(["cours", "dispo", "centre-aide", "reunion", "autre"]));

  const parJour = useMemo(() => positionnerPlages(plages.filter((p) => types.has(p.type))), [plages, types]);
  const coursOrdonnes = useMemo(() => [...new Set(plages.filter((p) => p.cours).map((p) => p.cours!.toUpperCase()))], [plages]);
  const typesPresents = useMemo(() => [...new Set(plages.map((p) => p.type))], [plages]);

  // On élargit la plage horaire si une plage dépasse.
  const minDebut = Math.min(heureEnMinutes(debut) ?? 480, ...plages.map((p) => heureEnMinutes(p.debut) ?? 1440));
  const maxFin = Math.max(heureEnMinutes(fin) ?? 1080, ...plages.map((p) => heureEnMinutes(p.fin) ?? 0));
  const debutGrille = Math.floor(minDebut / 60) * 60;
  const finGrille = Math.ceil(maxFin / 60) * 60;
  const hauteur = (finGrille - debutGrille) * PIXELS_PAR_MINUTE;
  const heures = Array.from({ length: (finGrille - debutGrille) / 60 + 1 }, (_, i) => debutGrille + i * 60);

  const jourActuel = maintenant ? jourDeLaSemaine(maintenant) : null;
  const minutesActuelles = maintenant ? maintenant.getHours() * 60 + maintenant.getMinutes() : null;
  const sombre = theme === "sombre";

  function basculerType(t: TypePlage) {
    setTypes((avant) => {
      const apres = new Set(avant);
      if (apres.has(t)) apres.delete(t);
      else apres.add(t);
      return apres;
    });
  }

  if (plages.length === 0) {
    return <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">{vide}</p>;
  }

  return (
    <div>
      <div className="no-print mb-3 flex flex-wrap items-center gap-2">
        {typesPresents.map((t) => (
          <button
            key={t}
            onClick={() => basculerType(t)}
            aria-pressed={types.has(t)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${types.has(t) ? "" : "opacity-40 line-through"}`}
          >
            <span className="size-3 rounded-full border" style={{ background: sombre ? COULEURS_TYPES[t].fondSombre : COULEURS_TYPES[t].fond }} />
            {LIBELLES_TYPES_PLAGE[t]}
          </button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => window.print()}>
          <Printer className="size-4" /> Imprimer
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <div className="grid min-w-[640px] pb-3" style={{ gridTemplateColumns: `56px repeat(${JOURS_OUVRABLES.length}, 1fr)` }}>
          <div className="border-b" />
          {JOURS_OUVRABLES.map((j) => (
            <div key={j} className={`border-b border-l px-2 py-2 text-center text-sm font-semibold ${j === jourActuel ? "bg-accent text-accent-foreground" : ""}`}>
              {LIBELLES_JOURS[j]}
            </div>
          ))}

          <div className="relative" style={{ height: hauteur }}>
            {heures.map((h) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground" style={{ top: (h - debutGrille) * PIXELS_PAR_MINUTE }}>
                {minutesEnHeure(h)}
              </span>
            ))}
          </div>

          {JOURS_OUVRABLES.map((j) => (
            <div key={j} className={`relative border-l ${j === jourActuel ? "bg-accent/30" : ""}`} style={{ height: hauteur }}>
              {heures.map((h) => (
                <div key={h} className="absolute inset-x-0 border-t border-dashed border-border/70" style={{ top: (h - debutGrille) * PIXELS_PAR_MINUTE }} />
              ))}
              {j === jourActuel && minutesActuelles !== null && minutesActuelles >= debutGrille && minutesActuelles <= finGrille && (
                <div className="absolute inset-x-0 z-20 h-0.5 bg-cem-rouge" style={{ top: (minutesActuelles - debutGrille) * PIXELS_PAR_MINUTE }} aria-label="Maintenant">
                  <span className="absolute -left-1 -top-1 size-2.5 rounded-full bg-cem-rouge" />
                </div>
              )}
              {parJour[j]?.map((p, i) => {
                const couleurs = COULEURS_TYPES[p.type];
                const info = p.cours ? cours[p.cours.toUpperCase()] : undefined;
                const titre = p.titre ?? info?.nom ?? (p.type === "cours" ? p.cours : LIBELLES_TYPES_PLAGE[p.type]);
                const largeur = 100 / p.colonnes;
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger
                      render={<div />}
                      className="absolute z-10 overflow-hidden break-words rounded-md hyphens-auto border-l-4 px-1.5 py-1 text-left text-xs shadow-sm transition hover:z-30 hover:shadow-md"
                      style={{
                        top: (p.debutMin - debutGrille) * PIXELS_PAR_MINUTE + 1,
                        height: (p.finMin - p.debutMin) * PIXELS_PAR_MINUTE - 2,
                        left: `calc(${p.colonne * largeur}% + 2px)`,
                        width: `calc(${largeur}% - 4px)`,
                        background: sombre ? couleurs.fondSombre : couleurs.fond,
                        color: sombre ? couleurs.texteSombre : couleurs.texte,
                        borderLeftColor: p.type === "cours" ? couleurBordure(p, coursOrdonnes) : "rgb(0 0 0 / 15%)",
                      }}
                      tabIndex={0}
                    >
                      <div className="font-semibold leading-tight">{titre}</div>
                      <div className="opacity-80">
                        {p.debut}–{p.fin}
                      </div>
                      {p.cours && (
                        <div className="opacity-80">
                          {p.cours}
                          {p.groupe && ` gr. ${p.groupe}`}
                        </div>
                      )}
                      {p.local && (
                        <div className="flex items-center gap-0.5 opacity-80">
                          <MapPin className="size-3" />
                          {p.local}
                        </div>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{titre}</p>
                      <p>
                        {LIBELLES_JOURS[p.jourNormalise]} {p.debut}–{p.fin}
                        {p.local && ` · ${p.local}`}
                      </p>
                      {p.cours && (
                        <p>
                          {p.cours} {info && info.nom !== titre && `— ${info.nom}`} {p.groupe && `· groupe ${p.groupe}`}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
