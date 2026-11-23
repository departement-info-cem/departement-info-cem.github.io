"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CircleHelp, FileText, GraduationCap, Search, User } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { simplifier } from "@/lib/texte";

export type ElementRecherche = {
  type: "prof" | "cours" | "faq" | "page" | "programme";
  titre: string;
  sousTitre?: string;
  href: string;
  /** texte supplémentaire sur lequel on cherche, sans l'afficher */
  motsCles?: string;
};

const ICONES = { prof: User, cours: BookOpen, faq: CircleHelp, page: FileText, programme: GraduationCap };

export function RechercheGlobale({ index }: { index: ElementRecherche[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [selection, setSelection] = useState(0);
  const router = useRouter();

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
      <button
        onClick={() => setOuvert(true)}
        className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-white/10 md:w-36 md:border md:border-white/25 md:bg-white/10 md:px-3 md:py-1.5 xl:w-auto 2xl:w-56"
        aria-label="Rechercher"
      >
        <Search className="size-5 md:size-4" />
        <span className="hidden text-white/80 md:inline xl:hidden 2xl:inline">Rechercher</span>
        <kbd className="ml-auto hidden whitespace-nowrap rounded bg-white/15 px-1.5 text-xs xl:inline">Ctrl K</kbd>
      </button>
      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="top-[15%] translate-y-0 gap-2 p-3 sm:max-w-xl">
          <DialogTitle className="sr-only">Rechercher sur le site</DialogTitle>
          <Input
            autoFocus
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
            className="h-11 text-base"
          />
          <ul className="max-h-[60vh] overflow-y-auto" role="listbox">
            {texte && resultats.length === 0 && <li className="p-3 text-sm text-muted-foreground">Aucun résultat pour « {texte} ».</li>}
            {resultats.map((r, i) => {
              const Icone = ICONES[r.type];
              return (
                <li key={`${r.type}-${r.href}-${r.titre}`} role="option" aria-selected={i === selection}>
                  <button
                    onClick={() => aller(r.href)}
                    onMouseEnter={() => setSelection(i)}
                    className={`flex w-full items-start gap-3 rounded-md p-2 text-left ${i === selection ? "bg-accent" : ""}`}
                  >
                    <Icone className="mt-0.5 size-4 shrink-0 text-primary" />
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
