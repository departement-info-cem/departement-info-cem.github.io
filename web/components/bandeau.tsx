"use client";
import Link from "next/link";
import { CalendarOff, DoorOpen, Pause, Play, UserCheck } from "lucide-react";
import type { Laboratoire } from "@/app/_types/divers";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useStockageLocal } from "@/app/_hooks/use-stockage-local";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { resumeMaintenant, type ProfHoraire, type ResumeMaintenant } from "@/lib/maintenant";

// Bandeau défilant fixé en bas de l'écran : seulement les profs disponibles et les locaux libres en ce moment.
// Il s'arrête au survol, au clavier, avec le bouton pause, et ne défile pas si on a réduit les animations.
export function Bandeau({ profs, labos }: { profs: ProfHoraire[]; labos: Laboratoire[] }) {
  const maintenant = useMaintenant(30_000);
  const scolaire = useScolaire();
  const [pause, setPause] = useStockageLocal("bandeau-pause", false);
  const resume = maintenant ? resumeMaintenant(profs, labos, scolaire, maintenant) : null;
  // Rien à montrer (hors des heures de cours, hors session, fin de semaine, congé) : pas de bandeau du tout.
  // Avant de connaître l'heure (rendu statique), on ne l'affiche pas non plus, pour qu'il n'apparaisse pas pour rien.
  if (!resume || (!resume.dispos.length && !resume.libres.length && !resume.prochainLibre)) return null;
  // Vitesse à peu près constante, peu importe le nombre d'éléments
  const duree = 24 + 5 * (resume.dispos.length + resume.libres.length);

  return (
    <div className="bandeau-bas no-print fixed inset-x-0 bottom-0 z-30 flex items-center border-t border-white/20 bg-cem-marine text-sm text-white shadow-[0_-2px_8px_rgb(0_0_0/0.25)]" role="region" aria-label="Profs disponibles et locaux libres en ce moment">
      <Link href="/maintenant" className="flex h-full shrink-0 items-center gap-2 bg-cem-vert px-3 font-bold text-cem-marine hover:brightness-110">
        <span className="size-2 animate-pulse rounded-full bg-cem-marine motion-reduce:animate-none" aria-hidden />
        <span className="hidden sm:inline" aria-hidden>Locaux</span>
        <span className="sr-only sm:hidden">Locaux</span>
      </Link>
      <div className={`bandeau min-w-0 flex-1 ${pause ? "bandeau-pause" : ""}`}>
        <div className="bandeau-piste" style={{ animationDuration: `${duree}s` }}>
          <Contenu resume={resume} />
          {/* La copie assure un défilement sans trou ; elle est cachée aux lecteurs d'écran et au clavier */}
          <div className="bandeau-copie" aria-hidden inert>
            <Contenu resume={resume} />
          </div>
        </div>
      </div>
      <button onClick={() => setPause(!pause)} className="h-full shrink-0 px-3 hover:bg-white/10 motion-reduce:hidden" aria-label={pause ? "Reprendre le défilement" : "Arrêter le défilement"} title={pause ? "Reprendre" : "Pause"}>
        {pause ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </div>
  );
}

function Contenu({ resume }: { resume: ResumeMaintenant }) {
  const { dispos, libres, prochainLibre, raison } = resume;
  return (
    <ul className="bandeau-liste">
      {raison && (
        <li>
          <CalendarOff className="size-4 text-cem-jaune" /> {raison}
        </li>
      )}

      {dispos.length > 0 && (
        <li className="font-bold text-cem-vert">
          <UserCheck className="size-4" /> Profs disponibles
        </li>
      )}
      {dispos.map(({ p, e }) => (
        <li key={p.id}>
          <Link href={`/${p.id}`} className="hover:underline">
            <strong>{p.nom}</strong> · {e.local ?? p.bureau ?? "local à confirmer"}
            {e.centreAide && " (centre d'aide)"} <span className="text-cem-gris-2">jusqu&apos;à {e.fin}</span>
          </Link>
        </li>
      ))}

      {libres.length > 0 && (
        <li className="font-bold text-cem-vert">
          <DoorOpen className="size-4" /> Locaux libres
        </li>
      )}
      {libres.map(({ l, e }) => (
        <li key={l.local}>
          <Link href="/maintenant" className="hover:underline">
            <strong>{l.local}</strong> <span className="text-cem-gris-2">jusqu&apos;à {e.jusqua}</span>
          </Link>
        </li>
      ))}
      {libres.length === 0 && prochainLibre && (
        <li>
          <DoorOpen className="size-4 text-cem-vert" /> Aucun local libre : <strong>{prochainLibre.local}</strong> se libère à {prochainLibre.heure}
        </li>
      )}
    </ul>
  );
}
