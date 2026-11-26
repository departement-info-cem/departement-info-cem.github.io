"use client";
import { useState } from "react";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { BoutonPartager } from "@/components/bouton-partager";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PARAM_COURS } from "@/lib/mes-cours";

/** L'adresse de la page actuelle, avec ou sans « ?mescours= » (les autres paramètres, comme ?cours=, sont gardés). */
export function adresseAvecCours(href: string, paramCours: string | null): string {
  const url = new URL(href);
  url.searchParams.delete(PARAM_COURS);
  if (paramCours) url.searchParams.set(PARAM_COURS, paramCours);
  // Les virgules restent lisibles : « SN1-1050,5M6-1020 »
  return url.href.replace(/%2C/gi, ",");
}

// Partager la page affichée, au besoin avec mes cours : celui qui ouvre le lien voit un aperçu du site avec ces cours.
// Bouton dans l'en-tête sur ordinateur, entrée du menu sur mobile (voir components/entete.tsx).
export function PartagerPage({ ouvert, changer }: { ouvert: boolean; changer: (o: boolean) => void }) {
  const { apercu, mesCours, paramCours } = useMesCours();
  // Pendant un aperçu, on partage plutôt les cours de l'aperçu ; sinon on ne partage pas ses groupes sans le vouloir
  const [avecCours, setAvecCours] = useState<boolean | null>(null);
  const inclure = Boolean(paramCours) && (avecCours ?? Boolean(apercu));
  const titre = typeof document === "undefined" ? "" : document.title;

  return (
    <Dialog open={ouvert} onOpenChange={changer}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Partager cette page</DialogTitle>
        <DialogDescription>Par message ou par courriel. Sur ordinateur, le lien est copié.</DialogDescription>
        {mesCours.length > 0 && (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={inclure} onChange={(e) => setAvecCours(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
            <span>
              Inclure {apercu ? "les cours de l'aperçu" : "mes cours"} <span className="text-muted-foreground">({paramCours.replaceAll(",", ", ")})</span>
              <span className="block text-xs text-muted-foreground">La personne verra la page comme si elle suivait ces cours, sans perdre les siens.</span>
            </span>
          </label>
        )}
        {ouvert && <BoutonPartager url={() => adresseAvecCours(location.href, inclure ? paramCours : null)} titre={titre} />}
      </DialogContent>
    </Dialog>
  );
}
