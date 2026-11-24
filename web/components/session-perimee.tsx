"use client";
import { TriangleAlert } from "lucide-react";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { isoDepuisDate } from "@/lib/temps";

// Avertit quand l'horaire publié est celui d'une session terminée.
export function SessionPerimee({ session }: { session?: string }) {
  const maintenant = useMaintenant(3_600_000);
  const scolaire = useScolaire();
  const s = scolaire.sessions.find((x) => x.id === session);
  if (!maintenant || !s || isoDepuisDate(maintenant) <= s.fin) return null;
  return (
    <p className="flex w-fit items-center gap-2 rounded-md border border-cem-jaune bg-cem-jaune-pale text-cem-marine px-3 py-1 text-sm">
      <TriangleAlert className="size-4" /> Cet horaire est celui de la session {s.nom}, maintenant terminée.
    </p>
  );
}
