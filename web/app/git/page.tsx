import type { Metadata } from "next";
import { Conteneur, TitrePage } from "@/components/titre-page";

export const metadata: Metadata = { title: "Git et commits" };

const TYPES = [
  ["FCT", "Fonctionnalité", "Un nouvel aspect du code fonctionne et augmente la valeur de ton travail : tu as gagné un point du barème."],
  ["PROGRES", "Progrès", "Tu n'as pas fini la fonctionnalité, mais tu dois t'arrêter."],
  ["BUGFIX", "Débogage", "Tu as résolu un bogue. Décris la solution pour t'en souvenir plus tard."],
  ["NETTOYAGE", "Nettoyage", "Tu supprimes du code qui n'est plus nécessaire."],
  ["REFACTOR", "Réorganisation", "Tu as réorganisé ton code pour le rendre plus lisible, sans changer son comportement."],
];

export default function PageGit() {
  return (
    <>
      <TitrePage titre="Git et commits" sousTitre="Les règles du département pour les dépôts de code de tes travaux." />
      <Conteneur className="max-w-4xl space-y-10">
        <section>
          <h2 className="mb-2 text-2xl font-bold">Quand faire un commit ?</h2>
          <p className="rounded-md border-l-4 border-primary bg-accent p-3 font-semibold">Règle du pouce : un commit dès que tu as gagné un point ou plus dans le barème de ton travail.</p>
          <p className="mt-3">
            Ne pas attendre trop longtemps, mais ne pas faire un commit à chaque fichier modifié non plus. Un commit contient des modifications qui constituent un progrès dans ton projet, et ton code doit compiler.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-bold">Types de commits</h2>
          <p className="mb-3">Inscris le type au début du titre du commit.</p>
          <div className="grid gap-2">
            {TYPES.map(([code, nom, texte]) => (
              <div key={code} className="flex flex-col gap-1 rounded-md border bg-card p-3 sm:flex-row sm:items-center sm:gap-4">
                <code className="w-28 shrink-0 rounded bg-cem-marine px-2 py-1 text-center font-mono text-sm font-bold text-white">{code}</code>
                <span>
                  <strong>{nom} : </strong>
                  {texte}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-2 text-2xl font-bold">Exemple</h2>
          <p className="mb-2">Tu as implanté la sauvegarde dans un fichier texte ; les modifications touchent 3 fichiers.</p>
          <pre className="overflow-x-auto rounded-md bg-[#071a2b] p-4 font-mono text-sm text-[#e6f0f7]">
            <span className="text-cem-vert">$</span> git commit -m &quot;FCT sauvegarde de configuration dans fichier&quot; \{"\n"}
            {"    "}-m &quot;J&apos;ai utilisé la librairie Guava pour simplifier la sauvegarde. Le format est décrit à https://exemple.com/format&quot;
          </pre>
        </section>
        <section>
          <h2 className="mb-2 text-2xl font-bold">Nom du dépôt</h2>
          <p>Chaque travail doit se trouver dans un dépôt dont le nom respecte le format :</p>
          <p className="my-2 rounded-md bg-muted p-3 font-mono">SessionAnnée-NumeroCours-NomTravail-NomPrenom</p>
          <p>
            Par exemple <code className="font-mono font-semibold">H27-4201P6-WebCrawler-SmithJohn</code> : hiver 2027, cours 420-1P6, travail WebCrawler, de John Smith. Pour un travail d&apos;équipe :{" "}
            <code className="font-mono">SessionAnnée-NumeroCours-NomTravail-Nom1Nom2...</code>
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-2xl font-bold">Collaborateurs et plagiat</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Tous les dépôts de travaux évalués doivent être <strong>privés</strong>.</li>
            <li>Ajoute ton prof aux collaborateurs du dépôt pour qu&apos;il y ait accès.</li>
            <li>Les seuls autres collaborateurs sont les membres de ton équipe, s&apos;il s&apos;agit d&apos;un travail d&apos;équipe.</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-2 text-2xl font-bold">Textes en français</h2>
          <p>
            Les textes de tes commits sont en français, et la qualité du français est évaluée. Les titres restent courts (pas obligatoirement des phrases) ; une description, elle, doit contenir des phrases compréhensibles par une personne extérieure.
          </p>
        </section>
      </Conteneur>
    </>
  );
}
