"use client";
import { Eye } from "lucide-react";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { bouton } from "@/lib/bouton";
import { libelle } from "@/lib/mes-cours";

// En haut de chaque page pendant un aperçu (lien avec ?cours=) : on voit le site avec les cours du lien.
export function BandeauApercu() {
  const { apercu, garderApercu, quitterApercu } = useMesCours();
  if (!apercu) return null;
  return (
    <div role="status" className="no-print border-b border-cem-jaune bg-cem-jaune-pale text-cem-marine">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 text-sm">
        <Eye className="size-4 shrink-0" />
        <span className="min-w-0 flex-1">
          <strong>Aperçu</strong> avec les cours du lien : {apercu.cours.length ? apercu.cours.map(libelle).join(", ") : "aucun"}.
          {apercu.inconnus.length > 0 && <> Introuvable : {apercu.inconnus.join(", ")}.</>} Tes propres cours ne sont pas touchés.
        </span>
        <span className="flex gap-2">
          <button onClick={garderApercu} className={bouton({ variant: "outline", size: "sm" }, "border-cem-marine/40 bg-transparent text-cem-marine hover:bg-white/50")}>
            Garder ces cours
          </button>
          <button onClick={quitterApercu} className={bouton({ size: "sm" }, "bg-cem-marine text-white hover:bg-cem-marine/90")}>
            Quitter l&apos;aperçu
          </button>
        </span>
      </div>
    </div>
  );
}
