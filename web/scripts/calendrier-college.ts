// Télécharge le calendrier scolaire officiel (PDF) du cégep, le lit et met à jour data/calendrier-scolaire.yaml.
//   npm run calendrier              -> met à jour le fichier s'il a changé
//   npm run calendrier -- --verifier -> n'écrit rien, dit seulement ce qui a changé (code 2 si différent)
// Exécuté à chaque déploiement et chaque matin par GitHub Actions. Si le site du cégep est en panne ou si la
// mise en page du PDF change, on garde le fichier existant et on affiche un avertissement.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { calendrierScolaireSchema, type CalendrierScolaire } from "../app/_types/divers";
import { analyserCalendrier, type CalendrierExtrait, type TextePdf } from "../lib/calendrier-pdf";

const PAGE = "https://www.cegepmontpetit.ca/cegep/calendrier-scolaire";
const FICHIER = path.resolve(__dirname, "..", "..", "data", "calendrier-scolaire.yaml");
const VERIFIER = process.argv.includes("--verifier");
const CI = Boolean(process.env.GITHUB_ACTIONS);

function avertir(message: string) {
  console.log(CI ? `::warning file=data/calendrier-scolaire.yaml,title=Calendrier scolaire::${message}` : `⚠️  ${message}`);
}

async function telecharger(url: string): Promise<Response> {
  const r = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!r.ok) throw new Error(`${url} : réponse ${r.status}`);
  return r;
}

async function textesPdf(octets: Uint8Array): Promise<TextePdf[]> {
  const doc = await getDocument({ data: octets, verbosity: 0 }).promise;
  const contenu = await (await doc.getPage(1)).getTextContent();
  return contenu.items.flatMap((i) => ("str" in i ? [{ x: i.transform[4], y: i.transform[5], l: i.width, h: i.height, t: i.str }] : []));
}

function enYaml(c: CalendrierScolaire): string {
  const ligne = (o: object) => `  - { ${Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${/^(date|au|debut|fin|id|type|code|horaireDu|revise)$/.test(k) ? v : JSON.stringify(v)}`).join(", ")} }`;
  const sortie = [
    "# Calendrier scolaire commun à tout le monde (affiché dans chaque calendrier de prof).",
    "# FICHIER GÉNÉRÉ à partir du PDF officiel par « npm run calendrier » (dossier web/) : ne pas le modifier à la main,",
    "# il est recalculé à chaque déploiement et chaque matin. Les dates propres à un prof vont dans data/profs/<courriel>.yaml.",
    "#",
    "# Types : conge, pedagogique, mise-a-jour, relache, encadrement, suspension, reprise (JR), evaluations (EC, EUL) -> pas de cours réguliers",
    "#   horaire-modifie (avec horaireDu) -> on suit l'horaire d'un autre jour ; evaluations-horaire (EHR) -> horaire régulier",
    `source: ${c.source}`,
    "pdf:",
    ...c.pdf.map(ligne),
    "",
    "sessions:",
    ...c.sessions.map(ligne),
    "",
    "journees:",
  ];
  let annee = "";
  for (const j of c.journees) {
    const session = c.sessions.findLast((s) => s.debut <= j.date)?.nom ?? "";
    if (session !== annee) sortie.push(`  # ---------- ${session || "Avant la session"} ----------`);
    annee = session;
    sortie.push(ligne({ date: j.date, au: j.au, titre: j.titre, type: j.type, code: j.code, horaireDu: j.horaireDu }));
  }
  return sortie.join("\n") + "\n";
}

async function main() {
  const html = await (await telecharger(PAGE)).text();
  const liens = [...new Set([...html.matchAll(/href="([^"]*calendrier-\d{4}-\d{4}[^"]*\.pdf)"/gi)].map((m) => new URL(m[1], PAGE).href))];
  if (!liens.length) throw new Error(`aucun PDF de calendrier trouvé sur ${PAGE}`);

  const extraits: { url: string; e: CalendrierExtrait }[] = [];
  for (const url of liens) {
    try {
      const e = analyserCalendrier(await textesPdf(new Uint8Array(await (await telecharger(url)).arrayBuffer())));
      extraits.push({ url, e });
      console.log(`✅ ${e.annee} (révisé le ${e.revise ?? "?"}) : ${e.journees.length} journées`);
      e.avertissements.forEach((a) => console.log(`   ℹ️  ${a}`));
    } catch (e) {
      avertir(`PDF illisible, ignoré : ${url} — ${(e as Error).message}`);
    }
  }
  if (!extraits.length) throw new Error("aucun PDF n'a pu être lu");
  extraits.sort((a, b) => a.e.annee.localeCompare(b.e.annee));

  const ancien = fs.existsSync(FICHIER) ? calendrierScolaireSchema.safeParse(YAML.parse(fs.readFileSync(FICHIER, "utf8"))) : undefined;
  const avant = ancien?.success ? ancien.data : undefined;
  // On garde les années déjà connues dont le PDF n'est plus (ou pas) lisible aujourd'hui
  const lues = new Set(extraits.flatMap((x) => x.e.sessions.map((s) => s.id)));
  const gardees = avant?.sessions.filter((s) => !lues.has(s.id)) ?? [];
  const debutLu = extraits[0].e.journees[0].date;
  const finLue = extraits.at(-1)!.e.journees.at(-1)!.date;
  const nouveau = calendrierScolaireSchema.parse({
    source: PAGE,
    pdf: [...(avant?.pdf.filter((p) => !extraits.some((x) => x.e.annee === p.annee)) ?? []), ...extraits.map(({ url, e }) => ({ annee: e.annee, url, revise: e.revise }))].sort((a, b) => a.annee.localeCompare(b.annee)),
    sessions: [...gardees, ...extraits.flatMap((x) => x.e.sessions)].sort((a, b) => a.debut.localeCompare(b.debut)),
    journees: [...(gardees.length ? avant!.journees.filter((j) => j.date < debutLu || j.date > finLue) : []), ...extraits.flatMap((x) => x.e.journees)].sort((a, b) => a.date.localeCompare(b.date)),
  } satisfies CalendrierScolaire);

  const cle = (j: CalendrierScolaire["journees"][number]) => `${j.date}${j.au ? `→${j.au}` : ""} ${j.code ?? j.type} ${j.titre}`;
  const a = new Set(avant?.journees.map(cle) ?? []);
  const b = new Set(nouveau.journees.map(cle));
  const differences = [...[...a].filter((x) => !b.has(x)).map((x) => `- ${x}`), ...[...b].filter((x) => !a.has(x)).map((x) => `+ ${x}`)].sort((x, y) => x.slice(2).localeCompare(y.slice(2)));
  const texte = enYaml(nouveau);
  if (fs.existsSync(FICHIER) && texte === fs.readFileSync(FICHIER, "utf8")) {
    console.log("Le calendrier n'a pas changé.");
    return;
  }
  console.log(`Le calendrier a changé (${differences.length} différence(s)) :\n${differences.join("\n")}`);
  if (differences.length && CI) avertir(`le calendrier officiel a changé (${differences.length} différences) : lance « npm run calendrier » et fais un commit`);
  if (VERIFIER) process.exit(2);
  fs.writeFileSync(FICHIER, texte);
  console.log("data/calendrier-scolaire.yaml mis à jour.");
}

main().catch((e) => {
  avertir(`mise à jour impossible, on garde le calendrier existant : ${e.message}`);
  process.exit(1);
});
