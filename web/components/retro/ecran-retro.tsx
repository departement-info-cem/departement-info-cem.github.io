"use client";
import { useEffect, useEffectEvent, useState, type ButtonHTMLAttributes, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { chemin } from "@/lib/chemins";
import { cheminDos, type Phosphore } from "@/lib/retro";
import type { Phase } from "@/components/retro/mode-retro";

// Ce qui s'ajoute au site en mode rétro (voir mode-retro.tsx) : l'écran de démarrage, la barre d'état
// à la Norton Commander, le balayage de l'écran à chaque page, l'extinction, et la salle 3D où l'on se promène
// quand on se lève de sa chaise. Chargé à la première activation ; la salle, la première fois qu'on se lève.

const Salle3D = dynamic(() => import("@/components/retro/salle-3d").then((m) => m.Salle3D), { ssr: false });

type Props = { phase: Phase; phosphore: Phosphore; passer: () => void; changerPhosphore: () => void; quitter: () => void };

export function EcranRetro({ phase, phosphore, passer, changerPhosphore, quitter }: Props) {
  return (
    <>
      {phase === "demarrage" && <Demarrage passer={passer} />}
      {(phase === "allume" || phase === "extinction") && <BarreEtat phosphore={phosphore} changerPhosphore={changerPhosphore} quitter={quitter} />}
      {phase === "allume" && <Balayage />}
      {phase === "allume" && <Salle />}
      {phase === "extinction" && <div className="retro-extinction" aria-hidden />}
      {phase === "fondu" && <div className="retro-fondu" aria-hidden />}
    </>
  );
}

// --delai : moment où la ligne s'affiche (.terminal-affiche) ; --n : nombre de caractères tapés (.retro-tape).
const moment = (ms: number, n?: number) => ({ "--delai": `${ms}ms`, "--n": n }) as CSSProperties;

// Les vérifications du BIOS, alignées avec des points comme sur un vrai écran de démarrage.
const VERIFICATIONS = [
  ["Coprocesseur 8087", "absent"],
  ["Lecteur de disquette A:", "OK"],
  ["Disque dur C: 20 Mo", "OK"],
  ["Points-virgules", "tous là"],
  ["Café, salle des profs", "froid"],
];
const ligne = (libelle: string, valeur: string) => `${`${libelle} `.padEnd(27, ".")} ${valeur}`;

// Les moments (en ms) se suivent sur à peu près trois secondes, un peu moins que DUREES.demarrage dans mode-retro.tsx.
function Demarrage({ passer }: { passer: () => void }) {
  // N'importe quelle touche, un clic ou un toucher passe le démarrage. pointerdown plutôt que click :
  // le clic qui suit le dernier toucher du code arrive après l'affichage et passerait tout de suite.
  const passerMaintenant = useEffectEvent(() => passer());
  useEffect(() => {
    const f = () => passerMaintenant();
    addEventListener("keydown", f);
    addEventListener("pointerdown", f);
    return () => {
      removeEventListener("keydown", f);
      removeEventListener("pointerdown", f);
    };
  }, []);

  return (
    <div className="retro-demarrage" aria-hidden>
      <div className="retro-tube">
        {/* Le logo du « fabricant », en haut à droite comme sur les vrais BIOS ; pas la place sur un téléphone */}
        <Image src={chemin("/images/logo.svg")} alt="" width={88} height={75} unoptimized className="terminal-affiche absolute right-[2ch] top-[1lh] hidden w-22 sm:block" style={moment(400)} />
        <p className="terminal-affiche" style={moment(400)}>CEM-BIOS v1.985</p>
        <p className="terminal-affiche" style={moment(400)}>(C) 1985 Cégep Édouard-Montpetit</p>
        <p className="terminal-affiche mt-[1lh]" style={moment(520)}>Processeur Intel 8088 à 4,77 MHz</p>
        <p className="terminal-affiche mb-[1lh]" style={moment(640)}>
          Mémoire vive : <span className="retro-memoire" style={moment(640)} /> Ko{" "}
          <span className="terminal-affiche" style={moment(1140)}>
            OK
          </span>
        </p>
        {VERIFICATIONS.map(([libelle, valeur], i) => (
          <p key={libelle} className="terminal-affiche" style={moment(1240 + i * 120)}>
            {ligne(libelle, valeur)}
          </p>
        ))}
        <p className="terminal-affiche mt-[1lh]" style={moment(1900)}>
          C:\&gt; <span className="retro-tape" style={moment(1950, 10)}>cd DEPINFO</span>
        </p>
        <p className="terminal-affiche" style={moment(2400)}>
          C:\DEPINFO&gt; <span className="retro-tape" style={moment(2450, 11)}>depinfo.exe</span>
          <span className="retro-curseur terminal-curseur" style={moment(2450)} />
        </p>
        <p className="terminal-affiche absolute inset-x-0 bottom-[1lh] text-center text-(--p-3)" style={moment(900)}>
          Appuie sur une touche pour passer
        </p>
      </div>
    </div>
  );
}

const NOMS: Record<Phosphore, string> = { vert: "Vert", ambre: "Ambre", blanc: "Blanc" };

// En bas de l'écran, comme les touches de fonction de Norton Commander : le numéro, puis l'action en vidéo inverse.
function BarreEtat({ phosphore, changerPhosphore, quitter }: Omit<Props, "phase" | "passer">) {
  const page = usePathname();
  const maintenant = useMaintenant(10_000);
  const deux = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="retro-barre no-print" role="group" aria-label="Mode rétro">
      <Touche numero="F2" libelle={NOMS[phosphore]} onClick={changerPhosphore} title="Changer la couleur de l'écran (F2)" aria-label={`Couleur de l'écran : ${NOMS[phosphore].toLowerCase()}. Changer`} />
      <Touche numero="F10" libelle="Quitter" onClick={quitter} title="Quitter le mode rétro (F10 ou Échap)" aria-label="Quitter le mode rétro" />
      <span className="ml-auto min-w-0 truncate text-(--p-2)">{cheminDos(page)}&gt;</span>
      <span className="shrink-0" aria-hidden>
        {maintenant ? deux(maintenant.getHours()) : "--"}
        <span className="retro-clignote">:</span>
        {maintenant ? deux(maintenant.getMinutes()) : "--"}
      </span>
    </div>
  );
}

