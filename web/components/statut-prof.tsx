"use client";
import type { Prof } from "@/app/_types/prof";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { etatProf } from "@/lib/maintenant";
import { minutesEnHeure, heureEnMinutes } from "@/lib/temps";

const h = (heure: string) => minutesEnHeure(heureEnMinutes(heure)!);

// Pastille « Disponible jusqu'à 12:00 · D-0008 » ou « Absent » calculée à partir de l'horaire,
// du calendrier scolaire et des absences du prof.
export function StatutProf({ prof, compact = false }: { prof: Pick<Prof, "session" | "calendrier" | "horaire">; compact?: boolean }) {
  const maintenant = useMaintenant();
  const scolaire = useScolaire();
  if (!maintenant) return null;
  const e = etatProf({ session: prof.session, calendrier: prof.calendrier, plages: prof.horaire?.plages ?? [] }, scolaire, maintenant);
  // On n'annonce que les disponibilités (et, sur la page du prof, une absence inscrite) : jamais « en classe »
  if (e.etat !== "dispo" && (compact || e.etat !== "absent")) return null;

  const dispo = e.etat === "dispo";
  const texte = dispo
    ? compact
      ? `Dispo · ${e.local ?? "bureau"}`
      : `${e.centreAide ? "Centre d'aide" : "Disponible"} jusqu'à ${h(e.fin)}${e.local ? ` · ${e.local}` : ""}`
    : e.titre;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${dispo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
      title={"debut" in e ? `${h(e.debut)}–${h(e.fin)}${e.local ? ` · ${e.local}` : ""}` : undefined}
    >
      <span className={`size-2 shrink-0 rounded-full ${dispo ? "animate-pulse bg-white" : "bg-current"}`} />
      {texte}
    </span>
  );
}
