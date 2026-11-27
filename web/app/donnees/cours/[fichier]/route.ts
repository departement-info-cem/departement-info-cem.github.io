// /donnees/cours/420-5N6-EM.json (recopié sous /react/donnees/ : scripts/anciennes-adresses.ts) : un fichier par cours, écrit au build, pour les sites de cours.
// Ils y lisent qui donne chaque groupe, quand et où (séances datées et numérotées), au lieu de le recopier.
import { fichierCours, numerosFichiersCours } from "@/lib/donnees";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return numerosFichiersCours().map((no) => ({ fichier: `${no}.json` }));
}

export async function GET(_requete: Request, { params }: RouteContext<"/donnees/cours/[fichier]">) {
  const { fichier } = await params;
  return Response.json(fichierCours(fichier.replace(/\.json$/, "")));
}
