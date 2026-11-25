"use client";
import { useSearchParams } from "next/navigation";
import type { Prof } from "@/app/_types/prof";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { CalendrierProf } from "@/components/calendrier-prof";
import { HorairePrerempli } from "@/components/horaire-prerempli";
import { HoraireSemaine, type InfoCours } from "@/components/horaire-semaine";

// Adresses directes pour les sites de cours : /react/<prof>/horaire/?cours=420-5N6-EM et /react/<prof>/calendrier/?cours=...
// Avec ?cours=, on garde seulement ce cours (et les disponibilités du prof).
export function VueDirecte({ prof, vue, cours }: { prof: Prof; vue: "horaire" | "calendrier"; cours: InfoCours }) {
  const params = useSearchParams();
  const scolaire = useScolaire();
  const demande = params.get("cours")?.toUpperCase();
  const canonique = (no?: string) => (no ? (cours[no.toUpperCase()]?.no ?? no).toUpperCase() : undefined);
  const garder = (no?: string) => !demande || !no || canonique(no) === canonique(demande);
  const plages = (prof.horaire?.plages ?? []).filter((p) => garder(p.cours));
  const evenements = (prof.calendrier ?? []).filter((e) => garder(e.cours));
  const session = scolaire.sessions.find((s) => s.id === prof.session);
  const info = demande ? cours[demande] : undefined;

  return (
    <>
      {demande && (
        <p className="mb-3 text-sm">
          Seulement le cours <strong>{demande}</strong>
          {info && ` (${info.nom})`}
          {vue === "horaire" && ", avec les disponibilités"}.
        </p>
      )}
      {vue === "horaire" ? (
        <>
          {prof.horaire?.prerempli && <HorairePrerempli />}
          <HoraireSemaine plages={plages} debut={prof.horaire?.debut} fin={prof.horaire?.fin} cours={cours} impression={{ titre: prof.nom, details: [prof.bureau && `Bureau ${prof.bureau}`, session?.nom, demande] }} />
        </>
      ) : (
        <CalendrierProf prof={prof.id} plages={plages} evenements={evenements} sessionId={prof.session} />
      )}
    </>
  );
}
