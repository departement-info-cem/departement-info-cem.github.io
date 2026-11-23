"use client";
import { useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { lienEdition } from "@/lib/chemins";
import { bouton } from "@/lib/bouton";

// Choisis ton nom : on te donne le lien direct vers l'éditeur GitHub de ta fiche.
export function ChoixProfEdition({ profs }: { profs: { id: string; nom: string }[] }) {
  const [id, setId] = useState("");
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select value={id} onChange={(e) => setId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 sm:w-72" aria-label="Ton nom">
        <option value="">Choisis ton nom...</option>
        {profs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nom}
          </option>
        ))}
      </select>
      {id && (
        <a href={lienEdition(`profs/${id}.yaml`)} target="_blank" rel="noreferrer" className={bouton()}>
          <Pencil className="size-4" /> Modifier {id}.yaml <ExternalLink className="size-4" />
        </a>
      )}
    </div>
  );
}
