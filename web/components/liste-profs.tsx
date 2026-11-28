"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Prof } from "@/app/_types/prof";
import { CarteProf } from "@/components/carte-prof";
import { Input } from "@/components/ui/input";
import { useTwoWayBinding } from "@/app/_hooks/use-two-way-binding";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { ResumeMesCours } from "@/components/resume-mes-cours";
import { trierPourMoi } from "@/lib/mes-cours";
import { etatProf } from "@/lib/maintenant";
import { simplifier } from "@/lib/texte";
import type { InfoCours } from "@/components/horaire-semaine";

// « profs » : seulement ceux qui sont actifs cette session.
export function ListeProfs({ profs, cours }: { profs: Prof[]; cours: InfoCours }) {
  const recherche = useTwoWayBinding("");
  const [coursChoisi, setCoursChoisi] = useState("");
  const [dispoSeulement, setDispoSeulement] = useState(false);
  const maintenant = useMaintenant();
  const scolaire = useScolaire();
  const { lien } = useMesCours();

  // Numéros canoniques, comme ailleurs sur le site : un ancien numéro (5N6) compte pour le nouveau (5M6)
  const coursDe = useMemo(() => {
    const canonique = (c: string) => (cours[c.toUpperCase()]?.no ?? c).toUpperCase();
    return (p: Prof) => [...(p.cours ?? []), ...(p.horaire?.plages.map((x) => x.cours ?? "") ?? [])].filter(Boolean).map(canonique);
  }, [cours]);
  const coursDonnes = useMemo(() => [...new Set(profs.flatMap(coursDe))].filter((c) => cours[c]).sort(), [profs, coursDe, cours]);

  const filtres = profs.filter((p) => {
    if (recherche.value && !simplifier(`${p.nom} ${p.bureau ?? ""}`).includes(simplifier(recherche.value))) return false;
    if (coursChoisi && !coursDe(p).includes(coursChoisi)) return false;
    if (dispoSeulement) {
      if (!maintenant) return false;
      if (etatProf({ session: p.session, calendrier: p.calendrier, plages: p.horaire?.plages ?? [] }, scolaire, maintenant).etat !== "dispo") return false;
    }
    return true;
  });
  // Mes profs d'abord, puis ceux de mes cours (« Mes cours »)
  const enPoste = trierPourMoi(filtres, (p) => lien(p.id));

  return (
    <div>
      <ResumeMesCours />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input {...recherche} placeholder="Rechercher un prof ou un bureau" className="pl-9" aria-label="Rechercher un prof" />
        </div>
        <select
          value={coursChoisi}
          onChange={(e) => setCoursChoisi(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filtrer par cours"
        >
          <option value="">Tous les cours</option>
          {coursDonnes.map((c) => (
            <option key={c} value={c}>
              {c}{cours[c] ? ` : ${cours[c].nom}` : ""}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={dispoSeulement} onChange={(e) => setDispoSeulement(e.target.checked)} className="size-4 accent-[var(--primary)]" />
          Disponibles maintenant
        </label>
        <span className="text-sm text-muted-foreground md:ml-auto">{enPoste.length} prof(s)</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enPoste.map((p) => (
          <CarteProf key={p.id} prof={p} lien={lien(p.id)} />
        ))}
      </div>
      {filtres.length === 0 && <p className="py-10 text-center text-muted-foreground">Aucun prof ne correspond à ta recherche.</p>}
    </div>
  );
}
