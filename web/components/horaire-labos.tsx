"use client";
import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Laboratoire } from "@/app/_types/divers";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { HoraireSemaine, type InfoCours } from "@/components/horaire-semaine";
import { occupationsLocal, presencesCentreAide, type ProfHoraire } from "@/lib/maintenant";
import { isoDepuisDate } from "@/lib/temps";

// Horaire de la semaine d'un laboratoire, au choix.
export function HoraireLabos({ labos, profs, cours }: { labos: Laboratoire[]; profs: ProfHoraire[]; cours: InfoCours }) {
  const [local, setLocal] = useState(labos[0]?.local ?? "");
  const labo = labos.find((l) => l.local === local);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {labos.map((l) => (
          <button
            key={l.local}
            onClick={() => setLocal(l.local)}
            aria-pressed={l.local === local}
            title={l.centreAide ? "Centre d'aide" : undefined}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${l.local === local ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            {l.centreAide && <Star className="size-3.5 fill-cem-jaune text-cem-jaune" aria-label="Centre d'aide" />}
            {l.local}
          </button>
        ))}
      </div>
      {labo && (
        <>
          <p className="mb-3 text-sm">
            <Link href={`/locaux/${labo.local}`} className="text-primary underline">
              Page du {labo.local}
            </Link>
            {labo.centreAide && (
              <>
                {" · "}
                <Link href="/centre-aide" className="text-primary underline">
                  Centre d&apos;aide
                </Link>
              </>
            )}
          </p>
          <HoraireLabo labo={labo} profs={profs} cours={cours} />
        </>
      )}
    </div>
  );
}

// Horaire de la semaine d'un seul laboratoire.
export function HoraireLabo({ labo, profs, cours }: { labo: Laboratoire; profs: ProfHoraire[]; cours: InfoCours }) {
  const maintenant = useMaintenant(3_600_000);
  const scolaire = useScolaire();
  if (!maintenant) return null;
  const iso = isoDepuisDate(maintenant);
  const session = scolaire.sessions.find((s) => iso <= s.fin);
  const presences = session ? presencesCentreAide(labo.local, session.id, profs) : [];
  const occupations = session ? occupationsLocal(labo.local, session.id, labo, profs) : [];

  return (
    <>
      {!(labo.complet && labo.session === session?.id) && (
        <p className="mb-3 rounded-md border border-cem-jaune bg-cem-jaune-pale text-cem-marine p-2 text-sm">Horaire incomplet : d&apos;autres cours peuvent avoir lieu dans ce local.</p>
      )}
      <HoraireSemaine
        plages={[...presences, ...occupations.map((o) => ({ jour: o.jour, debut: o.debut, fin: o.fin, type: o.cours ? ("cours" as const) : ("autre" as const), cours: o.cours, groupe: o.groupe, titre: o.titre, local: o.prof }))]}
        fin="20:00"
        cours={cours}
        vide="Aucun cours connu dans ce local pour cette session."
        impression={{ titre: `Laboratoire ${labo.local}`, details: [session?.nom] }}
      />
    </>
  );
}
