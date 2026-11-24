"use client";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Minus } from "lucide-react";
import type { CoursAffiche, Programme } from "@/app/_types/programme";
import { totalHeures } from "@/lib/programmes";

// Compare deux grilles de cours : cours en commun, cours propres à chacune, heures.
export function Comparateur({ programmes }: { programmes: Programme[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const chemin = usePathname();
  const a = programmes.find((p) => p.id === params.get("a")) ?? programmes[0];
  const b = programmes.find((p) => p.id === params.get("b")) ?? programmes[1];

  function choisir(cle: "a" | "b", id: string) {
    const nouveaux = new URLSearchParams(params.toString());
    nouveaux.set(cle, id);
    router.replace(`${chemin}?${nouveaux.toString()}`, { scroll: false });
  }

  const lignes = useMemo(() => {
    const cle = (c: CoursAffiche) => c.no ?? c.nom.toLowerCase();
    const index = new Map<string, { cours: CoursAffiche; sessionA?: string; sessionB?: string }>();
    for (const [p, cote] of [
      [a, "sessionA"],
      [b, "sessionB"],
    ] as const) {
      for (const s of p.sessions)
        for (const c of s.cours) {
          const l = index.get(cle(c)) ?? { cours: c };
          l[cote] ??= s.titre.split(" : ")[0];
          index.set(cle(c), l);
        }
    }
    return [...index.values()].sort((x, y) => Number(!(x.sessionA && x.sessionB)) - Number(!(y.sessionA && y.sessionB)));
  }, [a, b]);

  const communs = lignes.filter((l) => l.sessionA && l.sessionB);
  const coursA = a.sessions.filter((s) => !s.auChoix).flatMap((s) => s.cours);
  const coursB = b.sessions.filter((s) => !s.auChoix).flatMap((s) => s.cours);

  const Choix = ({ cote, valeur }: { cote: "a" | "b"; valeur: Programme }) => (
    <select value={valeur.id} onChange={(e) => choisir(cote, e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 font-semibold" aria-label={`Programme ${cote.toUpperCase()}`}>
      {programmes.map((p) => (
        <option key={p.id} value={p.id}>
          {p.court}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {([["a", a, coursA], ["b", b, coursB]] as const).map(([cote, p, cours]) => (
          <div key={cote} className="rounded-lg border bg-card p-4">
            <Choix cote={cote} valeur={p} />
            <p className="mt-2 text-sm text-muted-foreground">{p.nom}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <dt className="text-xs text-muted-foreground">Durée</dt>
                <dd className="text-sm font-semibold">{p.duree.split(/[,(]/)[0]}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Cours</dt>
                <dd className="text-sm font-semibold">{cours.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Heures</dt>
                <dd className="text-sm font-semibold">{totalHeures(cours) || "-"}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <p className="my-6 text-center text-lg">
        <strong className="text-primary">{communs.length}</strong> cours en commun
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="p-2">Cours</th>
              <th className="p-2 text-center">{a.court}</th>
              <th className="p-2 text-center">{b.court}</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map(({ cours, sessionA, sessionB }) => (
              <tr key={cours.no ?? cours.nom} className={`border-t ${sessionA && sessionB ? "bg-accent" : ""}`}>
                <td className="p-2">
                  <span className="font-medium">{cours.nom}</span>
                  {cours.no && <span className="ml-2 text-xs tabular-nums text-muted-foreground">{cours.no}</span>}
                </td>
                {[sessionA, sessionB].map((s, i) => (
                  <td key={i} className="p-2 text-center text-xs">
                    {s ? (
                      <span className="inline-flex items-center gap-1">
                        <Check className="size-4 text-primary" /> {s}
                      </span>
                    ) : (
                      <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="absent" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
