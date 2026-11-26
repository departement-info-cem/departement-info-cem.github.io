"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Link2, TriangleAlert, Users } from "lucide-react";
import { creneaux, creneauxCommuns, meilleursCreneaux, type Creneau, type ProfRencontre } from "@/lib/rencontre";
import { JOURS_OUVRABLES, LIBELLES_JOURS, minutesEnHeure } from "@/lib/temps";
import { bouton } from "@/lib/bouton";
import { cn } from "@/lib/utils";

export type ProfChoix = ProfRencontre & { actif: boolean; session?: string };

const DUREES = [30, 45, 60, 90, 120];
const HEURES = Array.from({ length: 15 }, (_, i) => (i + 7) * 60); // 7h00 à 21h00

const duree = (min: number) => (min % 60 ? `${Math.floor(min / 60) ? `${Math.floor(min / 60)} h ` : ""}${min % 60} min` : `${min / 60} h`);
const heure = (min: number) => minutesEnHeure(min).replace(":", " h ").replace(/^0/, "");

// Outil pour les profs, sans lien dans le menu : trouver un moment libre en commun d'après l'horaire des fiches.
// Les choix sont dans l'adresse de la page, pour l'envoyer aux collègues.
export function TrouverRencontre({ profs }: { profs: ProfChoix[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const chemin = usePathname();
  const [filtre, setFiltre] = useState("");
  const [copie, setCopie] = useState(false);

  const choisis = (params.get("profs") ?? "").split(",").filter((id) => profs.some((p) => p.id === id));
  const dureeMin = DUREES.includes(Number(params.get("duree"))) ? Number(params.get("duree")) : 60;
  const debut = HEURES.includes(Number(params.get("debut"))) ? Number(params.get("debut")) : 8 * 60;
  const fin = HEURES.includes(Number(params.get("fin"))) && Number(params.get("fin")) > debut ? Number(params.get("fin")) : 18 * 60;
  const disposLibres = params.get("dispos") === "libres";

  function changer(valeurs: Record<string, string | null>) {
    const nouveaux = new URLSearchParams(params.toString());
    for (const [cle, v] of Object.entries(valeurs)) {
      if (v) nouveaux.set(cle, v);
      else nouveaux.delete(cle);
    }
    // les virgules restent lisibles dans le lien
    router.replace(`${chemin}?${nouveaux.toString().replaceAll("%2C", ",")}`, { scroll: false });
  }
  const choisir = (ids: string[]) => changer({ profs: ids.length ? ids.join(",") : null });
  const basculer = (id: string) => choisir(choisis.includes(id) ? choisis.filter((x) => x !== id) : [...choisis, id]);

  const selection = profs.filter((p) => choisis.includes(p.id));
  const nom = (id: string) => profs.find((p) => p.id === id)?.nom ?? id;
  const options = { debut, fin, duree: dureeMin, disposLibres };
  // Quelques dizaines de plages : pas besoin de mémoriser le calcul
  const grille = creneaux(selection, options);
  const communs = creneauxCommuns(selection, options);
  const meilleurs = meilleursCreneaux(selection, options);

  // Horaire vide, ou d'une autre session que la plupart des profs choisis : le résultat serait trompeur.
  const sessions = selection.map((p) => p.session).filter(Boolean) as string[];
  const sessionCourante = sessions.sort((a, b) => sessions.filter((s) => s === b).length - sessions.filter((s) => s === a).length)[0];
  const sansHoraire = selection.filter((p) => !p.plages.length);
  const autreSession = selection.filter((p) => p.plages.length && p.session && p.session !== sessionCourante);

  // Les profs cochés en tête de liste, pour les voir sans faire défiler
  const visibles = profs.filter((p) => p.nom.toLowerCase().includes(filtre.toLowerCase())).sort((a, b) => Number(choisis.includes(b.id)) - Number(choisis.includes(a.id)));

  async function copierLien() {
    await navigator.clipboard.writeText(window.location.href);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      {/* ---------- Choix ---------- */}
      <div className="space-y-5">
        <div>
          <h2 className="mb-2 flex items-center gap-2 font-bold">
            <Users className="size-4" /> Qui ? <span className="font-normal text-muted-foreground">({selection.length})</span>
          </h2>
          <div className="mb-2 flex flex-wrap gap-2">
            <button onClick={() => choisir(profs.filter((p) => p.actif && p.plages.length).map((p) => p.id))} className={bouton({ variant: "outline", size: "sm" })}>
              Tout le département
            </button>
            <button onClick={() => choisir([])} className={bouton({ variant: "ghost", size: "sm" })} disabled={!selection.length}>
              Personne
            </button>
          </div>
          <input
            type="search"
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            placeholder="Chercher un prof"
            className="mb-2 h-9 w-full rounded-md border bg-background px-3 text-sm"
            aria-label="Chercher un prof"
          />
          <ul className="max-h-80 space-y-0.5 overflow-y-auto rounded-md border p-1">
            {visibles.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted">
                  <input type="checkbox" checked={choisis.includes(p.id)} onChange={() => basculer(p.id)} className="accent-[var(--primary)]" />
                  <span className={cn(!p.actif && "text-muted-foreground")}>{p.nom}</span>
                  {!p.plages.length && <span className="ml-auto text-xs text-muted-foreground">sans horaire</span>}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-bold">Durée de la rencontre</span>
          <select value={dureeMin} onChange={(e) => changer({ duree: e.target.value === "60" ? null : e.target.value })} className="h-9 w-full rounded-md border bg-background px-2">
            {DUREES.map((d) => (
              <option key={d} value={d}>
                {duree(d)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <label>
            <span className="mb-1 block font-bold">Pas avant</span>
            <select value={debut} onChange={(e) => changer({ debut: e.target.value === "480" ? null : e.target.value })} className="h-9 w-full rounded-md border bg-background px-2">
              {HEURES.filter((h) => h < fin).map((h) => (
                <option key={h} value={h}>
                  {heure(h)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block font-bold">Pas après</span>
            <select value={fin} onChange={(e) => changer({ fin: e.target.value === "1080" ? null : e.target.value })} className="h-9 w-full rounded-md border bg-background px-2">
              {HEURES.filter((h) => h > debut).map((h) => (
                <option key={h} value={h}>
                  {heure(h)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={disposLibres} onChange={(e) => changer({ dispos: e.target.checked ? "libres" : null })} className="mt-1 accent-[var(--primary)]" />
          <span>
            Compter les dispos et le centre d&apos;aide comme du temps libre
            <span className="block text-xs text-muted-foreground">Sinon, ce temps reste aux étudiants.</span>
          </span>
        </label>

        <button onClick={copierLien} className={bouton({ variant: "outline" }, "w-full")} disabled={!selection.length}>
          {copie ? <Check className="size-4" /> : <Link2 className="size-4" />} {copie ? "Lien copié" : "Copier le lien pour les collègues"}
        </button>
      </div>

      {/* ---------- Résultats ---------- */}
      <div className="min-w-0 space-y-6">
        {selection.length < 2 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Choisis au moins deux profs.</p>
        ) : (
          <>
            {(sansHoraire.length > 0 || autreSession.length > 0) && (
              <div className="space-y-1 rounded-md border border-cem-jaune bg-cem-jaune-pale px-3 py-2 text-sm text-cem-marine">
                {sansHoraire.length > 0 && (
                  <p className="flex items-start gap-2">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" /> Sans horaire dans leur fiche, donc comptés comme libres : {sansHoraire.map((p) => p.nom).join(", ")}.
                  </p>
                )}
                {autreSession.length > 0 && (
                  <p className="flex items-start gap-2">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" /> Horaire d&apos;une autre session que {sessionCourante} :{" "}
                    {autreSession.map((p) => `${p.nom} (${p.session})`).join(", ")}.
                  </p>
                )}
              </div>
            )}

            <section>
              <h2 className="mb-2 text-xl font-bold">{communs.length ? "Tout le monde est libre" : "Aucun moment où tout le monde est libre"}</h2>
              {communs.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {communs.map((c) => (
                    <li key={`${c.jour}${c.debut}`} className="rounded-md border border-cem-vert bg-card px-3 py-1.5 text-sm">
                      <strong>{LIBELLES_JOURS[c.jour]}</strong> {heure(c.debut)} à {heure(c.fin)} <span className="text-muted-foreground">({duree(c.fin - c.debut)})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="mb-2 text-sm text-muted-foreground">Les moments d&apos;au moins {duree(dureeMin)} où il manque le moins de monde :</p>
                  <ul className="space-y-1.5">
                    {meilleurs.map((c) => (
                      <li key={`${c.jour}${c.debut}`} className="rounded-md border bg-card px-3 py-1.5 text-sm">
                        <strong>{LIBELLES_JOURS[c.jour]}</strong> {heure(c.debut)} à {heure(c.fin)}{" "}
                        <span className="text-muted-foreground">· manque {c.absents.map(nom).join(", ")}</span>
                      </li>
                    ))}
                    {!meilleurs.length && <li className="text-sm text-muted-foreground">Rien d&apos;assez long : essaie une durée plus courte.</li>}
                  </ul>
                </>
              )}
            </section>

            <Grille grille={grille} total={selection.length} debut={debut} fin={fin} duree={dureeMin} nom={nom} />
          </>
        )}
      </div>
    </div>
  );
}

/** La semaine en colonnes : plus c'est vert, plus il y a de monde de libre. */
function Grille({ grille, total, debut, fin, duree: dureeMin, nom }: { grille: Creneau[]; total: number; debut: number; fin: number; duree: number; nom: (id: string) => string }) {
  const hauteur = (fin - debut) * 0.8; // 48 px par heure
  const heures = HEURES.filter((h) => h >= debut && h <= fin);
  return (
    <section>
      <h2 className="mb-2 text-xl font-bold">La semaine</h2>
      <div className="flex gap-1 overflow-x-auto text-xs">
        <div className="relative w-10 shrink-0" style={{ height: hauteur + 12, marginTop: 24 }}>
          {heures.map((h) => (
            <span key={h} className="absolute -translate-y-1/2 text-muted-foreground" style={{ top: (h - debut) * 0.8 }}>
              {heure(h).replace(" h 00", " h")}
            </span>
          ))}
        </div>
        {JOURS_OUVRABLES.map((jour) => (
          <div key={jour} className="min-w-24 flex-1">
            <p className="mb-1 h-5 text-center font-bold">{LIBELLES_JOURS[jour]}</p>
            <div className="relative overflow-hidden rounded-md border bg-muted" style={{ height: hauteur }}>
              {grille
                .filter((c) => c.jour === jour)
                .map((c) => {
                  const libres = total - c.absents.length;
                  const tous = !c.absents.length && c.fin - c.debut >= dureeMin;
                  return (
                    <div
                      key={c.debut}
                      className={cn("absolute inset-x-0 border-b border-background/60 px-1", tous && "z-10 ring-2 ring-inset ring-foreground")}
                      style={{
                        top: (c.debut - debut) * 0.8,
                        height: (c.fin - c.debut) * 0.8,
                        background: libres ? `rgb(141 198 64 / ${0.08 + (0.92 * libres ** 2) / total ** 2})` : undefined,
                      }}
                      title={`${heure(c.debut)} à ${heure(c.fin)} : ${libres}/${total} libres${c.absents.length ? `\nPris : ${c.absents.map(nom).join(", ")}` : ""}`}
                    >
                      {c.fin - c.debut >= 25 && (
                        <span className={cn("font-semibold", libres === total ? "text-cem-marine" : "text-foreground")}>
                          {libres}/{total}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Le nombre de profs libres sur le nombre choisi. Survole une case pour voir qui est pris.</p>
    </section>
  );
}
