"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CircleHelp, FileText, GraduationCap, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AvatarProf } from "@/components/carte-prof";
import { simplifier } from "@/lib/texte";

export type ElementRecherche = {
  type: "prof" | "cours" | "faq" | "page" | "programme";
  titre: string;
  sousTitre?: string;
  href: string;
  /** texte supplémentaire sur lequel on cherche, sans l'afficher */
  motsCles?: string;
  /** photo du prof (fichier de data/photos) ; sans photo, on montre ses initiales */
  photo?: string;
};

const ICONES = { prof: User, cours: BookOpen, faq: CircleHelp, page: FileText, programme: GraduationCap };

// Sur Mac (et iPad), le raccourci s'écrit ⌘ K. Le serveur ne connaît pas l'appareil : il suppose Ctrl.
function useMac() {
  return useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false,
  );
}

// Le bouton prend le style que lui donne l'en-tête (className).
export function RechercheGlobale({ index, className }: { index: ElementRecherche[]; className?: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [selection, setSelection] = useState(0);
  const router = useRouter();
  const mac = useMac();

  // Raccourci clavier Ctrl+K (ou Cmd+K sur Mac)
  useEffect(() => {
    function surTouche(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOuvert((o) => !o);
      }
    }
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, []);

  const resultats = useMemo(() => {
    const mots = simplifier(texte).split(/\s+/).filter(Boolean);
    if (!mots.length) return [];
    return index
      .filter((e) => {
        const cible = simplifier(`${e.titre} ${e.sousTitre ?? ""} ${e.motsCles ?? ""}`);
        return mots.every((m) => cible.includes(m));
      })
      .slice(0, 12);
  }, [texte, index]);

  function aller(href: string) {
    setOuvert(false);
    setTexte("");
    if (href.startsWith("http")) window.open(href, "_blank");
    else router.push(href);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger onClick={() => setOuvert(true)} className={className} aria-label="Rechercher" aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}>
          <Search className="size-5" />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="gap-0.5 px-1.5">
          <kbd data-slot="kbd" className="bg-muted px-1 font-mono">{mac ? "⌘" : "Ctrl"}</kbd>
          <kbd data-slot="kbd" className="bg-muted px-1 font-mono">K</kbd>
        </TooltipContent>
      </Tooltip>
      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent showCloseButton={false} className="top-[15%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Rechercher sur le site</DialogTitle>
          {/* Loupe, champ et × sur une même rangée, séparée des résultats par un trait */}
          <div className="flex items-center gap-3 px-4">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              aria-label="Rechercher sur le site"
              placeholder="Un prof, un cours, une question..."
              value={texte}
              onChange={(e) => {
                setTexte(e.target.value);
                setSelection(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setSelection((s) => Math.min(s + 1, resultats.length - 1));
                if (e.key === "ArrowUp") setSelection((s) => Math.max(s - 1, 0));
                if (e.key === "Enter" && resultats[selection]) aller(resultats[selection].href);
              }}
              className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <DialogClose
              render={<Button variant="ghost" size="icon-sm" className="-mr-1 text-muted-foreground" />}
              aria-label="Fermer"
              title="Fermer (Échap)"
            >
              <X className="size-5" />
            </DialogClose>
          </div>
          <ul className={`max-h-[60vh] overflow-y-auto p-2 ${texte ? "border-t" : "hidden"}`} role="listbox">
            {texte && resultats.length === 0 && <li className="px-2 py-3 text-sm text-muted-foreground">Aucun résultat pour « {texte} ».</li>}
            {resultats.map((r, i) => {
              const Icone = ICONES[r.type];
              return (
                <li key={`${r.type}-${r.href}-${r.titre}`} role="option" aria-selected={i === selection}>
                  <button
                    onClick={() => aller(r.href)}
                    onMouseEnter={() => setSelection(i)}
                    className={`flex w-full gap-3 rounded-md p-2 text-left ${r.type === "prof" ? "items-center" : "items-start"} ${i === selection ? "bg-accent" : ""}`}
                  >
                    {r.type === "prof" ? (
                      <span className="shrink-0">
                        <AvatarProf prof={{ nom: r.titre, photo: r.photo }} taille={32} />
                      </span>
                    ) : (
                      <Icone className="mt-0.5 size-4 shrink-0 text-primary" />
                    )}
                    <span>
                      <span className="block text-sm font-medium">{r.titre}</span>
                      {r.sousTitre && <span className="block text-xs text-muted-foreground">{r.sousTitre}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
