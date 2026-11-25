"use client";
import { useState } from "react";
import type { Plage } from "@/app/_types/prof";
import { useMesCours, useMonCalendrier } from "@/app/_contexts/mes-cours-context";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { CalendrierMois } from "@/components/calendrier-mois";
import { HoraireSemaine } from "@/components/horaire-semaine";
import { libelle } from "@/lib/mes-cours";

// L'horaire et le calendrier de l'étudiant, d'après « Mes cours » (page Mes cours et page Calendrier).

/** Mes séances, avec les dispos de mes profs (et, au choix, des autres profs de mes cours). */
export function MonHoraire() {
  const { mesCours, groupes, profs, cours: index } = useMesCours();
  const { seances } = useMonCalendrier();
  const [autresProfs, setAutresProfs] = useState(false);
  const mesProfs = new Set(mesCours.flatMap((m) => (m.prof ? [m.prof] : [])));
  const profsDeMesCours = new Set(mesCours.flatMap((m) => (groupes[m.cours] ?? []).map((g) => g.prof)).filter((id) => !mesProfs.has(id)));
  const plages: Plage[] = [
    ...seances,
    ...[...mesProfs, ...(autresProfs ? profsDeMesCours : [])].flatMap((id) => (profs[id]?.dispos ?? []).map((d) => ({ ...d, titre: `${d.type === "centre-aide" ? "Centre d'aide" : "Dispo"} · ${profs[id].nom}` }))),
  ];
  return (
    <>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">Tes cours et les disponibilités de tes profs.</p>
        {profsDeMesCours.size > 0 && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autresProfs} onChange={(e) => setAutresProfs(e.target.checked)} className="size-4 accent-[var(--primary)]" />
            Ajouter les dispos des autres profs de mes cours
          </label>
        )}
      </div>
      <HoraireSemaine plages={plages} cours={index} vide="Tes profs n'ont pas encore inscrit l'horaire de tes groupes." impression={{ titre: "Mon horaire", details: mesCours.map(libelle) }} />
    </>
  );
}

/** Mes séances, les dates de mes profs pour mes cours et mon groupe, et le calendrier du cégep. */
export function MonCalendrier() {
  const scolaire = useScolaire();
  const { seances, evenements, session } = useMonCalendrier();
  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">Tes séances, les dates que tes profs ont inscrites pour tes cours et ton groupe, et le calendrier du cégep. Les évaluations sommatives sont encadrées.</p>
      <CalendrierMois scolaire={scolaire} plages={seances} evenements={evenements} sessionId={session} />
    </>
  );
}
