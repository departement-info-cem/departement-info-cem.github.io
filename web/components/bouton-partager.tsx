"use client";
import { useState } from "react";
import { Check, Mail, Share2 } from "lucide-react";
import { bouton } from "@/lib/bouton";
import { chemin as avecBase } from "@/lib/chemins";

// Partager un lien direct (horaire ou calendrier d'un prof) par message ou par courriel.
// Sur téléphone : la feuille de partage du système (Messages, courriel, Teams...). Sur ordinateur : le lien est copié.
// Sans « chemin », on partage l'adresse de la page actuelle (avec ?cours=... s'il y en a un).
export function BoutonPartager({ chemin, titre, className }: { chemin?: string; titre: string; className?: string }) {
  const [copie, setCopie] = useState(false);
  const adresse = () => (chemin ? new URL(avecBase(chemin), location.origin).href : location.href);

  async function partager() {
    const url = adresse();
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: titre, url });
      } catch {
        // Partage annulé : rien à faire
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      // Presse-papiers refusé : on ouvre le lien seul, que l'on peut copier depuis la barre d'adresse
      location.assign(url);
    }
  }

  return (
    <span className={`inline-flex flex-wrap gap-2 ${className ?? ""}`}>
      <button onClick={partager} className={bouton({ variant: "outline", size: "sm" })} aria-live="polite">
        {copie ? <Check className="size-4" /> : <Share2 className="size-4" />} {copie ? "Lien copié" : "Partager"}
      </button>
      <button onClick={() => location.assign(`mailto:?subject=${encodeURIComponent(titre)}&body=${encodeURIComponent(adresse())}`)} className={bouton({ variant: "ghost", size: "sm" })}>
        <Mail className="size-4" /> Courriel
      </button>
    </span>
  );
}
