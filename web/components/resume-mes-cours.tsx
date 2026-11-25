"use client";
import Link from "next/link";
import { BookmarkPlus, Star } from "lucide-react";
import { useMesCours, useMonCalendrier } from "@/app/_contexts/mes-cours-context";
import { AVenir } from "@/components/a-venir";
import { AjoutCours } from "@/components/choix-groupe";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { bouton } from "@/lib/bouton";
import { libelle } from "@/lib/mes-cours";

// En haut de la liste des profs : mes cours, ou l'invitation à les indiquer.
export function ResumeMesCours() {
  const { mesCours } = useMesCours();
  const { jours } = useMonCalendrier();
  return (
    <div className="mb-6 space-y-3">
    <div className=" flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3 text-sm">
      <Star className="size-4 text-cem-foret" />
      {mesCours.length ? (
        <>
          <span className="font-semibold">Mes cours :</span>
          {mesCours.map((m) => (
            <span key={`${m.cours}|${m.groupe ?? ""}`} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {libelle(m)}
            </span>
          ))}
          <span className="text-muted-foreground">: tes profs sont en premier.</span>
        </>
      ) : (
        <span>Indique tes cours et ton groupe pour voir tes profs en premier, avec leurs disponibilités.</span>
      )}
      <span className="ml-auto flex gap-2">
        <Dialog>
          <DialogTrigger className={bouton({ variant: "outline", size: "sm" })}>
            <BookmarkPlus className="size-4" /> Ajouter un cours
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Ajouter un cours</DialogTitle>
            <DialogDescription>Cherche ton cours, puis choisis ton groupe. Ton choix reste dans ce navigateur.</DialogDescription>
            <AjoutCours />
          </DialogContent>
        </Dialog>
        <Link href="/mes-cours" className={bouton({ variant: "ghost", size: "sm" })}>
          Mes cours et mon horaire
        </Link>
      </span>
    </div>
    {/* Rappel : les évaluations et remises de la semaine qui vient */}
    {mesCours.length > 0 && <AVenir jours={jours} nbJours={7} evaluationsSeulement vide={null} />}
    </div>
  );
}
