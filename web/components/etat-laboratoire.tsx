"use client";
import Link from "next/link";
import { CalendarClock, DoorOpen } from "lucide-react";
import type { Laboratoire } from "@/app/_types/divers";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { etatLabo, prochainCours, type EtatLabo, type ProfHoraire } from "@/lib/maintenant";
import { formaterDate, heureEnMinutes, isoDepuisDate, minutesEnHeure } from "@/lib/temps";

type Prochain = ReturnType<typeof prochainCours>;

// Un laboratoire en ce moment : libre ou occupé, et son prochain cours.
export function EtatLaboratoire({ local, e, prochain, iso, lien = false }: { local: string; e: EtatLabo; prochain?: Prochain; iso: string; lien?: boolean }) {
  return (
    <div className={`relative h-full rounded-md border p-2 ${e.etat === "libre" ? "border-primary bg-accent" : e.etat === "occupe" ? "border-cem-rouge bg-card" : "bg-muted"}`}>
      <span className="flex items-center gap-1 font-bold">
        {e.etat === "libre" && <DoorOpen className="size-4 text-primary" />}
        {lien ? (
          // Toute la carte est cliquable
          <Link href={`/locaux/${local}`} className="after:absolute after:inset-0 hover:underline" title={`Horaire du ${local}`}>
            {local}
          </Link>
        ) : (
          local
        )}
      </span>
      <span className="block text-xs">
        {e.etat === "libre" && `Libre jusqu'à ${e.jusqua}`}
        {e.etat === "occupe" && `Occupé jusqu'à ${e.jusqua}${e.occupation?.cours ? ` · ${e.occupation.cours}` : e.occupation?.titre ? ` · ${e.occupation.titre}` : ""}`}
        {e.etat === "inconnu" && <span className="text-muted-foreground">{e.raison === "horaire incomplet" ? "Aucun cours connu (horaire incomplet)" : e.raison}</span>}
      </span>
      {prochain && (
        <span className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
          <CalendarClock className="mt-0.5 size-3 shrink-0" aria-hidden />
          <span>
            Prochain cours : {prochain.iso === iso ? "aujourd'hui" : formaterDate(prochain.iso).toLowerCase()} {minutesEnHeure(heureEnMinutes(prochain.occupation.debut)!)}–{minutesEnHeure(heureEnMinutes(prochain.occupation.fin)!)}
            <strong className="text-foreground"> · {prochain.occupation.cours}</strong>
            {prochain.occupation.groupe && ` gr. ${prochain.occupation.groupe}`}
          </span>
        </span>
      )}
    </div>
  );
}

// Le même, pour la page d'un seul laboratoire.
export function EtatLaboratoireMaintenant({ labo, profs }: { labo: Laboratoire; profs: ProfHoraire[] }) {
  const maintenant = useMaintenant();
  const scolaire = useScolaire();
  if (!maintenant) return <div className="h-16 animate-pulse rounded-md bg-muted" aria-label="Chargement" />;
  return <EtatLaboratoire local={labo.local} e={etatLabo(labo, profs, scolaire, maintenant)} prochain={prochainCours(labo, profs, scolaire, maintenant)} iso={isoDepuisDate(maintenant)} />;
}
