import { describe, expect, it } from "vitest";
import { validerYamlProf } from "@/lib/validation";
import { modeleProf } from "@/lib/donnees";
import { lienSiteOuWeb, urlWeb } from "@/app/_types/liens";

const base = (plage: string) => `nom: Test\ncourriel: test.prof\nhoraire:\n  plages:\n    - ${plage}\n`;
const messages = (yaml: string, options = {}) => validerYamlProf(yaml, options).problemes;

describe("validerYamlProf", () => {
  it("accepte le modèle", () => expect(messages(modeleProf())).toEqual([]));
  it("signale un jour mal écrit avec sa ligne", () => {
    const [p] = messages(base('{ jour: mecredi, debut: "08:00", fin: "10:00", type: dispo }'));
    expect(p.message).toContain("jour inconnu « mecredi »");
    expect(p.ligne).toBe(5);
  });
  it("signale une fin avant le début", () => expect(messages(base('{ jour: lundi, debut: "10:00", fin: "08:00", type: dispo }'))[0].message).toContain("doit être après le début"));
  it("signale un champ inconnu", () => expect(messages("nom: Test\ncourriel: test.prof\nburreau: E-211\n")[0].message).toContain("champ inconnu : burreau"));
  it("refuse le motif d'une absence", () =>
    expect(messages("nom: Test\ncourriel: test.prof\ncalendrier:\n  - { date: 2027-04-05, titre: Colloque, type: absence }\n")[0].message).toContain("Cours annulé"));
  it("refuse le poste téléphonique", () => expect(messages('nom: Test\ncourriel: test.prof\nposte: "2575"\n')[0].message).toContain("champ inconnu : poste"));
  it("signale du YAML mal formé", () => expect(messages("nom: [Test\ncourriel: x")[0].message).toContain("YAML mal formé"));
  it("refuse un identifiant réservé", () => expect(messages("nom: Test\ncourriel: faq\n", { id: "faq" })[0].message).toContain("nom d'une page"));
  it("refuse un courriel différent du nom de fichier", () => expect(messages("nom: Test\ncourriel: a.b\n", { id: "c.d" })[0].message).toContain("identique au nom du fichier"));
  it("refuse une photo absente", () => expect(messages("nom: Test\ncourriel: a.b\nphoto: x.jpg\n", { photosConnues: new Set() })[0].message).toContain("n'existe pas"));
  it("refuse un site en javascript:", () => expect(messages('nom: Test\ncourriel: test.prof\nsite: "javascript:alert(1)"\n')[0].message).toContain("site : adresse web invalide"));
  it("accepte un site en https", () => expect(messages("nom: Test\ncourriel: test.prof\nsite: https://exemple.com\n")).toEqual([]));
});

describe("liens dans les données", () => {
  it("urlWeb n'accepte que http et https", () => {
    for (const u of ["javascript:alert(1)", "data:text/html,x", "mailto:a@b.c"]) expect(urlWeb().safeParse(u).success).toBe(false);
    expect(urlWeb().safeParse("https://www.cegepmontpetit.ca").success).toBe(true);
  });
  it("lienSiteOuWeb accepte une page du site, pas un autre domaine déguisé", () => {
    expect(lienSiteOuWeb.safeParse("/programmes/dec-prog").success).toBe(true);
    expect(lienSiteOuWeb.safeParse("//exemple.com").success).toBe(false);
    expect(lienSiteOuWeb.safeParse("javascript:alert(1)").success).toBe(false);
  });
});
