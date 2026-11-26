"use client";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { PARAM_COURS } from "@/lib/mes-cours";

// Page « Mes cours » : comment envoyer une page avec ces cours (pour tester, ou pour un collègue).
export function LienMesCours() {
  const { paramCours } = useMesCours();
  if (!paramCours) return null;
  return (
    <p className="mt-3 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
      Pour envoyer une page avec ces cours : <strong className="text-foreground">Partager</strong> (en haut, ou dans le menu sur téléphone), puis « Inclure mes cours ». Ou ajoute à la fin de son adresse{" "}
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground break-all">?{PARAM_COURS}={paramCours}</code>. Ceux qui ouvrent le lien voient un aperçu, sans perdre leurs propres cours.
    </p>
  );
}
