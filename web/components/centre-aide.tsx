"use client";
import { useState } from "react";
import Link from "next/link";
import { useMaintenant } from "@/app/_hooks/use-maintenant";
import { useMesCours } from "@/app/_contexts/mes-cours-context";
import { useScolaire } from "@/app/_contexts/scolaire-context";
import { texteSeances } from "@/components/choix-groupe";
import { HoraireSemaine } from "@/components/horaire-semaine";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { situationDuJour } from "@/lib/calendrier";
import { aidants, aidantsHorsCentre, horaireCentreAide } from "@/lib/centre-aide";
import { court } from "@/lib/mes-cours";
import { isoDepuisDate, normaliserJour } from "@/lib/temps";
import type { Plage } from "@/app/_types/prof";

const MES_COURS = "mes-cours";
const TOUS = "tous";

const quand = (plages: Plage[]) => texteSeances(plages.map((p) => ({ ...p, jour: normaliserJour(p.jour) ?? p.jour })));

// Page « Centre d'aide en informatique », qui devient « Mon centre d'aide » quand l'étudiant a entré ses cours :
// on n'y montre alors que les moments où un prof prêt à aider dans un de ses cours est présent.
export function CentreAide() {
  const { mesCours, profs, cours: index } = useMesCours();
  const scolaire = useScolaire();
  const maintenant = useMaintenant(3_600_000);
  const [choix, setChoix] = useState(MES_COURS);

  const session = maintenant ? situationDuJour(scolaire, isoDepuisDate(maintenant)).session : undefined;
  const miens = mesCours.map((m) => m.cours);
  const personnel = miens.length > 0;
  const demandes = choix === MES_COURS ? (personnel ? miens : undefined) : choix === TOUS ? undefined : [choix];
  const presents = aidants(profs, { cours: demandes, session });
  const coursOfferts = [...new Set(aidants(profs, { session }).flatMap((a) => a.cours))].filter((no) => index[no]).sort((a, b) => court(a).localeCompare(court(b)));
  const nom = (no: string) => (index[no] ? `${court(no)} : ${index[no].nom}` : court(no));

  return (
    <>
      <TitrePage
        titre={personnel ? "Mon centre d'aide" : "Centre d'aide en informatique"}
        sousTitre={personnel ? "Les moments où un prof prêt à t'aider dans un de tes cours est au centre d'aide." : "Des profs du département t'aident, même si tu n'es pas dans leur groupe."}
      >
        {!personnel && (
          <p className="mt-3 text-sm">
            <Link href="/mes-cours" className="font-semibold text-primary underline">Indique tes cours</Link> pour voir seulement les profs qui peuvent t&apos;aider.
          </p>
        )}
      </TitrePage>
      <Conteneur className="space-y-8">
        <section>
          <label className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">Montrer l&apos;aide pour</span>
            <select value={choix === MES_COURS && !personnel ? TOUS : choix} onChange={(e) => setChoix(e.target.value)} className="h-9 max-w-full rounded-md border border-input bg-background px-3 text-sm">
              {personnel && <option value={MES_COURS}>mes cours ({miens.map(court).join(", ")})</option>}
              <option value={TOUS}>tous les cours</option>
              {coursOfferts.map((no) => (
                <option key={no} value={no}>{nom(no)}</option>
              ))}
            </select>
          </label>
          <HoraireSemaine
            plages={horaireCentreAide(presents, Boolean(demandes))}
            cours={index}
            vide={demandes ? "Aucun prof inscrit au centre d'aide pour ce choix cette session." : "Aucune présence au centre d'aide n'est inscrite pour l'instant."}
            impression={{ titre: personnel ? "Mon centre d'aide" : "Centre d'aide en informatique", details: [demandes?.map(court).join(", ")] }}
          />
          <p className="mt-2 text-xs text-muted-foreground">Horaire habituel : vérifie les absences et les congés sur la page du prof.</p>
        </section>

        {demandes ? (
          <section className="grid gap-4 md:grid-cols-2">
            {[...new Set(demandes)].map((no) => {
              const auCentre = presents.filter((a) => a.cours.includes(no));
              const ailleurs = aidantsHorsCentre(profs, no, session);
              return (
                <div key={no} className="rounded-lg border bg-card p-4 text-sm">
                  <h2 className="mb-2 font-bold">{nom(no)}</h2>
                  <Liste titre="Au centre d'aide" vide="Personne d'inscrit au centre d'aide pour ce cours." profs={auCentre.map((a) => ({ id: a.id, nom: a.nom, plages: a.plages }))} />
                  {ailleurs.length > 0 && <Liste titre="À leurs disponibilités" profs={ailleurs.map((a) => ({ id: a.id, nom: a.nom, plages: a.dispos }))} />}
                </div>
              );
            })}
          </section>
        ) : (
          presents.length > 0 && (
            <section>
              <h2 className="mb-3 text-2xl font-bold">Qui peut aider en quoi</h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {presents.map((a) => (
                  <li key={a.id} className="rounded-lg border bg-card p-4 text-sm">
                    <Link href={`/${a.id}`} className="font-semibold text-primary underline">{a.nom}</Link>
                    <div className="text-muted-foreground">{quand(a.plages)}</div>
                    <div className="mt-1">{a.cours.map(court).join(", ")}</div>
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </Conteneur>
    </>
  );
}

function Liste({ titre, vide, profs }: { titre: string; vide?: string; profs: { id: string; nom: string; plages: Plage[] }[] }) {
  return (
    <div className="mt-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titre}</h3>
      {profs.length === 0 && <p className="text-muted-foreground">{vide}</p>}
      <ul>
        {profs.map((p) => (
          <li key={p.id}>
            <Link href={`/${p.id}`} className="font-medium text-primary underline">{p.nom}</Link> <span className="text-muted-foreground">{quand(p.plages)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
