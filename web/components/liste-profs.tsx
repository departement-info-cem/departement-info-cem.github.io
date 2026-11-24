"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Prof } from "@/app/_types/prof";
import { CarteProf } from "@/components/carte-prof";
import { Input } from "@/components/ui/input";
import { useTwoWayBinding } from "@/app/_hooks/use-two-way-binding";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { etatProf } from "@/lib/maintenant";
import { simplifier } from "@/lib/texte";
import type { InfoCours } from "@/components/horaire-semaine";

export function ListeProfs({ profs, cours }: { profs: Prof[]; cours: InfoCours }) {
  const recherche = useTwoWayBinding("");
  const [coursChoisi, setCoursChoisi] = useState("");
  const [dispoSeulement, setDispoSeulement] = useState(false);
  const maintenant = useMaintenant();
  const scolaire = useScolaire();

  const coursDonnes = useMemo(() => {
    const nos = new Set(profs.flatMap((p) => [...(p.cours ?? []), ...(p.horaire?.plages.map((x) => x.cours ?? "") ?? [])]).filter(Boolean).map((c) => c.toUpperCase()));
    return [...nos].sort();
  }, [profs]);

  const filtres = profs.filter((p) => {
    if (recherche.value && !simplifier(`${p.nom} ${p.bureau ?? ""}`).includes(simplifier(recherche.value))) return false;
    if (coursChoisi) {
      const siens = [...(p.cours ?? []), ...(p.horaire?.plages.map((x) => x.cours ?? "") ?? [])].map((c) => c.toUpperCase());
      if (!siens.includes(coursChoisi)) return false;
    }
    if (dispoSeulement) {
      if (!maintenant) return false;
      if (etatProf({ session: p.session, calendrier: p.calendrier, plages: p.horaire?.plages ?? [] }, scolaire, maintenant).etat !== "dispo") return false;
    }
    return true;
  });

  return (
    <div>
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
        <span className="text-sm text-muted-foreground md:ml-auto">{filtres.length} prof(s)</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtres.map((p) => (
          <CarteProf key={p.id} prof={p} />
        ))}
      </div>
      {filtres.length === 0 && <p className="py-10 text-center text-muted-foreground">Aucun prof ne correspond à ta recherche.</p>}
    </div>
  );
}
