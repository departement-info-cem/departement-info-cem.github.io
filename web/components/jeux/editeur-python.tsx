"use client";
import { useId, useRef, useState, type RefObject } from "react";
import { AIDE_PYTHON, colorier, nomsDefinis, suggerer, type Jeton, type Suggestion } from "@/lib/jeux/mini-python";

// Éditeur de code léger : un textarea au texte transparent posé sur le même code, coloré, et des suggestions
// sous le curseur. Les deux couches doivent garder la même police, la même hauteur de ligne et les mêmes marges.

const COULEURS: Partial<Record<Jeton["type"] | Suggestion["type"], string>> = {
  mot: "text-cem-orange",
  constante: "text-cem-jaune",
  nombre: "text-cem-jaune",
  texte: "text-cem-vert",
  commentaire: "text-cem-gris-3",
  action: "text-cem-ciel",
  capteur: "text-cem-ciel",
  fonction: "text-cem-vert-pomme",
};
const INCONNUE = "underline decoration-cem-rouge decoration-wavy underline-offset-4";
const ETIQUETTES: Record<Suggestion["type"], string> = { action: "action", capteur: "capteur", fonction: "fonction", mot: "mot-clé", variable: "variable" };
// Mots toujours suivis d'autre chose : la suggestion ajoute l'espace
const SUIVIS = new Set(["if", "elif", "while", "for", "in", "not", "and", "or", "def", "return"]);
const LIGNE = 24; // px, comme leading-6
const MARGE = 8; // px, comme py-2
const NOM = /[A-Za-z_À-ÿ][\wÀ-ÿ]*$/;

type Ouvert = { debut: number; fin: number; liste: Suggestion[]; choix: number; ligne: number; colonne: number; haut: number; gauche: number };

