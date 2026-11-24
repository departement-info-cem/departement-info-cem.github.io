"use client";
import { useEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Undo2 } from "lucide-react";
import type { Bot } from "@/app/_types/divers";
import { etapeSuivante, profondeur, type Etape } from "@/lib/bot";
import { bouton } from "@/lib/bouton";

type Echange = { questionId: string; reponse: string };

// Une ligne s'affiche après ce délai (voir .terminal-affiche dans globals.css).
const delai = (ms: number) => ({ "--delai": `${Math.round(ms)}ms` }) as CSSProperties;
// Le bot écrit ses questions à cette vitesse, sans dépasser 0,6 s par question.
const dureeEcriture = (texte: string) => Math.min(600, texte.length * 15);

// Le bot « Est-ce que l'informatique est pour toi ? » : un arbre de décision défini dans data/bot.yaml.
// Il a l'allure d'un programme dans un terminal, mais on répond en cliquant (ou avec les touches 1, 2, 3...).
export function BotOrientation({ bot, compact = false }: { bot: Bot; compact?: boolean }) {
  const [historique, setHistorique] = useState<Echange[]>([]);
  const [etape, setEtape] = useState<Etape>({ type: "question", id: bot.depart });
  const ecran = useRef<HTMLDivElement>(null);
  const bloc = useRef<HTMLDivElement>(null);
  // Vrai quand on a répondu depuis l'écran (souvent au clavier) : le focus passe alors à la question suivante
  // au lieu de se perdre avec le bouton qui disparaît.
  const focusSuit = useRef(false);

  const total = profondeur(bot, bot.depart);
  const progression = etape.type === "resultat" ? 100 : Math.min(95, Math.round((historique.length / Math.max(total, 1)) * 100));
  const question = etape.type === "question" ? bot.questions[etape.id] : null;
  const resultat = etape.type === "resultat" ? bot.resultats[etape.id] : null;
  // La première question est déjà là au chargement ; les suivantes s'écrivent après chaque réponse.
  const anime = historique.length > 0;
  const finQuestion = question && anime ? dureeEcriture(question.question) : 0;

  function repondre(i: number) {
    if (!question || etape.type !== "question") return;
    focusSuit.current = Boolean(ecran.current?.contains(document.activeElement));
    setHistorique((h) => [...h, { questionId: etape.id, reponse: question.choix[i].texte }]);
    setEtape(etapeSuivante(bot, etape.id, i));
  }

  function annuler() {
    const precedent = historique.at(-1);
    if (!precedent) return;
    focusSuit.current = false;
    setHistorique((h) => h.slice(0, -1));
    setEtape({ type: "question", id: precedent.questionId });
  }

  function recommencer() {
    focusSuit.current = false;
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

  // Comme dans un terminal, on descend jusqu'au bas de la nouvelle question. Un résultat plus haut
  // que la fenêtre se lit plutôt depuis son début. Seul l'écran défile, jamais la page.
  useEffect(() => {
    const e = ecran.current;
    const b = bloc.current;
    if (!historique.length || !e || !b) return;
    const debut = b.offsetTop - 16;
    const fin = b.offsetTop + b.offsetHeight - e.clientHeight + 16;
    e.scrollTo({ top: Math.min(debut, fin), behavior: "smooth" });
    if (focusSuit.current) b.querySelector<HTMLElement>("button, a")?.focus({ preventScroll: true });
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

      <div
        ref={ecran}
        className={`terminal-ecran relative space-y-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed scheme-dark ${compact ? "max-h-96" : "max-h-[32rem]"}`}
        aria-live="polite"
      >
        <Invite>./orientation.sh</Invite>

        {historique.map((h, i) => (
          <p key={i}>
            <span className="text-cem-vert" aria-hidden>
              ✓
            </span>{" "}
            <span className="text-cem-gris-2">{bot.questions[h.questionId].question}</span> <span className="text-cem-gris-3">›</span>{" "}
            <span className="text-cem-ciel">{h.reponse}</span>
          </p>
        ))}

        {/* La clé recrée le bloc à chaque étape, pour que l'écriture recommence. */}
        {question && (
          <div ref={bloc} key={historique.length} className="pt-2">
            <p className="font-bold text-white">
              <span className="text-cem-vert">?</span> <Ecriture texte={question.question} anime={anime} />
              <Curseur style={delai(finQuestion)} />
            </p>
            {question.aide && (
              <p className="terminal-affiche pl-[2ch] text-cem-gris-3" style={delai(finQuestion)}>
                {question.aide}
              </p>
            )}
            {!anime && <p className="pl-[2ch] text-xs text-cem-gris-3">Clique sur ta réponse (ou tape son numéro).</p>}
            <ul className="mt-3 space-y-1.5">
              {question.choix.map((c, i) => (
                <li key={c.texte} className="terminal-affiche" style={delai(finQuestion + 70 * (i + 1))}>
                  <button
                    onClick={() => repondre(i)}
                    className="group flex w-full gap-3 rounded border border-white/20 px-3 py-2 text-left hover:border-cem-vert hover:bg-cem-vert hover:text-black focus-visible:border-cem-vert focus-visible:bg-cem-vert focus-visible:text-black focus-visible:outline-none"
                  >
                    <span className="shrink-0 text-cem-vert group-hover:text-black group-focus-visible:text-black">[{i + 1}]</span>
                    <span>{c.texte}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {resultat && (
          <div ref={bloc} className="space-y-3 pt-2">
            <p className="text-cem-gris-3">
              Analyse de tes réponses...
              <span className="terminal-affiche text-cem-vert" style={delai(400)}>
                {" "}terminé
              </span>
            </p>
            <div className="terminal-affiche flex items-center gap-2" style={delai(500)}>
              <span>Compatibilité</span>
              <span className="flex h-3.5 flex-1 items-center text-cem-gris-3" aria-hidden>
                [<Barre pourcent={resultat.compatibilite} blocs={20} className="terminal-remplit mx-0.5 h-full flex-1" />]
              </span>
              <span className="font-bold text-cem-vert">{resultat.compatibilite} %</span>
            </div>
            <div className="terminal-affiche space-y-3 border-l-2 border-cem-vert pl-3" style={delai(1200)}>
              <h3 className="font-mono text-lg font-bold text-white">{resultat.titre}</h3>
              <p>{resultat.texte}</p>
              <div className="flex flex-wrap gap-2">
                {resultat.liens.map((l) => {
                  const classes = bouton({ size: "sm" }, "bg-cem-vert font-mono font-bold text-cem-marine hover:bg-cem-vert-pomme");
                  const contenu = (
                    <>
                      {l.texte} <ArrowRight className="size-3.5" />
                    </>
                  );
                  return l.href.startsWith("http") ? (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={classes}>
                      {contenu}
                    </a>
                  ) : (
                    <Link key={l.href} href={l.href} className={classes}>
                      {contenu}
                    </Link>
                  );
                })}
              </div>
            </div>
            <Invite style={delai(1300)} curseur />
          </div>
        )}
      </div>

      {/* Barre d'état, comme au bas de nano ou de tmux */}
      <div className="flex items-center justify-between gap-3 border-t border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs">
        <div className="flex min-w-0 items-center gap-2 text-cem-gris-2">
          <span className="whitespace-nowrap">{resultat ? "Terminé" : `Question ${historique.length + 1}`}</span>
          <Barre pourcent={progression} blocs={8} className="h-2 w-12 sm:w-20" role="progressbar" aria-label="Progression" aria-valuenow={progression} aria-valuemin={0} aria-valuemax={100} />
        </div>
        <div className="flex gap-1">
          <ToucheEtat onClick={annuler} inactif={!historique.length} icone={<Undo2 className="size-3" />}>
            Retour
          </ToucheEtat>
          <ToucheEtat onClick={recommencer} inactif={!historique.length} icone={<RotateCcw className="size-3" />}>
            Recommencer
          </ToucheEtat>
        </div>
      </div>
    </div>
  );
}

// L'invite de commande du terminal, suivie d'une commande ou du curseur.
function Invite({ children, curseur = false, style }: { children?: ReactNode; curseur?: boolean; style?: CSSProperties }) {
  return (
    <p className={`text-cem-gris-3 ${style ? "terminal-affiche" : ""}`} style={style}>
      <span className="text-cem-vert">toi@cem</span>:<span className="text-cem-ciel">~</span>$ {children}
      {curseur && <Curseur />}
    </p>
  );
}

function Curseur({ style }: { style?: CSSProperties }) {
  return <span className="terminal-curseur ml-1 inline-block h-[1.1em] w-[1ch] bg-cem-vert align-text-bottom" style={style} aria-hidden />;
}

// Barre de progression en blocs (voir .terminal-barre dans globals.css), remplie par blocs entiers.
function Barre({ pourcent, blocs, className, ...props }: { pourcent: number; blocs: number } & ComponentProps<"span">) {
  const pleins = Math.round((pourcent / 100) * blocs);
  return <span {...props} className={`terminal-barre block ${className}`} style={{ "--blocs": blocs, "--progres": `${(pleins / blocs) * 100}%` } as CSSProperties} />;
}

// Le texte s'écrit lettre par lettre. Les lecteurs d'écran lisent la phrase entière d'un coup.
function Ecriture({ texte, anime }: { texte: string; anime: boolean }) {
  if (!anime) return texte;
  const pas = dureeEcriture(texte) / texte.length;
  return (
    <>
      <span className="sr-only">{texte}</span>
      <span aria-hidden>
        {Array.from(texte, (lettre, i) => (
          <span key={i} className="terminal-affiche" style={delai(i * pas)}>
            {lettre}
          </span>
        ))}
      </span>
    </>
  );
}

// Bouton de la barre d'état : une touche en vidéo inverse suivie de son nom, comme dans nano.
// Inactif, il reste focusable (aria-disabled) : le focus ne se perd pas quand on revient au début.
function ToucheEtat({ onClick, inactif, icone, children }: { onClick: () => void; inactif: boolean; icone: ReactNode; children: ReactNode }) {
  return (
    <button
      onClick={inactif ? undefined : onClick}
      aria-disabled={inactif}
      className="inline-flex items-center gap-1.5 rounded px-1.5 py-1.5 text-cem-gris-1 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cem-vert aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent"
    >
      <span className="rounded-sm bg-cem-gris-1 p-0.5 text-black">{icone}</span>
      {children}
    </button>
  );
}
