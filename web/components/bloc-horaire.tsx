import type { ReactNode } from "react";
import type { PlageAffichee } from "@/lib/horaire";
import { LIBELLES_TYPES_PLAGE } from "@/app/_types/prof";
import { court } from "@/lib/mes-cours";
import { nomCourt, simplifier } from "@/lib/texte";
import type { InfoCours } from "@/components/horaire-semaine";

/** Ce qu'on peut dire d'une plage : en abrégé dans son bloc, au complet dans la fenêtre de détails. */
export function textesPlage(p: PlageAffichee, cours: InfoCours) {
  const info = p.cours ? cours[p.cours.toUpperCase()] : undefined;
  const noms = p.noms ?? [];
  // Sans titre, une présence porte le nom du prof (page Centre d'aide)
  const nomsEnTitre = !p.titre && p.type !== "cours" && noms.length > 0;
  const titre = (p.type === "cours" ? info?.nom : undefined) ?? p.titre ?? info?.nom ?? (p.type === "cours" ? (p.cours ?? LIBELLES_TYPES_PLAGE.cours) : nomsEnTitre ? noms.join(", ") : LIBELLES_TYPES_PLAGE[p.type]);
  const groupe = p.groupe ? `gr. ${p.groupe}` : "";
  // Le sigle ne paraît qu'une fois : pas sous un titre qui le donne déjà
  const sigleEnTitre = p.cours && titre.toUpperCase().split(/[^0-9A-Z]+/).includes(court(p.cours.toUpperCase()));
  return {
    titre,
    titreCourt: nomsEnTitre ? noms.map(nomCourt).join(", ") : titre,
    noms: nomsEnTitre ? [] : noms,
    sigle: p.cours ? [p.cours, groupe].filter(Boolean).join(" ") : "",
    sigleCourt: p.cours ? [sigleEnTitre ? "" : court(p.cours), groupe].filter(Boolean).join(" ") : "",
    nomCours: info && simplifier(info.nom) !== simplifier(titre) ? info.nom : "",
  };
}

// Les lignes d'un bloc, de la plus utile à la moins utile. Une ligne qui n'entre pas en entier passe dans une
// colonne suivante, hors du bloc : rien n'est coupé au milieu, et le détail complet s'ouvre d'un clic.
export function ContenuBloc({ p, cours }: { p: PlageAffichee; cours: InfoCours }) {
  const t = textesPlage(p, cours);
  return (
    <span className="flex h-full w-full flex-col flex-wrap justify-center content-start gap-x-8 overflow-clip leading-[14px] @max-[6rem]:text-[11px]">
      <Ligne className="font-semibold">{t.titreCourt}</Ligne>
      {t.noms.length > 0 && <Ligne>{t.noms.map(nomCourt).join(", ")}</Ligne>}
      <Ligne>
        <span className="whitespace-nowrap">
          {p.debut}
          <span className="@max-[7rem]:hidden">–{p.fin}</span>
        </span>
        {p.local && (
          <>
            {" "}
            <span className="@min-[2.75rem]:whitespace-nowrap">
              <span className="@max-[5rem]:hidden">· </span>
              {p.local}
            </span>
          </>
        )}
      </Ligne>
      {p.precision && <Ligne>{p.precision}</Ligne>}
      {t.sigleCourt && <Ligne>{t.sigleCourt}</Ligne>}
      {t.nomCours && <Ligne>{t.nomCours}</Ligne>}
    </span>
  );
}

function Ligne({ className = "", children }: { className?: string; children: ReactNode }) {
  return <span className={`block max-h-full w-full shrink-0 overflow-hidden break-words hyphens-auto ${className}`}>{children}</span>;
}
