"use client";
import { useMemo, useState } from "react";
import { MapPin, Printer } from "lucide-react";
import type { TypePlage } from "@/app/_types/prof";
import { LIBELLES_TYPES_PLAGE } from "@/app/_types/prof";
import { COULEURS_TYPES, couleurBordure, ordreDesCours, positionnerPlages, type PlageAffichee, type PlagePositionnee } from "@/lib/horaire";
import { heureEnMinutes, JOURS_OUVRABLES, jourDeLaSemaine, LIBELLES_JOURS, minutesEnHeure } from "@/lib/temps";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ContenuBloc, textesPlage } from "@/components/bloc-horaire";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export type InfoCours = Record<string, { no: string; nom: string; url?: string }>;

/** Titre de l'horaire imprimé seul, en pleine page (voir « Impression » dans globals.css) */
export type Impression = { titre: string; details: (string | undefined)[] };

const PIXELS_PAR_MINUTE = 1.1;
// Espace en haut et en bas des colonnes : les heures sont centrées sur leur ligne et déborderaient sur l'en-tête.
const MARGE = 12;
// Au-delà, le bloc est assez haut pour tout afficher : pas besoin d'infobulle (un clic donne le détail de tous les blocs).
const DUREE_MAX_INFOBULLE = 60;

// Horaire de la semaine d'un prof. Porté du composant WeeklySchedule du cours 5N6.
export function HoraireSemaine({ plages, debut = "08:00", fin = "18:00", cours = {}, vide = "Aucun horaire publié pour l'instant.", impression }: { plages: PlageAffichee[]; debut?: string; fin?: string; cours?: InfoCours; vide?: string; impression?: Impression }) {
  const maintenant = useMaintenant();
  const [types, setTypes] = useState<Set<TypePlage>>(new Set(["cours", "dispo", "centre-aide", "reunion", "autre"]));

  const [detail, setDetail] = useState<PlagePositionnee | null>(null);

  const parJour = useMemo(() => positionnerPlages(plages.filter((p) => types.has(p.type))), [plages, types]);
  const coursOrdonnes = useMemo(() => ordreDesCours(plages), [plages]);
  const typesPresents = useMemo(() => [...new Set(plages.map((p) => p.type))], [plages]);

  // On élargit la plage horaire si une plage dépasse.
  const minDebut = Math.min(heureEnMinutes(debut) ?? 480, ...plages.map((p) => heureEnMinutes(p.debut) ?? 1440));
  const maxFin = Math.max(heureEnMinutes(fin) ?? 1080, ...plages.map((p) => heureEnMinutes(p.fin) ?? 0));
  const debutGrille = Math.floor(minDebut / 60) * 60;
  const finGrille = Math.ceil(maxFin / 60) * 60;
  const hauteur = (finGrille - debutGrille) * PIXELS_PAR_MINUTE + 2 * MARGE;
  // Par rapport à la hauteur de la colonne : à l'impression, la grille s'étire sur toute la page
  const longueur = (minutes: number) => `(100% - ${2 * MARGE}px) * ${minutes / (finGrille - debutGrille)}`;
  const y = (minutes: number) => `calc(${MARGE}px + ${longueur(minutes - debutGrille)})`;
  const heures = Array.from({ length: (finGrille - debutGrille) / 60 + 1 }, (_, i) => debutGrille + i * 60);

  const jourActuel = maintenant ? jourDeLaSemaine(maintenant) : null;
  const minutesActuelles = maintenant ? maintenant.getHours() * 60 + maintenant.getMinutes() : null;

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
    <div className={impression && "horaire-imprimable"}>
      {impression && (
        <>
          {/* Sans marge, le navigateur n'ajoute ni date ni adresse ; la marge est dans .horaire-imprimable */}
          <style>{"@page { size: letter portrait; margin: 0; }"}</style>
          <div className="mb-3 hidden items-baseline justify-between gap-4 print:flex">
            <span className="text-2xl font-bold">{impression.titre}</span>
            <span className="text-base">{impression.details.filter(Boolean).join(" · ")}</span>
          </div>
        </>
      )}
      <div className="no-print mb-3 flex flex-wrap items-center gap-2">
        {typesPresents.map((t) => (
          <button
            key={t}
            onClick={() => basculerType(t)}
            aria-pressed={types.has(t)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${types.has(t) ? "" : "opacity-40 line-through"}`}
          >
            <span className="size-3 rounded-full border" style={{ background: COULEURS_TYPES[t].fond }} />
            {LIBELLES_TYPES_PLAGE[t]}
          </button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => window.print()}>
          <Printer className="size-4" /> Imprimer
        </Button>
      </div>

      <div className="horaire-cadre overflow-x-auto rounded-lg border bg-card">
        <div className="grid min-w-[640px] print:min-w-0" style={{ gridTemplateColumns: `56px repeat(${JOURS_OUVRABLES.length}, 1fr)` }}>
          <div className="border-b" />
          {JOURS_OUVRABLES.map((j) => (
            <div key={j} className={`border-b border-l px-2 py-2 text-center text-sm font-semibold ${j === jourActuel ? "bg-accent text-accent-foreground print:bg-transparent print:text-inherit" : ""}`}>
              {LIBELLES_JOURS[j]}
            </div>
          ))}

          <div className="horaire-colonne relative" style={{ height: hauteur }}>
            {heures.map((h) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground" style={{ top: y(h) }}>
                {minutesEnHeure(h)}
              </span>
            ))}
          </div>

          {JOURS_OUVRABLES.map((j) => (
            <div key={j} className={`horaire-colonne relative border-l ${j === jourActuel ? "bg-accent/30 print:bg-transparent" : ""}`} style={{ height: hauteur }}>
              {heures.map((h) => (
                <div key={h} className="absolute inset-x-0 border-t border-dashed border-border/70" style={{ top: y(h) }} />
              ))}
              {j === jourActuel && minutesActuelles !== null && minutesActuelles >= debutGrille && minutesActuelles <= finGrille && (
                <div className="no-print absolute inset-x-0 z-20 h-0.5 bg-cem-rouge" style={{ top: y(minutesActuelles) }} aria-label="Maintenant">
                  <span className="absolute -left-1 -top-1 size-2.5 rounded-full bg-cem-rouge" />
                </div>
              )}
              {parJour[j]?.map((p, i) => {
                const duree = p.finMin - p.debutMin;
                const couleurs = COULEURS_TYPES[p.type];
                const largeur = 100 / p.colonnes;
                const bloc = {
                  type: "button" as const,
                  onClick: () => setDetail(p),
                  "aria-haspopup": "dialog" as const,
                  className: `@container absolute z-10 flex flex-col overflow-hidden rounded-md border-l-4 px-1 ${duree <= 45 ? "py-px" : "py-1"} text-center text-xs shadow-sm cursor-pointer transition hover:z-30 hover:shadow-md`,
                  style: {
                    top: `calc(${y(p.debutMin)} + 1px)`,
                    height: `calc(${longueur(duree)} - 2px)`,
                    left: `calc(${p.colonne * largeur}% + 2px)`,
                    width: `calc(${largeur}% - 4px)`,
                    background: couleurs.fond,
                    color: couleurs.texte,
                    borderLeftColor: p.type === "cours" ? couleurBordure(p, coursOrdonnes) : "rgb(0 0 0 / 15%)",
                  },
                };
                const contenu = <ContenuBloc p={p} cours={cours} />;
                if (duree > DUREE_MAX_INFOBULLE) {
                  return (
                    <button key={i} {...bloc}>
                      {contenu}
                    </button>
                  );
                }
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger render={<button />} {...bloc}>
                      {contenu}
                    </TooltipTrigger>
                    <TooltipContent className="flex-col items-start gap-0.5">
                      <DetailPlage p={p} cours={cours} />
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          {detail && (
            <>
              <DialogTitle>{textesPlage(detail, cours).titre}</DialogTitle>
              <DialogDescription>
                {LIBELLES_JOURS[detail.jourNormalise]}, {detail.debut}–{detail.fin}
              </DialogDescription>
              <div className="space-y-1">
                <DetailPlage p={detail} cours={cours} sansTitre />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tout ce qu'on sait d'une plage, sans abréger (infobulle et fenêtre de détails).
function DetailPlage({ p, cours, sansTitre = false }: { p: PlageAffichee; cours: InfoCours; sansTitre?: boolean }) {
  const t = textesPlage(p, cours);
  const type = LIBELLES_TYPES_PLAGE[p.type];
  return (
    <>
      {!sansTitre && <div className="font-semibold">{t.titre}</div>}
      {!sansTitre && (
        <div>
          {p.debut}–{p.fin}
        </div>
      )}
      {type !== t.titre && <div>{type}</div>}
      {t.noms.length > 0 && <div>{t.noms.join(", ")}</div>}
      {p.precision && <div>{p.precision}</div>}
      {t.sigle && <div>{t.sigle}</div>}
      {t.nomCours && <div>{t.nomCours}</div>}
      {p.local && (
        <div className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {p.local}
        </div>
      )}
    </>
  );
}
