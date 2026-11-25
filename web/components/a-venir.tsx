"use client";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import type { JourCalendrier } from "@/lib/calendrier";
import { aVenir } from "@/lib/mes-cours";
import { formaterDate, isoDepuisDate } from "@/lib/temps";

// Les prochains jours qui comptent pour l'étudiant (page « Mes cours » et rappel sur la page des profs).
export function AVenir({ jours, nbJours, evaluationsSeulement = false, vide = "Rien de particulier : l'horaire habituel." }: { jours: Map<string, JourCalendrier>; nbJours: number; evaluationsSeulement?: boolean; vide?: string | null }) {
  const maintenant = useMaintenant(3_600_000);
  if (!maintenant) return null;
  const aujourdhui = isoDepuisDate(maintenant);
  const liste = aVenir(jours, aujourdhui, nbJours)
    .map((j) => ({ ...j, evenements: evaluationsSeulement ? j.evenements.filter((e) => e.evaluation || e.type === "examen" || e.type === "remise") : j.evenements }))
    .filter((j) => j.evenements.length);
  if (!liste.length) return vide ? <p className="text-sm text-muted-foreground">{vide}</p> : null;
  return (
    <ul className="divide-y rounded-lg border bg-card">
      {liste.map((j) => (
        <li key={j.iso} className="flex flex-col gap-1 p-3 sm:flex-row sm:gap-4">
          <span className="w-44 shrink-0 text-sm font-semibold">{j.iso === aujourdhui ? "Aujourd'hui" : formaterDate(j.iso)}</span>
          <ul className="flex-1 space-y-1 text-sm">
            {j.evenements.map((e, i) => (
              <li key={i} className={e.annulee ? "text-muted-foreground" : ""}>
                {e.evaluation && (
                  <span className={`mr-1.5 rounded px-1.5 py-0.5 text-xs font-bold ${e.evaluation === "sommative" ? "bg-cem-rouge text-white" : "bg-cem-bleu-pale text-cem-marine"}`}>
                    {e.evaluation === "sommative" ? "Sommative" : "Formative"}
                  </span>
                )}
                {e.code && <strong className="mr-1">{e.code}</strong>}
                <span className={e.annulee ? "line-through" : e.source === "prof" ? "font-semibold" : ""}>{e.titre}</span>
                {e.annulee && <strong> : {e.annulee}</strong>}
                {e.heure && ` · ${e.heure}`}
                {e.local && ` · ${e.local}`}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
