// Après le build : recopie sous out/react/ les fichiers que des programmes lisent à leur ancienne adresse.
// Les pages /react/... sont redirigées par la page 404 (lib/redirections.ts), mais pas ceux-ci :
//  - /react/agenda/*.ics : les agendas des téléphones y sont abonnés et n'exécutent pas de JavaScript ;
//  - /react/donnees/cours/*.json : les sites de cours (depinfo-gabarit) les lisent avec fetch().
// Le contenu est le même qu'à la racine (les adresses qu'il contient pointent vers la racine).
import fs from "node:fs";
import path from "node:path";

const out = path.resolve(__dirname, "..", "out");
const DOSSIERS = ["agenda", "donnees"];

for (const d of DOSSIERS) {
  const source = path.join(out, d);
  if (!fs.existsSync(source)) {
    console.error(`out/${d}/ introuvable : lancer « next build » d'abord.`);
    process.exit(1);
  }
  fs.cpSync(source, path.join(out, "react", d), { recursive: true });
  console.log(`out/${d}/ recopié dans out/react/${d}/ (${fs.readdirSync(source, { recursive: true }).length} fichiers)`);
}
