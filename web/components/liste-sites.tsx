"use client";
import { ExternalLink, Search } from "lucide-react";
import type { SiteCours } from "@/lib/donnees";
import { Input } from "@/components/ui/input";
import { useTwoWayBinding } from "@/app/_hooks/use-two-way-binding";
import { useStockageLocal } from "@/app/_hooks/use-stockage-local";
import { simplifier } from "@/lib/texte";
import { useMesCours } from "@/app/_contexts/mes-cours-context";

// Accès direct aux sites web des cours. Le filtre choisi (DEC Dév, DEC Réseau...) est retenu pour la prochaine visite.
export function ListeSites({ sites, filtres }: { sites: SiteCours[]; filtres: { id: string; texte: string }[] }) {
  const recherche = useTwoWayBinding("");
  const [filtre, setFiltre] = useStockageLocal<string | null>("filtre-sites", null);
  const { mesCours } = useMesCours();

  const mots = simplifier(recherche.value).split(/\s+/).filter(Boolean);
  const visibles = sites
    .filter((s) => !filtre || s.places.some((p) => p.id === filtre))
    .filter((s) => mots.every((m) => simplifier(`${s.no} ${s.nom}`).includes(m)))
    .map((s) => ({ s, place: s.places.find((p) => p.id === filtre) ?? s.places[0] }));
  // Les sessions d'abord, puis Sciences de la nature, les cours de service et le reste
  const rang = (g: string) => ["Sciences de la nature", "Cours de service", "Autres"].indexOf(g);
  const groupes = [...new Set(visibles.map((v) => v.place?.session ?? "Autres"))].sort((a, b) => rang(a) - rang(b) || a.localeCompare(b, "fr", { numeric: true }));
  // « Mes cours » en tête, sans filtre ni recherche : ils restent aussi à leur place habituelle
  const miens = sites.filter((s) => mesCours.some((m) => m.cours === s.no.toUpperCase()));
  const lien = (s: SiteCours) => (
    <li key={s.no}>
      <a href={s.url} target="_blank" rel="noreferrer" className="group flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition hover:border-primary hover:shadow-sm">
        <span className="w-20 shrink-0 text-xs font-semibold tabular-nums text-primary">{s.no.replace(/^420-/, "").replace(/-(EM|RE)$/, "")}</span>
        <span className="flex-1 font-medium group-hover:text-primary">{s.nom}</span>
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
      </a>
    </li>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input {...recherche} placeholder="Numéro ou nom du cours" className="pl-9" aria-label="Rechercher le site d'un cours" />
        </div>
        {[{ id: null, texte: "Tous" }, ...filtres].map((f) => (
          <button
            key={f.texte}
            onClick={() => setFiltre(f.id)}
            aria-pressed={filtre === f.id}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${filtre === f.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}
          >
            {f.texte}
          </button>
        ))}
      </div>
      {miens.length > 0 && (
        <section className="mb-6 rounded-lg border border-cem-vert bg-cem-vert-pale/40 p-3">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Mes cours</h3>
          <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">{miens.map(lien)}</ul>
        </section>
      )}
      {visibles.length === 0 && <p className="text-muted-foreground">Aucun site de cours ne correspond.</p>}
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {groupes.map((g) => (
          <section key={g}>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{g}</h3>
            <ul className="space-y-1.5">
              {visibles
                .filter((v) => (v.place?.session ?? "Autres") === g)
                .map(({ s }) => lien(s))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
