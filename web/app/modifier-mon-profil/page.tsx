import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Conteneur, TitrePage } from "@/components/titre-page";
import { ApercuYaml } from "@/components/apercu-yaml";
import { ChoixProfEdition } from "@/components/choix-prof-edition";
import { calendrierScolaire, DOSSIER_DONNEES, indexCours, modeleProf, profs, yamlProf } from "@/lib/donnees";
import { DEPOT, lienCreation, lienEdition } from "@/lib/chemins";
import { bouton } from "@/lib/bouton";

export const metadata: Metadata = { title: "Profs : modifier ma page" };

const ETAPES = [
  {
    titre: "Ouvre ta fiche sur GitHub",
    texte: "Choisis ton nom ci-dessous : le lien ouvre directement l'éditeur de ton fichier data/profs/<ton-courriel>.yaml. Tu dois être connecté à GitHub avec un compte membre de l'organisation departement-info-cem.",
  },
  {
    titre: "Modifie le texte",
    texte: "Change ce que tu veux : bureau, cours, plages de l'horaire, dates du calendrier. Les lignes qui commencent par # sont des commentaires et t'expliquent chaque champ. Respecte l'indentation (des espaces, pas de tabulations).",
  },
  {
    titre: "Vérifie avec l'aperçu (facultatif)",
    texte: "Copie ton texte dans l'aperçu en bas de cette page : les erreurs s'affichent avec le numéro de ligne, et tu vois ton horaire et ton calendrier avant de publier.",
  },
  {
    titre: "Clique « Commit changes... »",
    texte: "En haut à droite de l'éditeur GitHub. Écris un court message (ex. « Horaire H2027 »), garde « Commit directly to the main branch » et confirme.",
  },
  {
    titre: "Attends 2-3 minutes",
    texte: "L'onglet Actions du dépôt montre la mise en ligne. ✅ vert : c'est en ligne. ❌ rouge : ouvre l'exécution, l'erreur indique le fichier, la ligne et quoi corriger. Rien n'est publié tant que l'erreur n'est pas corrigée : l'ancienne version reste en ligne.",
  },
];

