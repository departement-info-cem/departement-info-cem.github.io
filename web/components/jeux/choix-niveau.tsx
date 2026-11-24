"use client";
import { Check } from "lucide-react";

export function ChoixNiveau({ titres, niveau, reussis, choisir }: { titres: string[]; niveau: number; reussis: number[]; choisir: (i: number) => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {titres.map((t, i) => (
        <button
          key={t}
          onClick={() => choisir(i)}
          aria-pressed={i === niveau}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${i === niveau ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}
        >
          {reussis.includes(i) ? <Check className="size-4" aria-label="Réussi" /> : <span className="tabular-nums">{i + 1}</span>}
          {t}
        </button>
      ))}
    </div>
  );
}
