"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RotateCcw, Undo2 } from "lucide-react";
import type { Bot } from "@/app/_types/divers";
import { etapeSuivante, profondeur, type Etape } from "@/lib/bot";
import { Button } from "@/components/ui/button";
import { bouton } from "@/lib/bouton";

type Echange = { questionId: string; reponse: string };

// Le bot « Est-ce que l'informatique est pour toi ? » : un arbre de décision défini dans data/bot.yaml.
// Il garde le style terminal de l'ancien site, mais on répond avec des boutons (ou les touches 1, 2, 3...).
export function BotOrientation({ bot, compact = false }: { bot: Bot; compact?: boolean }) {
  const [historique, setHistorique] = useState<Echange[]>([]);
  const [etape, setEtape] = useState<Etape>({ type: "question", id: bot.depart });
  const fin = useRef<HTMLDivElement>(null);

  const total = profondeur(bot, bot.depart);
  const progression = etape.type === "resultat" ? 100 : Math.min(95, Math.round((historique.length / Math.max(total, 1)) * 100));
  const question = etape.type === "question" ? bot.questions[etape.id] : null;
  const resultat = etape.type === "resultat" ? bot.resultats[etape.id] : null;

  function repondre(i: number) {
    if (!question || etape.type !== "question") return;
    setHistorique((h) => [...h, { questionId: etape.id, reponse: question.choix[i].texte }]);
    setEtape(etapeSuivante(bot, etape.id, i));
  }

  function annuler() {
    const precedent = historique.at(-1);
    if (!precedent) return;
    setHistorique((h) => h.slice(0, -1));
    setEtape({ type: "question", id: precedent.questionId });
  }

  function recommencer() {
    setHistorique([]);
    setEtape({ type: "question", id: bot.depart });
  }

  // Raccourcis clavier : 1, 2, 3... pour répondre
  useEffect(() => {
    function surTouche(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (question && n >= 1 && n <= question.choix.length) repondre(n - 1);
    }
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  });

  useEffect(() => {
    if (historique.length) fin.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [historique.length]);

  return (
    // Barre de titre gris pâle et contour gris 3 : la fenêtre se détache du fond partout où le bot est affiché
    // (bleu marine de l'accueil, page blanche, thème sombre).
    <div className="overflow-hidden rounded-xl border border-cem-gris-3 bg-black text-cem-gris-1 shadow-xl">
      <div className="flex items-center gap-2 bg-cem-gris-1 px-4 py-2">
        <span className="size-3 rounded-full bg-cem-rouge" />
        <span className="size-3 rounded-full bg-cem-jaune" />
        <span className="size-3 rounded-full bg-cem-vert" />
        <span className="ml-2 font-mono text-xs text-cem-marine">orientation.sh : est-ce que l&apos;info est pour toi ?</span>
      </div>
      <div className="h-1 bg-white/10" role="progressbar" aria-label="Progression" aria-valuenow={progression} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-cem-vert transition-all duration-500" style={{ width: `${progression}%` }} />
      </div>

      <div className={`space-y-3 overflow-y-auto p-4 font-mono text-sm ${compact ? "max-h-80" : "max-h-[32rem]"}`} aria-live="polite">
        {historique.map((h, i) => (
          <div key={i} className="space-y-1">
            <p>
              <span className="text-cem-vert">bot&gt;</span> {bot.questions[h.questionId].question}
            </p>
            <p className="text-right text-cem-ciel">{h.reponse} &lt;toi</p>
          </div>
        ))}

        {question && (
          <div className="space-y-2">
            <p>
              <span className="text-cem-vert">bot&gt;</span> {question.question}
              <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-cem-vert align-middle" />
            </p>
            {question.aide && <p className="text-xs text-cem-gris-2">{question.aide}</p>}
            <div className="flex flex-col gap-2 pt-1 font-sans">
              {question.choix.map((c, i) => (
                <button
                  key={c.texte}
                  onClick={() => repondre(i)}
                  className="rounded-md border border-white/20 px-3 py-2 text-left text-sm transition hover:border-cem-vert hover:bg-white/10 focus-visible:border-cem-vert"
                >
                  <kbd className="mr-2 rounded bg-white/10 px-1.5 font-mono text-xs">{i + 1}</kbd>
                  {c.texte}
                </button>
              ))}
            </div>
          </div>
        )}

        {resultat && (
          <div className="space-y-3 rounded-lg border border-cem-vert/40 bg-white/5 p-4 font-sans">
            <p className="font-mono text-xs text-cem-vert">Diagnostic terminé. Compatibilité : {resultat.compatibilite} %</p>
            <div className="h-2 overflow-hidden rounded bg-white/10">
              <div className="h-full bg-cem-vert transition-all duration-1000" style={{ width: `${resultat.compatibilite}%` }} />
            </div>
            <h3 className="text-lg font-bold text-white">{resultat.titre}</h3>
            <p className="text-cem-gris-1">{resultat.texte}</p>
            <div className="flex flex-wrap gap-2">
              {resultat.liens.map((l) =>
                l.href.startsWith("http") ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={bouton({ size: "sm" }, "bg-cem-vert text-cem-marine hover:bg-cem-vert/80")}>
                    {l.texte}
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} className={bouton({ size: "sm" }, "bg-cem-vert text-cem-marine hover:bg-cem-vert/80")}>
                    {l.texte}
                  </Link>
                ),
              )}
            </div>
          </div>
        )}
        <div ref={fin} />
      </div>

      <div className="flex justify-end gap-2 border-t border-white/10 px-4 py-2">
        <Button variant="ghost" size="sm" onClick={annuler} disabled={!historique.length} className="text-white hover:bg-white/10 hover:text-white">
          <Undo2 className="size-4" /> Retour
        </Button>
        <Button variant="ghost" size="sm" onClick={recommencer} disabled={!historique.length} className="text-white hover:bg-white/10 hover:text-white">
          <RotateCcw className="size-4" /> Recommencer
        </Button>
      </div>
    </div>
  );
}
