"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAnimationsReduites } from "@/app/_hooks/use-animations-reduites";
import { ajouterEntree, ajouterTouche, CODE_CLAVIER, CODE_TACTILE, codeComplet, geste, lirePhosphore, PHOSPHORES, phosphoreSuivant, type Entree, type Phosphore } from "@/lib/retro";

// Easter egg : le code Konami donne au site l'allure d'un terminal des années 80 (voir lib/retro.ts).
// Ce composant, toujours présent, écoute le code et pose la classe .retro sur <html> ; tout l'habillage est
// dans la fin de globals.css. L'écran de démarrage et la barre d'état ne se chargent qu'à la première activation.
const EcranRetro = dynamic(() => import("@/components/retro/ecran-retro").then((m) => m.EcranRetro), { ssr: false });

export type Phase = "eteint" | "demarrage" | "allume" | "extinction" | "fondu";

// Mêmes durées que les animations .retro-demarrage, .retro-extinction et .retro-fondu de globals.css
const DUREES = { demarrage: 3400, extinction: 550, fondu: 300 };

// Le mode dure le temps de l'onglet (sessionStorage) : il survit au rechargement, pas à la visite suivante.
// Doit rester identique à la clé du script dans layout.tsx, qui pose la classe avant l'affichage.
const CLE = "retro-depinfo";

// Couleur de chaque phosphore en RVB de 0 à 1 : les mêmes que --p dans globals.css.
const COULEURS: Record<Phosphore, [number, number, number]> = { vert: [0.2, 1, 0.4], ambre: [1, 0.69, 0], blanc: [0.875, 0.914, 1] };

// Champs où les flèches et les lettres servent à écrire (recherche, éditeur Python du jeu d'Octet...)
const SAISIE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

function appliquer(allume: boolean, phosphore: Phosphore) {
  const html = document.documentElement;
  html.classList.toggle("retro", allume);
  if (allume) html.dataset.phosphore = phosphore;
  else delete html.dataset.phosphore;
  try {
    if (allume) sessionStorage.setItem(CLE, phosphore);
    else sessionStorage.removeItem(CLE);
  } catch {}
  // Barre du navigateur sur téléphone : noire comme l'écran, puis du bleu de l'en-tête au retour
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.dataset.normale ??= meta.content;
    meta.content = allume ? "#000000" : meta.dataset.normale;
  }
}

// Le bip du haut-parleur du PC à la fin du démarrage : une onde carrée, brève et pas trop forte.
function bip(audio: AudioContext | null) {
  if (!audio) return;
  void audio.resume();
  const onde = audio.createOscillator();
  const volume = audio.createGain();
  onde.type = "square";
  onde.frequency.value = 988;
  volume.gain.value = 0.03;
  onde.connect(volume).connect(audio.destination);
  onde.start();
  onde.stop(audio.currentTime + 0.12);
}

// Un indice pour qui ouvre les outils de développement (une seule fois par chargement).
let indiceDonne = false;
function indice() {
  if (indiceDonne) return;
  indiceDonne = true;
  console.log(
    "%cTu lis la console ? Tu es au bon département.\nEssaie ↑ ↑ ↓ ↓ ← → ← → B A sur le site.",
    "font-family: monospace; font-size: 13px; line-height: 1.6; color: #33ff66; background: #000; padding: 6px 10px; text-shadow: 0 0 4px #33ff66;",
  );
}

// Images en une seule couleur : gris, ramené à 6 niveaux (comme un vieil affichage), puis teinté du phosphore.
// Dans le HTML de chaque page, pour que les images soient teintées dès l'affichage quand on recharge en mode rétro.
function Filtres() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      {PHOSPHORES.map((p) => {
        const [r, v, b] = COULEURS[p];
        return (
          <filter key={p} id={`retro-${p}`} colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0 .2 .4 .6 .8 1" />
              <feFuncG type="discrete" tableValues="0 .2 .4 .6 .8 1" />
              <feFuncB type="discrete" tableValues="0 .2 .4 .6 .8 1" />
            </feComponentTransfer>
            <feColorMatrix type="matrix" values={`${r} 0 0 0 0  0 ${v} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`} />
          </filter>
        );
      })}
    </svg>
  );
}

