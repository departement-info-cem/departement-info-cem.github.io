import type { LucideIcon } from "lucide-react";
import { Apparition } from "@/components/apparition";

/** Carte de conseils (Conseils aux nouveaux, Nous joindre) : une icône, un titre, du texte. */
export function Bloc({ icone: Icone, titre, niveau: Titre = "h2", children }: { icone: LucideIcon; titre: string; niveau?: "h2" | "h3"; children: React.ReactNode }) {
  return (
    <Apparition>
      <section className="h-full rounded-lg border bg-card p-5 shadow-sm">
        <Titre className="mb-3 flex items-center gap-2 text-xl font-bold">
          <Icone className="size-5 text-primary" /> {titre}
        </Titre>
        <div className="space-y-2 [&_li]:ml-5 [&_li]:list-disc">{children}</div>
      </section>
    </Apparition>
  );
}
