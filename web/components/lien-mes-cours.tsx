"use client";
import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { bouton } from "@/lib/bouton";
import { PARAM_COURS } from "@/lib/mes-cours";

// Page « Mes cours » : de quoi envoyer un lien qui montre le site avec ces cours (pour tester, ou pour un collègue).
export function LienMesCours() {
  const { paramCours } = useMesCours();
  const [copie, setCopie] = useState<"" | "ok" | "refus">("");
  if (!paramCours) return null;
  const suffixe = `?${PARAM_COURS}=${paramCours}`;
  async function copier() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${suffixe}`);
      setCopie("ok");
    } catch {
      // Navigateur qui refuse l'accès au presse-papiers : la fin d'adresse reste affichée, à copier à la main
      setCopie("refus");
    }
    setTimeout(() => setCopie(""), 3000);
  }
  return (
    <div className="mt-3 rounded-md border border-dashed p-3 text-sm">
      <p className="text-muted-foreground">
        Pour montrer n&apos;importe quelle page avec ces cours, ajoute à la fin de son adresse :{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground break-all">{suffixe}</code>. Ceux qui ouvrent le lien voient un aperçu, sans perdre leurs propres cours.
      </p>
      <button onClick={copier} className={bouton({ variant: "outline", size: "sm" }, "mt-2")}>
        {copie === "ok" ? <Check className="size-4" /> : <Link2 className="size-4" />} {copie === "ok" ? "Lien copié" : copie === "refus" ? "Copie refusée : copie la fin d'adresse ci-dessus" : "Copier le lien de cette page"}
      </button>
    </div>
  );
}