export function ModeRetro() {
  const [phase, setPhase] = useState<Phase>("eteint");
  const [phosphore, setPhosphore] = useState<Phosphore>("vert");
  const [annonce, setAnnonce] = useState("");
  const animationsReduites = useAnimationsReduites();
  const minuterie = useRef<ReturnType<typeof setTimeout>>(undefined);
  const audio = useRef<AudioContext | null>(null);
  const clavier = useRef<readonly Entree[]>([]);
  const tactile = useRef<readonly Entree[]>([]);

  function plusTard(ms: number, action: () => void) {
    clearTimeout(minuterie.current);
    minuterie.current = setTimeout(action, ms);
  }

  function activer() {
    // Créé pendant la touche ou le toucher : les navigateurs bloquent le son qui ne suit pas un geste.
    try {
      audio.current ??= new AudioContext();
    } catch {}
    appliquer(true, phosphore);
    setAnnonce("Mode rétro activé. Échap, F10 ou le même code pour en sortir.");
    if (animationsReduites) {
      setPhase("allume");
      bip(audio.current);
    } else {
      setPhase("demarrage");
      plusTard(DUREES.demarrage, demarre);
    }
  }

  // Fin du démarrage, ou on a appuyé sur une touche pour le passer
  function demarre() {
    clearTimeout(minuterie.current);
    setPhase("allume");
    bip(audio.current);
  }

  function quitter() {
    setAnnonce("Mode rétro désactivé.");
    if (animationsReduites) {
      appliquer(false, phosphore);
      setPhase("eteint");
      return;
    }
    // L'image se replie en une ligne puis en un point, comme un vieil écran qu'on éteint, et le site revient en fondu.
    setPhase("extinction");
    plusTard(DUREES.extinction, () => {
      appliquer(false, phosphore);
      setPhase("fondu");
      plusTard(DUREES.fondu, () => setPhase("eteint"));
    });
  }

  function changerPhosphore() {
    const p = phosphoreSuivant(phosphore);
    setPhosphore(p);
    appliquer(true, p);
  }

  function basculer() {
    if (phase === "eteint") activer();
    else if (phase === "allume") quitter();
  }

  // Au chargement : le script de layout.tsx a déjà posé la classe si le mode était actif dans cet onglet.
  useEffect(() => {
    const id = setTimeout(() => {
      let p: Phosphore | null = null;
      try {
        p = lirePhosphore(sessionStorage.getItem(CLE));
      } catch {}
      if (p) {
        setPhosphore(p);
        setPhase("allume");
      }
      appliquer(Boolean(p), p ?? "vert");
    }, 0);
    indice();
    return () => clearTimeout(id);
  }, []);

  const surTouche = useEffectEvent((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const cible = e.target instanceof Element ? e.target : null;
    // Le code compte même si la touche a déjà servi : dans la salle 3D, les flèches font aussi marcher.
    if (!cible?.closest(SAISIE)) {
      clavier.current = ajouterTouche(clavier.current, e.key);
      if (codeComplet(clavier.current, CODE_CLAVIER)) {
        clavier.current = [];
        basculer();
        return;
      }
    }
    if (e.defaultPrevented || phase !== "allume") return;
    if (e.key === "F2") {
      e.preventDefault();
      changerPhosphore();
      return;
    }
    // Échap ferme d'abord une fenêtre ou un menu ouvert, et sert aux jeux ; il quitte le mode seulement sinon.
    if (e.key === "F10" || (e.key === "Escape" && !cible?.closest(`${SAISIE}, [role="dialog"], [role="menu"], [role="listbox"], [role="application"]`))) {
      e.preventDefault();
      quitter();
    }
  });

  const surGeste = useEffectEvent((g: Entree | null) => {
    tactile.current = ajouterEntree(tactile.current, g, CODE_TACTILE);
    if (codeComplet(tactile.current, CODE_TACTILE)) {
      tactile.current = [];
      basculer();
    }
  });

  useEffect(() => {
    const touche = (e: KeyboardEvent) => surTouche(e);
    let depart: { x: number; y: number; t: number } | null = null;
    const debut = (e: TouchEvent) => {
      const t = e.touches[0];
      depart = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, t: e.timeStamp } : null;
    };
    const fin = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (depart && t) surGeste(geste(t.clientX - depart.x, t.clientY - depart.y, e.timeStamp - depart.t));
      depart = null;
    };
    const annule = () => (depart = null);
    addEventListener("keydown", touche);
    addEventListener("touchstart", debut, { passive: true });
    addEventListener("touchend", fin, { passive: true });
    addEventListener("touchcancel", annule, { passive: true });
    return () => {
      removeEventListener("keydown", touche);
      removeEventListener("touchstart", debut);
      removeEventListener("touchend", fin);
      removeEventListener("touchcancel", annule);
    };
  }, []);

  return (
    <>
      <Filtres />
      <p className="sr-only" aria-live="polite">
        {annonce}
      </p>
      {/* Écran noir tout de suite, le temps que l'écran de démarrage se charge la première fois */}
      {phase === "demarrage" && <div className="retro-noir" aria-hidden />}
      {phase !== "eteint" && <EcranRetro phase={phase} phosphore={phosphore} passer={demarre} changerPhosphore={changerPhosphore} quitter={quitter} />}
    </>
  );
}