function Touche({ numero, libelle, ...props }: { numero: string; libelle: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="group flex h-full shrink-0 items-center" {...props}>
      <span className="px-[0.5ch]">{numero}</span>
      <span className="bg-(--p) px-[1ch] text-(--k) group-hover:bg-(--p-2)">{libelle}</span>
    </button>
  );
}

// À chaque changement de page, l'écran se redessine de haut en bas, ligne par ligne, comme sur un terminal lent.
// Le rideau est ajouté dans le même rendu que la nouvelle page : elle n'apparaît jamais avant lui.
function Balayage() {
  const page = usePathname();
  const [precedente, setPrecedente] = useState(page);
  const [n, setN] = useState(0);
  if (page !== precedente) {
    setPrecedente(page);
    setN(n + 1);
  }
  return n > 0 ? <div key={n} className="retro-balayage" aria-hidden /> : null;
}

// Les touches qui font se lever de sa chaise : celles pour marcher dans la salle. Pas dans un champ, ni dans un menu,
// une liste ou un jeu qui se sert déjà des flèches ; et Espace garde son rôle sur un bouton ou un lien.
const TOUCHES_SALLE = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "Space"]);
const PAS_ICI =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="menu"], [role="menubar"], [role="listbox"], [role="tablist"], [role="radiogroup"], [role="slider"], [role="spinbutton"], [role="combobox"], [role="grid"], [role="tree"], [role="dialog"], [role="application"]';
const PAS_ESPACE = 'button, a[href], summary, [role="button"], [role="checkbox"], [role="switch"]';

function Salle() {
  const [debout, setDebout] = useState(false);
  const router = useRouter();
  const page = usePathname();
  // Changement de page (bouton Précédent...) : la copie de la page dans l'écran virtuel serait périmée
  const [pageDepart, setPageDepart] = useState(page);
  if (page !== pageDepart) {
    setPageDepart(page);
    setDebout(false);
  }

  const surTouche = useEffectEvent((e: KeyboardEvent) => {
    if (debout || e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey || !TOUCHES_SALLE.has(e.code)) return;
    const cible = e.target instanceof Element ? e.target : null;
    if (cible?.closest(PAS_ICI) || (e.code === "Space" && cible?.closest(PAS_ESPACE)) || document.querySelector('[role="dialog"]')) return;
    e.preventDefault();
    setDebout(true);
  });
  useEffect(() => {
    const f = (e: KeyboardEvent) => surTouche(e);
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, []);

  if (!debout) return null;
  return (
    <Salle3D
      rassis={() => setDebout(false)}
      aller={(href) => {
        setDebout(false);
        router.push(href);
      }}
    />
  );
}
