"use client";
import type { ReactNode } from "react";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { isoDepuisDate } from "@/lib/temps";

// Affiche son contenu jusqu'à la date donnée, puis le cache : le site est statique
// et peut rester des semaines sans être republié, une date passée resterait affichée.
export function DateAVenir({ iso, children }: { iso: string; children: ReactNode }) {
  const maintenant = useMaintenant(3_600_000);
  if (maintenant && isoDepuisDate(maintenant) > iso) return null;
  return children;
}
