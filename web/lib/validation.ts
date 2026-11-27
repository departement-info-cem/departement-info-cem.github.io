// Validation d'un fichier YAML de prof, utilisée :
//  - par scripts/valider-donnees.ts (GitHub Actions) ;
//  - par l'aperçu en direct de la page « Modifier mon profil » (dans le navigateur).
import YAML, { isNode, LineCounter } from "yaml";
import { profSchema, type Prof } from "@/app/_types/prof";
import { heureEnMinutes, normaliserJour } from "@/lib/temps";

export type Probleme = { niveau: "erreur" | "avertissement"; ligne?: number; message: string };

/** Noms de pages du site : un prof ne peut pas avoir l'un de ces identifiants. */
export const ROUTES_RESERVEES = [
  "profs", "programmes", "orientation", "faq", "nouveau", "git", "logiciels", "plagiat",
  "contact", "modifier-mon-profil", "photos", "_next", "index", "maintenant", "calendrier", "cours-service", "sites", "jeux", "images", "mes-cours", "centre-aide",
];

function cheminLisible(chemin: PropertyKey[]): string {
  return chemin.map((p) => (typeof p === "number" ? `${p + 1}${p === 0 ? "er" : "e"} élément` : String(p))).join(" → ");
}

export function validerYamlProf(
  texte: string,
  options: { id?: string; coursConnus?: Set<string>; photosConnues?: Set<string> } = {},
): { prof?: Prof; problemes: Probleme[] } {
  const compteur = new LineCounter();
  const doc = YAML.parseDocument(texte, { lineCounter: compteur, prettyErrors: false });
  const problemes: Probleme[] = [];

  for (const e of doc.errors) {
    problemes.push({
      niveau: "erreur",
      ligne: e.linePos?.[0]?.line,
      message: `YAML mal formé : ${e.message.split("\n")[0]} (vérifie l'indentation, les deux-points et les guillemets)`,
    });
  }
  if (problemes.length) return { problemes };

  const ligneDe = (chemin: PropertyKey[]): number | undefined => {
    for (let n = chemin.length; n >= 0; n--) {
      const noeud = doc.getIn(chemin.slice(0, n) as (string | number)[], true);
      if (isNode(noeud) && noeud.range) return compteur.linePos(noeud.range[0]).line;
    }
    return undefined;
  };

  const resultat = profSchema.safeParse(doc.toJS());
  if (!resultat.success) {
    for (const i of resultat.error.issues) {
      let message = i.message;
      if (i.code === "unrecognized_keys") message = `champ inconnu : ${i.keys.join(", ")} (faute de frappe ?)`;
      const chemin = cheminLisible(i.path);
      problemes.push({ niveau: "erreur", ligne: ligneDe(i.path), message: chemin ? `${chemin} : ${message}` : message });
    }
    return { problemes };
  }

  const donnees = resultat.data;
  const id = options.id ?? donnees.courriel;
  const prof: Prof = { ...donnees, id };

  if (options.id && donnees.courriel !== options.id) {
    problemes.push({ niveau: "erreur", ligne: ligneDe(["courriel"]), message: `le courriel (${donnees.courriel}) doit être identique au nom du fichier (${options.id}.yaml)` });
  }
  if (ROUTES_RESERVEES.includes(id)) {
    problemes.push({ niveau: "erreur", message: `« ${id} » est le nom d'une page du site, choisis un autre nom de fichier` });
  }
  if (donnees.photo && options.photosConnues && !options.photosConnues.has(donnees.photo)) {
    problemes.push({ niveau: "erreur", ligne: ligneDe(["photo"]), message: `la photo ${donnees.photo} n'existe pas dans data/photos/ (attention aux majuscules)` });
  }
  if (options.coursConnus) {
    const verifier = (no: string | undefined, chemin: PropertyKey[]) => {
      if (no && !options.coursConnus!.has(no.toUpperCase())) {
        problemes.push({ niveau: "avertissement", ligne: ligneDe(chemin), message: `le cours ${no} n'est pas dans data/cours.yaml (il sera affiché sans lien)` });
      }
    };
    donnees.cours?.forEach((c, i) => verifier(c, ["cours", i]));
    donnees.horaire?.plages.forEach((p, i) => verifier(p.cours, ["horaire", "plages", i, "cours"]));
  }

  // Avertissement : plages qui se chevauchent le même jour
  const plages = donnees.horaire?.plages ?? [];
  plages.forEach((a, i) =>
    plages.slice(i + 1).forEach((b, k) => {
      if (normaliserJour(a.jour) !== normaliserJour(b.jour)) return;
      const [ad, af, bd, bf] = [a.debut, a.fin, b.debut, b.fin].map((h) => heureEnMinutes(h)!);
      if (ad < bf && bd < af) {
        problemes.push({
          niveau: "avertissement",
          ligne: ligneDe(["horaire", "plages", i + 1 + k]),
          message: `deux plages se chevauchent le ${normaliserJour(a.jour)} (${a.debut}-${a.fin} et ${b.debut}-${b.fin})`,
        });
      }
    }),
  );

  return { prof, problemes };
}
