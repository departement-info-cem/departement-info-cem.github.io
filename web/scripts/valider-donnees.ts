// Vérifie tous les fichiers du dossier data/ avant le build.
// Dans GitHub Actions, les erreurs apparaissent directement sur le fichier et la ligne fautive.
// Utilisation : npm run valider
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { z } from "zod";
import { validerYamlProf } from "../lib/validation";
import { coursSchema, programmeSchema } from "../app/_types/programme";
import { botSchema, calendrierScolaireSchema, coursServiceSchema, faqSchema, laboratoiresSchema, logicielsSchema } from "../app/_types/divers";
import { formaterErreurs } from "../lib/erreurs";

const DONNEES = path.resolve(__dirname, "..", "..", "data");
const CI = Boolean(process.env.GITHUB_ACTIONS);
let nbErreurs = 0;
let nbAvertissements = 0;

function signaler(niveau: "erreur" | "avertissement", fichier: string, message: string, ligne?: number) {
  const relatif = `data/${fichier}`;
  if (niveau === "erreur") nbErreurs++;
  else nbAvertissements++;
  if (CI) {
    const type = niveau === "erreur" ? "error" : "warning";
    console.log(`::${type} file=${relatif}${ligne ? `,line=${ligne}` : ""},title=${relatif}::${message}`);
  }
  console.log(`${niveau === "erreur" ? "❌" : "⚠️ "} ${relatif}${ligne ? ` (ligne ${ligne})` : ""} : ${message}`);
}

function verifier<T extends z.ZodType>(schema: T, fichier: string): z.infer<T> | undefined {
  try {
    const r = schema.safeParse(YAML.parse(fs.readFileSync(path.join(DONNEES, fichier), "utf8")));
    if (r.success) return r.data;
    signaler("erreur", fichier, "\n" + formaterErreurs(r.error));
  } catch (e) {
    signaler("erreur", fichier, `YAML mal formé : ${(e as Error).message.split("\n")[0]}`);
  }
  return undefined;
}

// 1. Catalogue des cours
const catalogue = verifier(coursSchema.array(), "cours.yaml") ?? [];
const coursConnus = new Set(catalogue.flatMap((c) => [c.no, ...(c.alias ?? []).map((a) => a.no)].map((n) => n.toUpperCase())));
const doublons = catalogue.map((c) => c.no).filter((no, i, t) => t.indexOf(no) !== i);
for (const d of doublons) signaler("erreur", "cours.yaml", `le cours ${d} est défini deux fois`);

// 2. Programmes
for (const f of fs.readdirSync(path.join(DONNEES, "programmes")).filter((f) => f.endsWith(".yaml"))) {
  const p = verifier(programmeSchema, `programmes/${f}`);
  p?.sessions.forEach((s) =>
    s.cours.forEach((c) => {
      if (typeof c === "string" && !coursConnus.has(c.toUpperCase())) {
        signaler("erreur", `programmes/${f}`, `${s.titre} : le cours ${c} n'existe pas dans data/cours.yaml`);
      }
    }),
  );
}

// 3. Profs
const photos = new Set(fs.readdirSync(path.join(DONNEES, "photos")));
const fichiersProfs = fs.readdirSync(path.join(DONNEES, "profs")).filter((f) => f.endsWith(".yaml"));
for (const f of fichiersProfs) {
  const id = f.replace(/\.yaml$/, "");
  const modele = f.startsWith("_");
  const { problemes } = validerYamlProf(fs.readFileSync(path.join(DONNEES, "profs", f), "utf8"), {
    id: modele ? undefined : id,
    coursConnus,
    photosConnues: modele ? undefined : photos,
  });
  for (const p of problemes) signaler(p.niveau, `profs/${f}`, p.message, p.ligne);
}
const autres = fs.readdirSync(path.join(DONNEES, "profs")).filter((f) => !f.endsWith(".yaml"));
for (const f of autres) signaler("avertissement", `profs/${f}`, "fichier ignoré : seuls les fichiers .yaml sont lus (renomme-le en .yaml ?)");

// 4. Divers
verifier(calendrierScolaireSchema, "calendrier-scolaire.yaml");
verifier(laboratoiresSchema, "laboratoires.yaml")?.forEach((l) =>
  l.occupations.forEach((a, i) =>
    l.occupations.slice(i + 1).forEach((b) => {
      if (a.jour === b.jour && a.debut < b.fin && b.debut < a.fin)
        signaler("avertissement", "laboratoires.yaml", `${l.local}, ${a.jour} : ${a.cours ?? a.titre} (${a.debut}-${a.fin}) et ${b.cours ?? b.titre} (${b.debut}-${b.fin}) se chevauchent. Deux cours de 5 h ? Coupe au milieu : 2 séances de 2 h 30.`);
    }),
  ),
);
verifier(coursServiceSchema, "cours-service.yaml")?.forEach((p) =>
  p.cours.forEach((c) => {
    if (!coursConnus.has(c.no.toUpperCase())) signaler("erreur", "cours-service.yaml", `${p.court} : le cours ${c.no} n'existe pas dans data/cours.yaml`);
  }),
);
verifier(faqSchema, "faq.yaml");
verifier(logicielsSchema, "logiciels.yaml");
const bot = verifier(botSchema, "bot.yaml");
if (bot) {
  if (!bot.questions[bot.depart]) signaler("erreur", "bot.yaml", `la question de départ « ${bot.depart} » n'existe pas`);
  for (const [id, q] of Object.entries(bot.questions)) {
    for (const c of q.choix) {
      if (c.suivant && !bot.questions[c.suivant]) signaler("erreur", "bot.yaml", `question ${id} : la question « ${c.suivant} » n'existe pas`);
      if (c.resultat && !bot.resultats[c.resultat]) signaler("erreur", "bot.yaml", `question ${id} : le résultat « ${c.resultat} » n'existe pas`);
    }
  }
}

console.log(`\n${fichiersProfs.length} fiches de profs vérifiées : ${nbErreurs} erreur(s), ${nbAvertissements} avertissement(s).`);
if (nbErreurs > 0) {
  console.log("Corrige les erreurs ci-dessus puis refais un commit. Aide : https://info.cegepmontpetit.ca/react/modifier-mon-profil");
  process.exit(1);
}
