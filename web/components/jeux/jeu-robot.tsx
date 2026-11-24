"use client";
import { useEffect, useRef, useState } from "react";
import { CircleAlert, Lightbulb, Play, RotateCcw, Square, StepForward, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoixNiveau } from "@/components/jeux/choix-niveau";
import { EditeurPython } from "@/components/jeux/editeur-python";
import { SceneRobot } from "@/components/jeux/scene-robot";
import { useStockageLocal } from "@/app/_hooks/use-stockage-local";
import { compterLignes, ErreurPython, type Etape, type Suggestion } from "@/lib/jeux/mini-python";
import { bilan, copier, creerMonde, lancer, NIVEAUX, verifier, type Monde } from "@/lib/jeux/robot";

const AIDE: Record<string, string> = {
  avancer: "avance d'une case",
  tourner_gauche: "quart de tour à gauche",
  tourner_droite: "quart de tour à droite",
  ramasser: "ramasse le paquet sous Octet",
  devant_libre: "vrai si la case devant est libre",
  droite_libre: "vrai si la case à droite est libre",
  gauche_libre: "vrai si la case à gauche est libre",
  sur_paquet: "vrai s'il y a un paquet ici",
  sur_terminal: "vrai si Octet est sur le terminal",
};
const estCapteur = (c: string) => c.endsWith("libre") || c.startsWith("sur_");
const VITESSES = { Lent: 700, Normal: 350, Rapide: 110 };
type NomVitesse = keyof typeof VITESSES;
type Message = { type: "erreur" | "succes" | "info"; texte: string };

