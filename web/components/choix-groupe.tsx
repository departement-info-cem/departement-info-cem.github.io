"use client";
import { useState } from "react";
import Link from "next/link";
import { BookmarkCheck, BookmarkPlus, Check, Search, Star, UserCheck } from "lucide-react";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { bouton } from "@/lib/bouton";
import { choixDe, court, libelle, memeChoix, type GroupeCours, type Lien, type Seance } from "@/lib/mes-cours";
import { simplifier } from "@/lib/texte";
import { formaterHeure } from "@/lib/temps";

// Le flow « C'est mon prof » / « C'est mon cours » : l'étudiant reconnaît son groupe à ses heures.

const ABREGES: Record<string, string> = { lundi: "lun", mardi: "mar", mercredi: "mer", jeudi: "jeu", vendredi: "ven", samedi: "sam", dimanche: "dim" };

export function texteSeances(seances: Seance[]): string {
  if (!seances.length) return "Horaire pas encore inscrit par le prof";
  return seances.map((s) => `${ABREGES[s.jour] ?? s.jour} ${formaterHeure(s.debut)}–${formaterHeure(s.fin)}${s.local ? ` ${s.local}` : ""}`).join(" · ");
}

/** Les groupes d'un cours (tous les profs) ou d'un prof (tous ses cours). Un clic l'ajoute à mes cours, ou le retire. */
export function ListeGroupes({ cours, prof }: { cours?: string; prof?: string }) {
  const { groupes, profs, cours: index, tous, basculer } = useMesCours();
  const liste: GroupeCours[] = cours ? (groupes[cours] ?? []) : Object.values(groupes).flat().filter((g) => g.prof === prof);
  const choisi = (g: GroupeCours) => tous.some((m) => memeChoix(m, choixDe(g)));
  const coursSeul = cours ? tous.find((m) => m.cours === cours && !m.prof) : undefined;

  return (
    <div className="space-y-2">
      {cours && liste.length === 0 && <p className="text-muted-foreground">Aucun prof n&apos;a encore inscrit ce cours dans sa fiche cette session.</p>}
      <ul className="max-h-[50vh] space-y-1.5 overflow-y-auto">
        {liste.map((g) => (
          <li key={`${g.cours}|${g.prof}|${g.groupe ?? ""}`}>
            <button
              onClick={() => basculer(choixDe(g))}
              aria-pressed={choisi(g)}
              className={`flex w-full items-start gap-2 rounded-md border p-2 text-left transition hover:border-primary ${choisi(g) ? "border-primary bg-accent" : "bg-card"}`}
            >
              <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${choisi(g) ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                {choisi(g) && <Check className="size-3.5" />}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">
                  {cours ? profs[g.prof]?.nom : `${court(g.cours)} · ${index[g.cours]?.nom ?? g.cours}`}
                  {g.groupe ? ` · groupe ${g.groupe}` : ""}
                </span>
                <span className="block text-xs text-muted-foreground">{texteSeances(g.seances)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {cours && (
        <button
          onClick={() => basculer({ cours })}
          aria-pressed={Boolean(coursSeul)}
          className={`w-full rounded-md border border-dashed p-2 text-left text-sm hover:border-primary ${coursSeul ? "border-primary bg-accent" : ""}`}
        >
          {coursSeul ? "✓ " : ""}
          {liste.length ? "Je ne connais pas mon groupe : garder seulement le cours" : "Ajouter ce cours quand même"}
        </button>
      )}
    </div>
  );
}

const DESCRIPTION = "Choisis ton groupe : tu le reconnais à ses heures. Ton choix reste dans ce navigateur, rien n'est envoyé.";

/** Bouton « C'est mon prof » (prof=...) ou « C'est mon cours » (cours=...) qui ouvre le choix du groupe. */
export function BoutonChoixGroupe({ cours, prof, className }: { cours?: string; prof?: string; className?: string }) {
  const { groupes, profs, cours: index, tous } = useMesCours();
  if (prof && !Object.values(groupes).some((l) => l.some((g) => g.prof === prof))) return null;
  const miens = tous.filter((m) => (prof ? m.prof === prof : m.cours === cours));
  const titre = prof ? `Tes cours avec ${profs[prof]?.nom ?? "ce prof"}` : `${court(cours!)} · ${index[cours!]?.nom ?? cours}`;
  const texte = miens.length ? `${prof ? "Ton prof" : "Ton cours"} · ${miens.map(libelle).join(", ")}` : prof ? "C'est mon prof" : "C'est mon cours";
  const Icone = miens.length ? (prof ? Star : BookmarkCheck) : prof ? UserCheck : BookmarkPlus;

  return (
    <Dialog>
      <DialogTrigger className={bouton({ variant: miens.length ? "default" : "outline", size: "sm" }, className)}>
        <Icone className="size-4" /> {texte}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{titre}</DialogTitle>
        <DialogDescription>{DESCRIPTION}</DialogDescription>
        <ListeGroupes cours={cours} prof={prof} />
        <Link href="/mes-cours" className="text-sm font-semibold text-primary underline">
          Voir mes cours et mon horaire
        </Link>
      </DialogContent>
    </Dialog>
  );
}

/** Dans une fenêtre déjà ouverte (grille de cours) : le bouton déplie le choix du groupe sur place. */
export function ChoixGroupeDeplie({ cours }: { cours: string }) {
  const { tous } = useMesCours();
  const miens = tous.filter((m) => m.cours === cours);
  const [ouvert, setOuvert] = useState(false);
  return (
    <div>
      <button onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert} className={bouton({ variant: miens.length ? "default" : "outline", size: "sm" })}>
        {miens.length ? <BookmarkCheck className="size-4" /> : <BookmarkPlus className="size-4" />}
        {miens.length ? `Ton cours · ${miens.map(libelle).join(", ")}` : "C'est mon cours"}
      </button>
      {ouvert && (
        <div className="mt-2">
          <p className="mb-2 text-xs text-muted-foreground">{DESCRIPTION}</p>
          <ListeGroupes cours={cours} />
        </div>
      )}
    </div>
  );
}

/** Ajouter un cours : recherche par numéro ou nom parmi les cours donnés cette session, puis choix du groupe. */
export function AjoutCours() {
  const { groupes, cours: index } = useMesCours();
  const [texte, setTexte] = useState("");
  const [cours, setCours] = useState<string | null>(null);
  const mots = simplifier(texte).split(/\s+/).filter(Boolean);
  const trouves = Object.keys(groupes)
    .sort()
    .filter((no) => mots.every((m) => simplifier(`${no} ${index[no]?.nom ?? ""}`).includes(m)))
    .slice(0, mots.length ? 12 : 0);

  if (cours) {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold">
            {court(cours)} · {index[cours]?.nom ?? cours}
          </h3>
          <button onClick={() => setCours(null)} className="shrink-0 text-sm text-primary underline">
            Autre cours
          </button>
        </div>
        <ListeGroupes cours={cours} />
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Numéro ou nom du cours (ex. 5N6, réseau)" className="pl-9" aria-label="Chercher un cours" />
      </div>
      <ul className="space-y-1">
        {trouves.map((no) => (
          <li key={no}>
            <button onClick={() => setCours(no)} className="flex w-full gap-2 rounded-md border bg-card px-3 py-2 text-left text-sm hover:border-primary">
              <span className="w-12 shrink-0 font-semibold tabular-nums text-primary">{court(no)}</span>
              <span>{index[no]?.nom ?? no}</span>
            </button>
          </li>
        ))}
      </ul>
      {mots.length > 0 && trouves.length === 0 && <p className="text-sm text-muted-foreground">Aucun cours de cette session ne correspond.</p>}
    </div>
  );
}

/** Pastille « Ton prof · 5N6 » (mon prof) ou « Donne 5N6 » (un prof de mes cours). */
export function PastilleLien({ lien, inverse = false }: { lien: Lien; inverse?: boolean }) {
  if (!lien.niveau) return null;
  const cours = lien.cours.map(court).join(", ");
  if (lien.niveau === "mon-prof")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cem-vert px-2 py-0.5 text-xs font-semibold text-cem-marine">
        <Star className="size-3 fill-current" /> Ton prof · {cours}
      </span>
    );
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${inverse ? "border-white/40" : "border-cem-vert"}`}>Donne {cours}</span>;
}
