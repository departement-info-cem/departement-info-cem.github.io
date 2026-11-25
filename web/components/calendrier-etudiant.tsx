"use client";
import Link from "next/link";
import { CalendarDays, Clock, School } from "lucide-react";
import type { CalendrierScolaire } from "@/app/_types/divers";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { CalendrierMois } from "@/components/calendrier-mois";
import { MonCalendrier, MonHoraire } from "@/components/mon-horaire";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { libelle } from "@/lib/mes-cours";

// Page Calendrier : le calendrier du cégep. Si l'étudiant a entré ses cours, son calendrier et son horaire d'abord.
export function CalendrierEtudiant({ scolaire }: { scolaire: CalendrierScolaire }) {
  const { mesCours } = useMesCours();
  if (!mesCours.length) {
    return (
      <>
        <p className="mb-4 text-sm text-muted-foreground">
          <Link href="/mes-cours" className="font-semibold text-primary underline">Indique tes cours</Link> pour voir ici ton calendrier (examens, remises, cours annulés) et ton horaire.
        </p>
        <CalendrierMois scolaire={scolaire} />
      </>
    );
  }
  return (
    <Tabs defaultValue="mon-calendrier">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="mon-calendrier"><CalendarDays className="size-4" /> Mon calendrier</TabsTrigger>
          <TabsTrigger value="mon-horaire"><Clock className="size-4" /> Mon horaire</TabsTrigger>
          <TabsTrigger value="cegep"><School className="size-4" /> Cégep</TabsTrigger>
        </TabsList>
        <span className="text-sm text-muted-foreground">
          {mesCours.map(libelle).join(", ")} · <Link href="/mes-cours" className="text-primary underline">Mes cours</Link>
        </span>
      </div>
      <TabsContent value="mon-calendrier"><MonCalendrier /></TabsContent>
      <TabsContent value="mon-horaire"><MonHoraire /></TabsContent>
      <TabsContent value="cegep"><CalendrierMois scolaire={scolaire} /></TabsContent>
    </Tabs>
  );
}