export function JeuRobot() {
  const [niveau, setNiveau] = useState(0);
  const [reussis, setReussis] = useStockageLocal<number[]>("jeu-robot-reussis", []);
  const [codes, setCodes] = useStockageLocal<Record<number, string>>("jeu-robot-codes", {});
  const [carte, setCarte] = useState(0);
  const [monde, setMonde] = useState<Monde>(() => creerMonde(NIVEAUX[0].cartes[0]));
  const [ligne, setLigne] = useState<number | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [vitesse, setVitesse] = useState<NomVitesse>("Normal");
  const [message, setMessage] = useState<Message | null>(null);
  const [indice, setIndice] = useState(false);
  const execution = useRef<{ gen: Generator<Etape, void>; monde: Monde; carte: number } | null>(null);
  const zone = useRef<HTMLTextAreaElement>(null);

  const n = NIVEAUX[niveau];
  const code = codes[niveau] ?? n.depart;
  const nbLignes = compterLignes(code);
  const dernier = niveau === NIVEAUX.length - 1;
  const commandes = n.commandes.map((c): Suggestion => ({ nom: c, type: estCapteur(c) ? "capteur" : "action", aide: AIDE[c] }));

  function remettre(nouveau = niveau, c = carte) {
    execution.current = null;
    setEnCours(false);
    setLigne(null);
    setMessage(null);
    setCarte(c);
    setMonde(creerMonde(NIVEAUX[nouveau].cartes[c]));
  }

  function choisir(i: number) {
    setNiveau(i);
    setIndice(false);
    remettre(i, 0);
  }

  function ecrire(texte: string) {
    setCodes((avant) => ({ ...avant, [niveau]: texte }));
    if (execution.current || message || ligne) remettre();
  }

  function demarrer(c: number): boolean {
    if (n.maxLignes && nbLignes > n.maxLignes) {
      setMessage({ type: "erreur", texte: `Ton programme a ${nbLignes} lignes : pour ce niveau, le maximum est ${n.maxLignes}.` });
      return false;
    }
    const m = creerMonde(n.cartes[c]);
    try {
      execution.current = { gen: lancer(code, m, n.commandes), monde: m, carte: c };
    } catch (e) {
      afficherErreur(e);
      return false;
    }
    setCarte(c);
    setMonde(copier(m));
    setMessage(null);
    setLigne(null);
    return true;
  }

  function afficherErreur(e: unknown) {
    if (!(e instanceof ErreurPython)) throw e;
    execution.current = null;
    setEnCours(false);
    setLigne(e.ligne);
    setMessage({ type: "erreur", texte: `Ligne ${e.ligne} : ${e.message}` });
  }

  /** Avance d'une étape. Retourne false quand c'est fini. */
  function avancer(): boolean {
    const ex = execution.current;
    if (!ex) return false;
    try {
      const r = ex.gen.next();
      setMonde(copier(ex.monde));
      if (!r.done) {
        setLigne(r.value.ligne);
        return true;
      }
    } catch (e) {
      setMonde(copier(ex.monde));
      afficherErreur(e);
      return false;
    }
    // Programme terminé
    execution.current = null;
    setLigne(null);
    const manque = bilan(ex.monde);
    if (manque) {
      setEnCours(false);
      setMessage({ type: "erreur", texte: `Programme terminé. ${manque}` });
      return false;
    }
    if (ex.carte + 1 < n.cartes.length) {
      // On rejoue sur le plan suivant
      return demarrer(ex.carte + 1);
    }
    const echec = n.cartes.findIndex((_, i) => verifier(code, n, i) !== null);
    setEnCours(false);
    if (echec >= 0) setMessage({ type: "erreur", texte: `Réussi ici, mais pas sur le plan ${echec + 1}.` });
    else {
      setMessage({ type: "succes", texte: `Mission accomplie en ${nbLignes} ligne${nbLignes > 1 ? "s" : ""} !${n.cartes.length > 1 ? ` Ton programme marche sur les ${n.cartes.length} plans.` : ""}` });
      setReussis((r) => (r.includes(niveau) ? r : [...r, niveau]));
    }
    return false;
  }

  // Minuterie d'exécution
  const avancerRef = useRef(avancer);
  useEffect(() => {
    avancerRef.current = avancer;
  });
  useEffect(() => {
    if (!enCours) return;
    const id = setInterval(() => avancerRef.current(), VITESSES[vitesse]);
    return () => clearInterval(id);
  }, [enCours, vitesse]);

  function executerTout() {
    if (enCours) {
      setEnCours(false);
      return;
    }
    if (execution.current || demarrer(0)) setEnCours(true);
  }

  function unPas() {
    setEnCours(false);
    if (execution.current || demarrer(0)) avancer();
  }

  function inserer(texte: string) {
    const z = zone.current;
    const pos = z?.selectionStart ?? code.length;
    const debutLigne = code.lastIndexOf("\n", pos - 1) + 1;
    const ligneActuelle = code.slice(debutLigne, pos);
    const indent = /^ */.exec(ligneActuelle)![0];
    const ajout = estCapteur(texte) ? `${texte}()` : ligneActuelle.trim() ? `\n${indent}${texte}()` : `${texte}()`;
    ecrire(code.slice(0, pos) + ajout + code.slice(pos));
    requestAnimationFrame(() => {
      z?.focus();
      z?.setSelectionRange(pos + ajout.length, pos + ajout.length);
    });
  }

  return (
    <div>
      <ChoixNiveau titres={NIVEAUX.map((x) => x.titre)} niveau={niveau} reussis={reussis} choisir={choisir} />
      <div className="mb-4 rounded-lg border-l-4 border-l-cem-vert bg-muted p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{n.notion}</p>
        <p>{n.consigne}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-w-0 rounded-lg border bg-card p-2">
          <div className="flex items-center justify-between px-2 text-sm">
            <span>
              Paquets : <strong>{monde.ramasses}</strong> / {monde.total}
            </span>
            {n.cartes.length > 1 && (
              <span className="flex items-center gap-1">
                Plan
                {n.cartes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => remettre(niveau, i)}
                    aria-pressed={i === carte}
                    className={`size-6 rounded font-mono text-xs ${i === carte ? "bg-primary text-primary-foreground" : "bg-card"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </span>
            )}
          </div>
          <SceneRobot key={`${niveau}-${carte}`} monde={monde} erreur={message?.type === "erreur" && ligne !== null} vitesse={VITESSES[vitesse]} />
        </div>

        <div className="min-w-0">
          <div className="rounded-lg border bg-black text-cem-gris-1">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 font-mono text-xs text-cem-gris-2">
              octet.py
              <span className={n.maxLignes && nbLignes > n.maxLignes ? "text-cem-orange" : ""}>
                {nbLignes}
                {n.maxLignes ? ` / ${n.maxLignes}` : ""} lignes
              </span>
            </div>
            <EditeurPython code={code} ecrire={ecrire} commandes={commandes} ligne={ligne} erreur={message?.type === "erreur"} executer={executerTout} zone={zone} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {n.commandes.map((c) => (
              <button key={c} onClick={() => inserer(c)} title={AIDE[c]} className="rounded border bg-card px-1.5 py-0.5 font-mono text-xs hover:border-primary hover:text-primary">
                {c}()
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={executerTout}>{enCours ? <Square className="size-4" /> : <Play className="size-4" />} {enCours ? "Pause" : "Exécuter"}</Button>
            <Button variant="outline" onClick={unPas}>
              <StepForward className="size-4" /> Un pas
            </Button>
            <Button variant="outline" onClick={() => remettre(niveau, 0)}>
              <RotateCcw className="size-4" /> Replacer
            </Button>
            <select value={vitesse} onChange={(e) => setVitesse(e.target.value as NomVitesse)} className="h-8 rounded-md border bg-background px-2 text-sm" aria-label="Vitesse">
              {Object.keys(VITESSES).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 space-y-2" aria-live="polite">
            {message && (
              <div className={`flex items-start gap-2 rounded-md border p-3 text-sm ${message.type === "succes" ? "border-primary bg-accent" : "border-cem-rouge bg-card"}`}>
                {message.type === "succes" ? <Trophy className="size-5 shrink-0 text-primary" /> : <CircleAlert className="size-5 shrink-0 text-destructive" />}
                <div>
                  <p>{message.texte}</p>
                  {message.type === "succes" && (dernier ? <p className="font-semibold">Tu raisonnes comme un programmeur !</p> : <Button size="sm" className="mt-2" onClick={() => choisir(niveau + 1)}>Niveau suivant</Button>)}
                </div>
              </div>
            )}
            <button onClick={() => setIndice(!indice)} className="flex items-center gap-1 text-sm text-primary underline">
              <Lightbulb className="size-4" /> {indice ? "Cacher l'indice" : "Un indice ?"}
            </button>
            {indice && <p className="rounded-md bg-secondary p-3 text-sm">{n.indice}</p>}
            <button onClick={() => ecrire(n.depart)} className="block text-xs text-muted-foreground underline">
              Revenir au programme de départ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
