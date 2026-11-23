"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { CalendrierScolaire } from "@/app/_types/divers";
import { validerYamlProf } from "@/lib/validation";
import { HoraireSemaine, type InfoCours } from "@/components/horaire-semaine";
import { CalendrierMois } from "@/components/calendrier-mois";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Aperçu en direct : le prof colle son YAML, voit les erreurs et le rendu avant de faire son commit.
export function ApercuYaml({
  modele,
  exemples,
  scolaire,
  cours,
  photos,
}: {
  modele: string;
  exemples: Record<string, string>;
  scolaire: CalendrierScolaire;
  cours: InfoCours;
  photos: string[];
}) {
  const [texte, setTexte] = useState(modele);
  const coursConnus = useMemo(() => new Set(Object.keys(cours)), [cours]);
  const photosConnues = useMemo(() => new Set(photos), [photos]);
  const { prof, problemes } = useMemo(() => validerYamlProf(texte, { coursConnus, photosConnues }), [texte, coursConnus, photosConnues]);
  const erreurs = problemes.filter((p) => p.niveau === "erreur");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Partir de :</span>
          <button onClick={() => setTexte(modele)} className="rounded border px-2 py-0.5 hover:bg-accent">
            modèle vide
          </button>
          {Object.entries(exemples).map(([id, yaml]) => (
            <button key={id} onClick={() => setTexte(yaml)} className="rounded border px-2 py-0.5 hover:bg-accent">
              {id}.yaml
            </button>
          ))}
        </div>
        <Textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          spellCheck={false}
          wrap="off"
          className="field-sizing-fixed h-[34rem] w-full max-w-full resize-y overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed"
          aria-label="Contenu YAML de ta fiche"
        />
        <div className="mt-3 space-y-1" aria-live="polite">
          {problemes.length === 0 && (
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <CheckCircle2 className="size-4" /> Aucune erreur : tu peux copier ce texte dans GitHub.
            </p>
          )}
          {problemes.map((p, i) => (
            <p key={i} className={`flex items-start gap-2 text-sm ${p.niveau === "erreur" ? "text-destructive" : "text-amber-700 dark:text-amber-300"}`}>
              {p.niveau === "erreur" ? <XCircle className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
              <span>
                {p.ligne && <strong>Ligne {p.ligne} : </strong>}
                {p.message}
              </span>
            </p>
          ))}
        </div>
      </div>
      <div className="min-w-0">
        {prof && erreurs.length === 0 ? (
          <Tabs defaultValue="horaire">
            <TabsList className="mb-3">
              <TabsTrigger value="horaire">Horaire</TabsTrigger>
              <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
            </TabsList>
            <TabsContent value="horaire">
              <HoraireSemaine plages={prof.horaire?.plages ?? []} debut={prof.horaire?.debut} fin={prof.horaire?.fin} cours={cours} />
            </TabsContent>
            <TabsContent value="calendrier">
              <CalendrierMois scolaire={scolaire} plages={prof.horaire?.plages} evenements={prof.calendrier} sessionId={prof.session} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex h-full min-h-60 items-center justify-center rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            Corrige les erreurs pour voir l&apos;aperçu de ton horaire et de ton calendrier.
          </div>
        )}
      </div>
    </div>
  );
}
