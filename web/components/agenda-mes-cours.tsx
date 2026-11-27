"use client";
import { CalendarPlus } from "lucide-react";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { fichierAgenda, ORIGINE, RAPPEL_MINUTES } from "@/lib/agenda";
import { bouton } from "@/lib/bouton";
import { chemin } from "@/lib/chemins";
import { libelle } from "@/lib/mes-cours";

// Page « Mes cours » : abonner l'agenda du téléphone à chacun de ses groupes (fichiers .ics générés au build, lib/agenda.ts).
// Le rappel avant chaque séance, c'est l'appli d'agenda qui le fait : même fermée, même hors ligne.
export function AgendaMesCours() {
  const { mesCours, groupes, cours: index } = useMesCours();
  const abonnements = mesCours.flatMap((m) => {
    const g = m.prof ? groupes[m.cours]?.find((x) => x.prof === m.prof && x.groupe === m.groupe) : undefined;
    const fichier = g && fichierAgenda(g);
    return fichier ? [{ m, webcal: `webcal://${new URL(ORIGINE).host}${chemin(`/agenda/${fichier}`)}` }] : [];
  });

  if (abonnements.length === 0) return <p className="text-sm text-muted-foreground">Choisis tes groupes : tes profs n&apos;ont pas encore inscrit leur horaire, ou il manque le groupe.</p>;
  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        Un abonnement par cours : chaque séance de la session paraît dans l&apos;agenda de ton téléphone, avec le local et un rappel {RAPPEL_MINUTES} minutes avant. Les congés et les cours annulés ou déplacés suivent tout seuls, en quelques heures.
      </p>
      <ul className="space-y-2">
        {abonnements.map(({ m, webcal }) => (
          <li key={webcal} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border bg-card p-3">
            {/* largeur minimale : sur téléphone, les boutons passent sous le nom du cours */}
            <span className="min-w-48 flex-1 font-semibold">
              {libelle(m)} · {index[m.cours]?.nom ?? m.cours}
            </span>
            <span className="flex flex-wrap gap-2">
              <a href={webcal} className={bouton({ size: "sm" })}>
                <CalendarPlus className="size-4" /> iPhone, Mac
              </a>
              <a href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`} target="_blank" rel="noreferrer" className={bouton({ variant: "outline", size: "sm" })}>
                <CalendarPlus className="size-4" /> Google Agenda
              </a>
            </span>
          </li>
        ))}
      </ul>
      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        <li>
          <strong className="text-foreground">iPhone</strong> : « S&apos;abonner », puis désactive « Supprimer les alertes », sinon le rappel disparaît.
        </li>
        <li>
          <strong className="text-foreground">Android</strong> : « Google Agenda » propose d&apos;ajouter le calendrier (si l&apos;appli s&apos;ouvre sans rien proposer, ouvre le lien sur un ordinateur). Il paraît ensuite sur le téléphone.
          Google ignore le rappel du fichier : dans les paramètres de Google Agenda, ouvre le calendrier du cours et ajoute une notification {RAPPEL_MINUTES} minutes avant.
        </li>
        <li>Dans tous les cas, le rappel se règle aussi dans l&apos;appli d&apos;agenda, pour chaque calendrier de cours.</li>
      </ul>
    </>
  );
}