export default function PageModifier() {
  const liste = profs();
  const exemples = Object.fromEntries(liste.filter((p) => p.horaire?.plages.length && !p.horaire.prerempli).map((p) => [p.id, yamlProf(p.id)]));
  const photos = fs.readdirSync(path.join(DOSSIER_DONNEES, "photos"));

  return (
    <>
      <TitrePage titre="Profs : modifier ma page" sousTitre="Ta page, ton horaire et ton calendrier sont dans un simple fichier texte (YAML) à ton nom. Tu le modifies directement sur GitHub, sans rien installer." />
      <Conteneur className="space-y-12">
        <section>
          <h2 className="mb-4 text-2xl font-bold">La procédure en 5 étapes</h2>
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="rounded-lg border bg-card p-4">
                <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
                <h3 className="mb-1 font-bold">{e.titre}</h3>
                <p className="text-sm text-muted-foreground">{e.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-2 text-xl font-bold">J&apos;ai déjà une page</h2>
            <p className="mb-3 text-sm text-muted-foreground">Ouvre directement ta fiche dans l&apos;éditeur de GitHub :</p>
            <ChoixProfEdition profs={liste.map((p) => ({ id: p.id, nom: p.nom }))} />
            <p className="mt-3 text-sm text-muted-foreground">
              Tes cours en laboratoire sont peut-être déjà préremplis : vérifie-les, ajoute tes disponibilités, puis enlève la ligne <code>prerempli: true</code>.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-2 text-xl font-bold">Je suis nouveau</h2>
            <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm">
              <li>
                Copie le <a href={lienEdition("profs/_modele.yaml").replace("/edit/", "/blob/")} target="_blank" rel="noreferrer" className="text-primary underline">modèle</a> (il est aussi dans l&apos;aperçu plus bas).
              </li>
              <li>Crée un fichier nommé avec ton courriel, sans @cegepmontpetit.ca : prenom.nom.yaml</li>
              <li>Ajoute ta photo (format portrait) dans le dossier data/photos avec « Add file → Upload files ».</li>
            </ol>
            <div className="flex flex-wrap gap-2">
              <a href={lienCreation("profs", "prenom.nom.yaml")} target="_blank" rel="noreferrer" className={bouton()}>
                Créer ma fiche <ExternalLink className="size-4" />
              </a>
              <a href={`${DEPOT}/upload/main/data/photos`} target="_blank" rel="noreferrer" className={bouton({ variant: "outline" })}>
                Ajouter ma photo <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Lier ton horaire depuis le site de ton cours</h2>
          <p className="mb-2 text-sm text-muted-foreground">Ces adresses ouvrent directement l&apos;horaire ou le calendrier ; avec <code>?cours=</code>, seulement les dates de ce cours.</p>
          <pre className="overflow-x-auto rounded bg-muted p-3 font-mono text-xs">{`https://info.cegepmontpetit.ca/react/prenom.nom/horaire/
https://info.cegepmontpetit.ca/react/prenom.nom/calendrier/?cours=420-5N6-EM`}</pre>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Aide-mémoire du format</h2>
          <div className="grid gap-4 text-sm *:min-w-0 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 font-bold">Une plage de l&apos;horaire</h3>
              <pre className="overflow-x-auto rounded bg-muted p-2 font-mono text-xs">{`- { jour: lundi, debut: "08:00", fin: "11:00",
    type: cours, cours: 420-1P6-EM,
    groupe: 1010, local: D-0601 }`}</pre>
              <p className="mt-2 text-muted-foreground">
                type : <code>cours</code>, <code>dispo</code>, <code>centre-aide</code>, <code>reunion</code> ou <code>autre</code>.
              </p>
              <p className="mt-2 text-muted-foreground">
                <strong>centre-aide</strong> paraît sur la page Centre d&apos;aide, pour tes cours et ceux de <code>aide: [420-1P6-EM, 420-2P6-EM]</code> (en haut de ta fiche). <strong>dispo</strong> n&apos;y paraît pas comme présence.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 font-bold">Une date du calendrier</h3>
              <pre className="overflow-x-auto rounded bg-muted p-2 font-mono text-xs">{`- { date: 2027-02-15, titre: Remise TP1,
    cours: 420-1P6-EM, type: remise,
    evaluation: sommative }
- { date: 2027-04-05, au: 2027-04-06,
    type: absence }
- { date: 2027-04-07, remplace: 2027-04-05,
    type: deplacement, cours: 420-1P6-EM }`}</pre>
              <p className="mt-2 text-muted-foreground">
                type : <code>remise</code>, <code>examen</code>, <code>cours</code>, <code>absence</code>, <code>deplacement</code>, <code>activite</code> ou <code>autre</code>.
              </p>
              <p className="mt-2 text-muted-foreground">
                <strong>evaluation</strong> : <code>sommative</code> ou <code>formative</code>. Avec <code>cours</code> (et <code>groupe</code> au besoin), la date paraît dans le calendrier et les rappels de tes étudiants (page Mes cours), tout comme tes absences et tes cours déplacés.{" "}
                <strong>absence</strong> annule les cours et les dispos de ces jours ; elle paraît seulement comme « Cours annulé », sans titre ni motif. <strong>deplacement</strong> reprend le cours du jour <code>remplace</code> à <code>date</code>, souvent une journée JR (même heure et même local, sauf si tu ajoutes <code>debut</code>, <code>fin</code>, <code>local</code>).
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 font-bold">Pièges fréquents</h3>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>Heures entre guillemets : <code>&quot;08:00&quot;</code></li>
                <li>Dates au format <code>AAAA-MM-JJ</code></li>
                <li>Un espace après chaque <code>:</code></li>
                <li>Des espaces, jamais de tabulations</li>
                <li>Un titre avec <code>:</code> ou <code>#</code> va entre guillemets</li>
                <li>Le calendrier du cégep (congés, journées pédagogiques...) est ajouté tout seul : pas besoin de le recopier</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Aperçu en direct</h2>
          <p className="mb-4 text-muted-foreground">Rien n&apos;est envoyé nulle part : tout se passe dans ton navigateur.</p>
          <ApercuYaml modele={modeleProf()} exemples={exemples} scolaire={calendrierScolaire()} cours={indexCours()} photos={photos} />
        </section>
        <section>
          <h2 className="mb-2 text-2xl font-bold">Entre profs</h2>
          <p className="text-muted-foreground">
            Une rencontre à organiser ? <Link href="/profs/rencontre" className="font-semibold text-primary underline">Trouve un moment où tout le monde est libre</Link>, d&apos;après
            l&apos;horaire des fiches. Plus ton horaire est complet, plus le résultat est juste.
          </p>
        </section>
      </Conteneur>
    </>
  );
}
