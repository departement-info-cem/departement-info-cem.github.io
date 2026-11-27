"use client";
import { useState } from "react";
import type { EvenementProf, Plage } from "@/app/_types/prof";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { CalendrierMois } from "@/components/calendrier-mois";
import { garderMonGroupe, libelle } from "@/lib/mes-cours";
import { ordreDesCours } from "@/lib/horaire";

// Calendrier d'un prof. Un étudiant qui a choisi son groupe avec ce prof (« Mes cours ») ne voit que les dates de son groupe,
// sinon il verrait en évidence les examens et les remises des autres groupes et des autres cours. Une case permet de tout revoir.
export function CalendrierProf({ prof, plages, evenements, sessionId }: { prof: string; plages?: Plage[]; evenements?: EvenementProf[]; sessionId?: string }) {
  const scolaire = useScolaire();
  const { mesCours, cours: index } = useMesCours();
  const [tous, setTous] = useState(false);
  const miens = mesCours.filter((m) => m.prof === prof);
  const canonique = (no: string) => (index[no.toUpperCase()]?.no ?? no).toUpperCase();
  const filtre = miens.length > 0 && !tous;
  return (
    <>
      {miens.length > 0 && (
        <label className="mb-3 flex w-fit items-center gap-2 text-sm">
          <input type="checkbox" checked={!tous} onChange={(e) => setTous(!e.target.checked)} className="size-4 accent-[var(--primary)]" />
          Seulement ce qui me concerne ({miens.map(libelle).join(", ")})
        </label>
      )}
      <CalendrierMois
        scolaire={scolaire}
        plages={filtre && plages ? garderMonGroupe(plages, miens, canonique) : plages}
        evenements={filtre && evenements ? garderMonGroupe(evenements, miens, canonique) : evenements}
        sessionId={sessionId}
        coursOrdonnes={ordreDesCours(plages ?? [])}
      />
    </>
  );
}
