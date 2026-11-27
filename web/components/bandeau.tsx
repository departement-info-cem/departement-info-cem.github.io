"use client";
import { useRef } from "react";
import Link from "next/link";
import { CalendarOff, Clock, DoorOpen, Pause, Play, Star, UserCheck } from "lucide-react";
import type { Laboratoire } from "@/app/_types/divers";
import { useAnimationsReduites } from "@/app/_hooks/use-animations-reduites";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useStockageLocal } from "@/app/_hooks/use-stockage-local";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { court, trierPourMoi, type Lien } from "@/lib/mes-cours";
import { resumeMaintenant, type ProfHoraire, type ResumeMaintenant } from "@/lib/maintenant";

// Bandeau défilant fixé en bas de l'écran : seulement les profs disponibles, les locaux libres et les heures des labos.
// Il s'arrête au survol, au clavier et avec le bouton pause. Si le système réduit les animations, il ne défile pas
// de lui-même, mais le bouton permet de le lancer.
export function Bandeau({ profs, labos }: { profs: ProfHoraire[]; labos: Laboratoire[] }) {
  const maintenant = useMaintenant(30_000);
  const scolaire = useScolaire();
  const animationsReduites = useAnimationsReduites();
  // null : pas de choix fait avec le bouton, on suit le réglage du système
  const [choix, setChoix] = useStockageLocal<boolean | null>("bandeau-defile", null);
  const defile = choix ?? !animationsReduites;
  const zone = useRef<HTMLDivElement>(null);
  const { lien } = useMesCours();
  const calcul = maintenant ? resumeMaintenant(profs, labos, scolaire, maintenant) : null;
  // Mes profs et ceux de mes cours en tête (« Mes cours »)
  const resume = calcul && { ...calcul, dispos: trierPourMoi(calcul.dispos, ({ p }) => lien(p.id)) };
  // Rien à montrer (hors des heures de cours, hors session, fin de semaine, congé) : pas de bandeau du tout.
  // Avant de connaître l'heure (rendu statique), on ne l'affiche pas non plus, pour qu'il n'apparaisse pas pour rien.
  if (!resume || (!resume.dispos.length && !resume.libres.length && !resume.prochainLibre)) return null;
  // Vitesse à peu près constante, peu importe le nombre d'éléments
  const duree = 24 + 5 * (resume.dispos.length + resume.libres.length);

  function basculer() {
    // Revient au début du défilement à la main, sinon l'animation laisserait un trou à la fin
    if (zone.current) zone.current.scrollLeft = 0;
    setChoix(!defile);
  }

  return (
    <div className="bandeau-bas no-print fixed inset-x-0 bottom-0 z-30 flex items-center border-t border-white/20 bg-cem-marine text-sm text-white shadow-[0_-2px_8px_rgb(0_0_0/0.25)]" role="region" aria-label="Profs disponibles et locaux libres en ce moment">
      <Link href="/locaux" className="flex h-full shrink-0 items-center gap-2 bg-cem-vert px-3 font-bold text-cem-marine hover:brightness-110">
        <span className="size-2 animate-pulse rounded-full bg-cem-marine motion-reduce:animate-none" aria-hidden />
        <span className="hidden sm:inline" aria-hidden>Dispos et locaux</span>
        <span className="sr-only sm:hidden">Dispos et locaux</span>
      </Link>
      <div ref={zone} className={`bandeau min-w-0 flex-1 ${defile ? "" : animationsReduites ? "bandeau-fixe" : "bandeau-pause"}`}>
        <div className="bandeau-piste" style={{ animationDuration: `${duree}s` }}>
          <Contenu resume={resume} lien={lien} />
          {/* La copie assure un défilement sans trou ; elle est cachée aux lecteurs d'écran et au clavier */}
          <div className="bandeau-copie" aria-hidden inert>
            <Contenu resume={resume} lien={lien} />
          </div>
        </div>
      </div>
      <button onClick={basculer} className="h-full shrink-0 px-3 hover:bg-white/10" aria-label={defile ? "Arrêter le défilement" : "Lancer le défilement"} title={defile ? "Pause" : "Lancer"}>
        {defile ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
    </div>
  );
}

function Contenu({ resume, lien }: { resume: ResumeMaintenant; lien: (id: string) => Lien }) {
  const { dispos, libres, prochainLibre, heures, raison } = resume;
  return (
    <ul className="bandeau-liste">
      {raison && (
        <li>
          <CalendarOff className="size-4 text-cem-jaune" /> {raison}
        </li>
      )}

      {heures && (
        <li>
          <Clock className="size-4 text-cem-jaune" /> {heures}
        </li>
      )}

      {dispos.length > 0 && (
        <li className="font-bold text-cem-vert">
          <UserCheck className="size-4" /> Profs disponibles
        </li>
      )}
      {dispos.map(({ p, e }) => {
        const l = lien(p.id);
        return (
        <li key={p.id}>
          <Link href={`/${p.id}`} className="hover:underline">
            {l.niveau === "mon-prof" && <Star className="size-3.5 fill-cem-jaune text-cem-jaune" aria-label="Ton prof" />}
            <strong>{p.nom}</strong>
            {l.niveau === "meme-cours" && <span className="text-cem-gris-2"> ({l.cours.map(court).join(", ")})</span>} · {e.local ?? p.bureau ?? "local à confirmer"}
            {e.centreAide && " (centre d'aide)"} <span className="text-cem-gris-2">jusqu&apos;à {e.fin}</span>
          </Link>
        </li>
        );
      })}

      {libres.length > 0 && (
        <li className="font-bold text-cem-vert">
          <DoorOpen className="size-4" /> Locaux libres
        </li>
      )}
      {libres.map(({ l, e }) => (
        <li key={l.local}>
          <Link href={`/locaux/${l.local}`} className="hover:underline">
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
