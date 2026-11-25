import type { Metadata } from "next";
import { ExternalLink, FileText } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { CalendrierEtudiant } from "@/components/calendrier-etudiant";
import { calendrierScolaire } from "@/lib/donnees";
import { formaterDate } from "@/lib/temps";
import { bouton } from "@/lib/bouton";

export const metadata: Metadata = { title: "Calendrier scolaire" };

export default function PageCalendrier() {
  const c = calendrierScolaire();
  return (
    <>
      <TitrePage titre="Calendrier scolaire" sousTitre="Relâche, journées JR, évaluations communes (EC), congés : extrait automatiquement du calendrier officiel du cégep.">
        <div className="mt-4 flex flex-wrap gap-2">
          {c.pdf.map((p) => (
            <a key={p.annee} href={p.url} target="_blank" rel="noreferrer" className={bouton()}>
              <FileText className="size-4" /> PDF officiel {p.annee}
            </a>
          ))}
          <a href={c.source} target="_blank" rel="noreferrer" className={bouton({ variant: "outline" })}>
            Page du cégep <ExternalLink className="size-4" />
          </a>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {c.pdf
            .filter((p) => p.revise)
            .map((p) => `Version ${p.annee} révisée le ${formaterDate(p.revise!).toLowerCase()} ${p.revise!.slice(0, 4)}.`)
            .join(" ")}{" "}
          En cas de différence, le PDF officiel a toujours raison.
        </p>
      </TitrePage>
      <Conteneur>
        <CalendrierEtudiant scolaire={c} />
        <dl className="mt-6 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["JR", "Journée particulière d'enseignement : reprise de cours ou d'examen"],
            ["JR*", "Même chose, priorité à la préparation de l'EUL"],
            ["JPR", "Journée provisoire de reprise"],
            ["EC", "Évaluations terminales communes"],
            ["EHR", "Évaluations terminales selon l'horaire régulier"],
            ["EUL", "Épreuve uniforme de langue"],
            ["JM", "Journée de mise à jour"],
            ["JP", "Journée pédagogique"],
            ["JE", "Journée d'encadrement"],
          ].map(([code, texte]) => (
            <div key={code} className="flex gap-2">
              <dt className="w-10 shrink-0 font-bold">{code}</dt>
              <dd className="text-muted-foreground">{texte}</dd>
            </div>
          ))}
        </dl>
      </Conteneur>
    </>
  );
}
