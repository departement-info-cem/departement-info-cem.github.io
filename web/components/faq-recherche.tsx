"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Question } from "@/app/_types/divers";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useTwoWayBinding } from "@/app/_hooks/use-two-way-binding";
import { simplifier } from "@/lib/texte";

export function FaqRecherche({ questions }: { questions: Question[] }) {
  const params = useSearchParams();
  const recherche = useTwoWayBinding("");
  const [categorie, setCategorie] = useState<string | null>(params.get("categorie"));

  const categories = useMemo(() => [...new Set(questions.flatMap((q) => q.categories))].sort((a, b) => a.localeCompare(b, "fr")), [questions]);
  const filtrees = questions.filter((q) => {
    if (categorie && !q.categories.includes(categorie)) return false;
    const mots = simplifier(recherche.value).split(/\s+/).filter(Boolean);
    const cible = simplifier(`${q.question} ${q.reponse} ${q.categories.join(" ")}`);
    return mots.every((m) => cible.includes(m));
  });

  return (
    <div>
      <div className="relative mb-4 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input {...recherche} placeholder="Pose ta question : portable, IA, labos..." className="h-11 pl-9 text-base" aria-label="Rechercher dans la FAQ" />
      </div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        <button onClick={() => setCategorie(null)} className={`rounded-full border px-3 py-1 text-sm ${categorie === null ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
          Toutes
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategorie(categorie === c ? null : c)}
            className={`rounded-full border px-3 py-1 text-sm first-letter:uppercase ${categorie === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            {c}
          </button>
        ))}
      </div>
      {filtrees.length === 0 ? (
        <p className="text-muted-foreground">
          Pas de réponse à cette question. Écris-nous : <a href="mailto:coordination.info@cegepmontpetit.ca" className="text-primary underline">coordination.info@cegepmontpetit.ca</a>
        </p>
      ) : (
        <Accordion className="rounded-lg border bg-card">
          {filtrees.map((q) => (
            <AccordionItem key={q.question} value={q.question} className="px-4">
              <AccordionTrigger className="text-base font-semibold">{q.question}</AccordionTrigger>
              <AccordionContent className="space-y-3 text-base">
                <p>{q.reponse}</p>
                {q.liens.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {q.liens.map((l) =>
                      l.startsWith("http") ? (
                        <a key={l} href={l} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary underline">
                          {new URL(l).hostname}
                        </a>
                      ) : (
                        <Link key={l} href={l} className="text-sm font-semibold text-primary underline">
                          Voir la page {l.replace("/", "")}
                        </Link>
                      ),
                    )}
                  </div>
                )}
                <div className="flex gap-1">
                  {q.categories.map((c) => (
                    <span key={c} className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {c}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