export function EditeurPython({
  code,
  ecrire,
  commandes,
  ligne,
  erreur,
  executer,
  zone,
}: {
  code: string;
  ecrire: (code: string) => void;
  /** Les commandes d'Octet permises à ce niveau. */
  commandes: Suggestion[];
  /** La ligne en cours d'exécution, ou celle de l'erreur. */
  ligne: number | null;
  erreur: boolean;
  executer: () => void;
  zone: RefObject<HTMLTextAreaElement | null>;
}) {
  const [ouvert, setOuvert] = useState<Ouvert | null>(null);
  const couleurs = useRef<HTMLDivElement>(null);
  const numeros = useRef<HTMLDivElement>(null);
  const id = useId();
  const { fonctions } = nomsDefinis(code);
  const estCommande = new Set(commandes.map((c) => c.nom));

  function classe(j: Jeton) {
    if (j.type === "fonction") return estCommande.has(j.texte) ? COULEURS.action : j.texte === "range" || fonctions.has(j.texte) ? COULEURS.fonction : INCONNUE;
    if (j.type === "nom") return estCommande.has(j.texte) ? COULEURS.action : undefined;
    return COULEURS[j.type];
  }

  function candidats(texte: string): Suggestion[] {
    const { fonctions, variables } = nomsDefinis(texte);
    return [
      ...commandes,
      ...[...fonctions].filter(([nom]) => !estCommande.has(nom)).map(([nom, n]): Suggestion => ({ nom, type: "fonction", aide: "ta fonction", arguments: n > 0 })),
      ...Object.entries(AIDE_PYTHON).map(([nom, aide]): Suggestion => (nom === "range" ? { nom, type: "fonction", aide, arguments: true } : { nom, type: "mot", aide })),
      ...[...variables].filter((v) => !estCommande.has(v) && !fonctions.has(v)).map((nom): Suggestion => ({ nom, type: "variable" })),
    ];
  }

  /** Ouvre (ou met à jour) la liste pour le mot juste avant le curseur. */
  function suggerez(texte: string, pos: number, force: boolean) {
    const z = zone.current;
    const avant = texte.slice(0, pos);
    const debutLigne = avant.lastIndexOf("\n") + 1;
    const dansLigne = avant.slice(debutLigne);
    const prefixe = NOM.exec(dansLigne)?.[0] ?? "";
    const avantMot = dansLigne.slice(0, dansLigne.length - prefixe.length);
    // Ce qui convient à l'endroit passe en premier : range après « in », les capteurs dans une condition
    const rang = (s: Suggestion) =>
      /\bin\s+$/.test(avantMot) ? Number(s.nom !== "range") : /^\s*(if|elif|while)\s/.test(avantMot) ? Number(s.type !== "capteur") : 0;
    // Rien à proposer dans un commentaire ou une chaîne de caractères
    const horsCode = /[#"']/.test(dansLigne.replace(/"[^"]*"|'[^']*'/g, ""));
    const liste = z && !horsCode && (prefixe || force) ? suggerer(prefixe, candidats(texte).sort((a, b) => rang(a) - rang(b))) : [];
    if (!z || !liste.length) return setOuvert(null);
    const debut = pos - prefixe.length;
    setOuvert({
      debut,
      fin: pos + /^[\wÀ-ÿ]*/.exec(texte.slice(pos))![0].length,
      liste,
      choix: 0,
      ligne: avant.split("\n").length - 1,
      colonne: debut - debutLigne,
      haut: z.scrollTop,
      gauche: z.scrollLeft,
    });
  }

  function placer(texte: string, pos: number) {
    ecrire(texte);
    requestAnimationFrame(() => {
      zone.current?.focus();
      zone.current?.setSelectionRange(pos, pos);
    });
  }

  function accepter(s: Suggestion) {
    if (!ouvert) return;
    const apres = code.slice(ouvert.fin);
    const appel = s.type !== "mot" && s.type !== "variable" && !apres.startsWith("(");
    const ajout = s.nom + (appel ? "()" : SUIVIS.has(s.nom) && !apres.startsWith(" ") ? " " : "");
    setOuvert(null);
    // Curseur entre les parenthèses s'il faut y mettre quelque chose, comme range(3)
    placer(code.slice(0, ouvert.debut) + ajout + apres, ouvert.debut + ajout.length - (appel && s.arguments ? 1 : 0));
  }

  function surTouche(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const z = e.currentTarget;
    const { selectionStart: a, selectionEnd: b } = z;
    if (ouvert) {
      const n = ouvert.liste.length;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        return setOuvert({ ...ouvert, choix: (ouvert.choix + (e.key === "ArrowDown" ? 1 : n - 1)) % n });
      }
      if ((e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.shiftKey) || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        return accepter(ouvert.liste[ouvert.choix]);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        return setOuvert(null);
      }
      if (["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(e.key)) setOuvert(null);
    }
    if (e.key === " " && e.ctrlKey) {
      e.preventDefault();
      suggerez(code, a, true);
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      executer();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const l = code.slice(code.lastIndexOf("\n", a - 1) + 1, a);
      const indent = /^ */.exec(l)![0] + (l.trimEnd().endsWith(":") ? "    " : "");
      placer(`${code.slice(0, a)}\n${indent}${code.slice(b)}`, a + 1 + indent.length);
    } else if (e.key === "Backspace" && a === b) {
      const l = code.slice(code.lastIndexOf("\n", a - 1) + 1, a);
      if (l.length >= 4 && /^ +$/.test(l) && l.length % 4 === 0) {
        e.preventDefault();
        placer(code.slice(0, a - 4) + code.slice(a), a - 4);
      }
    } else if (e.key === "Escape") {
      z.blur(); // pour pouvoir quitter l'éditeur au clavier, Tab servant à décaler
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      placer(`${code.slice(0, a)}    ${code.slice(b)}`, a + 4);
    }
  }

  function surSaisie(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { value, selectionStart } = e.target;
    ecrire(value);
    const { inputType, data } = e.nativeEvent as InputEvent;
    // S'ouvre quand on tape une lettre ; suit les effacements une fois ouverte ; se ferme sinon (collage, espace…)
    if ((inputType?.startsWith("insert") && /[\wÀ-ÿ]$/.test(data ?? "")) || (ouvert && inputType?.startsWith("delete"))) suggerez(value, selectionStart, false);
    else setOuvert(null);
  }

  function defiler(e: React.UIEvent<HTMLTextAreaElement>) {
    const { scrollTop: haut, scrollLeft: gauche } = e.currentTarget;
    // Directement dans le DOM : pas besoin de refaire le rendu à chaque pixel de défilement
    if (couleurs.current) couleurs.current.style.transform = `translate(${-gauche}px, ${-haut}px)`;
    if (numeros.current) numeros.current.style.transform = `translateY(${-haut}px)`;
    if (ouvert) setOuvert({ ...ouvert, haut, gauche });
  }

  const choisie = ouvert?.liste[ouvert.choix];
  return (
    <div className="relative">
      <div className="flex h-64 overflow-hidden rounded-b-lg font-mono text-sm leading-6 [tab-size:4]">
        <div className="w-9 shrink-0 select-none overflow-hidden py-2 pr-2 text-right text-cem-gris-3" aria-hidden>
          <div ref={numeros}>
            {code.split("\n").map((_, i) => (
              <div key={i} className={ligne === i + 1 ? (erreur ? "bg-cem-rouge text-white" : "bg-cem-vert text-cem-marine") : ""}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div ref={couleurs} className="w-max min-w-full whitespace-pre py-2 pr-2">
              {code.split("\n").map((l, i) => (
                <div key={i} className={`h-6 ${ligne === i + 1 ? (erreur ? "bg-cem-rouge/25" : "bg-white/10") : ""}`}>
                  {colorier(l).map((j, k) => (
                    <span key={k} className={classe(j)}>
                      {j.texte}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <textarea
            ref={zone}
            value={code}
            onChange={surSaisie}
            onKeyDown={surTouche}
            onScroll={defiler}
            onBlur={() => setOuvert(null)}
            onMouseDown={() => setOuvert(null)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            wrap="off"
            className="absolute inset-0 size-full resize-none overflow-auto whitespace-pre bg-transparent py-2 pr-2 text-transparent caret-white outline-none selection:bg-cem-ciel/35 selection:text-transparent"
            aria-label="Programme Python (Ctrl+Espace pour les suggestions, Échap pour quitter l'éditeur, Ctrl+Entrée pour exécuter)"
            aria-autocomplete="list"
            aria-controls={ouvert ? id : undefined}
            aria-activedescendant={ouvert ? `${id}-${ouvert.choix}` : undefined}
          />
        </div>
      </div>

      {ouvert && choisie && (
        <div
          className="absolute z-20 w-64 overflow-hidden rounded-md border border-white/15 bg-cem-marine-fonce font-mono text-sm text-cem-gris-1 shadow-lg"
          // ch : la largeur d'un caractère de la police à chasse fixe, la même que celle du code
          style={{ top: MARGE + (ouvert.ligne + 1) * LIGNE - ouvert.haut, left: `max(0px, min(calc(2.25rem + ${ouvert.colonne}ch - ${ouvert.gauche}px), calc(100% - 16rem)))` }}
        >
          <ul id={id} role="listbox" aria-label="Suggestions" className="max-h-36 overflow-y-auto py-1">
            {ouvert.liste.map((s, i) => (
              <li
                key={s.nom}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === ouvert.choix}
                ref={i === ouvert.choix ? (li) => li?.scrollIntoView({ block: "nearest" }) : undefined}
                onMouseDown={(e) => {
                  e.preventDefault(); // garde le curseur dans l'éditeur
                  accepter(s);
                }}
                className={`flex cursor-pointer items-baseline justify-between gap-3 px-2 leading-6 ${i === ouvert.choix ? "bg-cem-ciel/25" : "hover:bg-white/10"}`}
              >
                <span className="truncate">
                  <span className={COULEURS[s.type]}>{s.nom}</span>
                  {s.type === "mot" || s.type === "variable" ? "" : "()"}
                </span>
                <span className="shrink-0 font-sans text-xs text-cem-gris-3">{ETIQUETTES[s.type]}</span>
              </li>
            ))}
          </ul>
          {choisie.aide && <p className="border-t border-white/10 px-2 py-1.5 font-sans text-xs leading-snug text-cem-gris-2">{choisie.aide}</p>}
        </div>
      )}
    </div>
  );
}
