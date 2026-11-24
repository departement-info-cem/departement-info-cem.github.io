"use client";
import Link from "next/link";
import { CalendarClock, CalendarOff, DoorOpen, MapPin, Monitor, UserCheck } from "lucide-react";
import type { Laboratoire } from "@/app/_types/divers";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { AvatarProf } from "@/components/carte-prof";
import { prochainCours, resumeMaintenant, type ProfHoraire } from "@/lib/maintenant";
import { formaterDate, heureEnMinutes, minutesEnHeure } from "@/lib/temps";

// Page « Locaux » : les profs disponibles (et surtout où), les laboratoires libres.
export function EnCeMoment({ profs, labos, compact = false }: { profs: ProfHoraire[]; labos: Laboratoire[]; compact?: boolean }) {
  const maintenant = useMaintenant();
  const scolaire = useScolaire();
  if (!maintenant) return <div className="h-40 animate-pulse rounded-lg bg-muted" aria-label="Chargement" />;

  const { iso, situation, nbAvecDispos, dispos, etats, ...resume } = resumeMaintenant(profs, labos, scolaire, maintenant);
  const bientot = compact ? [] : resume.bientot.slice(0, 8);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground" suppressHydrationWarning>
        {formaterDate(iso)}, {minutesEnHeure(maintenant.getHours() * 60 + maintenant.getMinutes())}
        {situation.raison && ` (${situation.raison})`}
      </p>
      {(situation.sansCours || !situation.session) && (
        <p className="flex items-center gap-2 rounded-lg border border-cem-jaune bg-cem-jaune-pale text-cem-marine p-3 text-sm">
          <CalendarOff className="size-4 shrink-0" />
          {situation.session ? "Pas de cours réguliers aujourd'hui : les horaires habituels ne s'appliquent pas." : "Nous sommes hors session."}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <UserCheck className="size-5 text-primary" /> Profs disponibles
          </h3>
          {dispos.length === 0 && <p className="mb-3 text-sm text-muted-foreground">Personne n&apos;est inscrit comme disponible en ce moment.</p>}
          <ul className="space-y-2">
            {dispos.map(({ p, e }) => (
              <li key={p.id}>
                <Link href={`/${p.id}`} className="flex items-center gap-3 rounded-md border border-primary/40 bg-accent p-2 hover:border-primary">
                  <AvatarProf prof={p} taille={44} />
                  <span className="flex-1">
                    <span className="block font-semibold">{p.nom}</span>
                    <span className="text-sm text-muted-foreground">
                      {e.centreAide && "Centre d'aide · "}jusqu&apos;à {e.fin}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-lg font-bold text-primary">
                    <MapPin className="size-4" />
                    {e.local ?? p.bureau ?? "?"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {bientot.length > 0 && (
            <>
              <h4 className="mb-1 mt-4 text-sm font-bold text-muted-foreground">Prochaines disponibilités</h4>
              <ul className="space-y-1 text-sm">
                {bientot.map(({ p, d }) => (
                  <li key={p.id} className="flex flex-wrap justify-between gap-x-3">
                    <Link href={`/${p.id}`} className="font-medium hover:text-primary hover:underline">
                      {p.nom}
                    </Link>
                    <span className="text-muted-foreground">
                      {d.iso === iso ? "aujourd'hui" : formaterDate(d.iso).toLowerCase()} {d.debut}–{d.fin}
                      {d.local && <strong className="text-foreground"> · {d.local}</strong>}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {nbAvecDispos} prof(s) sur {profs.length} ont inscrit leurs disponibilités pour cette session.
          </p>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-bold">
            <Monitor className="size-5 text-primary" /> Laboratoires
          </h3>
          <ul className={compact ? "grid grid-cols-2 gap-2" : "grid gap-2 sm:grid-cols-2"}>
            {etats.map(({ l, e }) => {
              const prochain = compact ? undefined : prochainCours(l, profs, scolaire, maintenant);
              return (
                <li
                  key={l.local}
                  className={`rounded-md border p-2 ${e.etat === "libre" ? "border-primary bg-accent" : e.etat === "occupe" ? "border-cem-rouge bg-card" : "bg-muted"}`}
                >
                  <span className="flex items-center gap-1 font-bold">
                    {e.etat === "libre" && <DoorOpen className="size-4 text-primary" />}
                    {l.local}
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
                </li>
              );
            })}
          </ul>
          {!compact && <p className="mt-3 text-xs text-muted-foreground">Vérifie toujours l&apos;horaire affiché sur la porte : une réservation peut avoir été ajoutée.</p>}
        </section>
      </div>
    </div>
  );
}
