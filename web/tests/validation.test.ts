import { describe, expect, it } from "vitest";
import { validerYamlProf } from "@/lib/validation";
import { modeleProf } from "@/lib/donnees";

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
  it("signale du YAML mal formé", () => expect(messages("nom: [Test\ncourriel: x")[0].message).toContain("YAML mal formé"));
  it("refuse un identifiant réservé", () => expect(messages("nom: Test\ncourriel: faq\n", { id: "faq" })[0].message).toContain("nom d'une page"));
  it("refuse un courriel différent du nom de fichier", () => expect(messages("nom: Test\ncourriel: a.b\n", { id: "c.d" })[0].message).toContain("identique au nom du fichier"));
  it("refuse une photo absente", () => expect(messages("nom: Test\ncourriel: a.b\nphoto: x.jpg\n", { photosConnues: new Set() })[0].message).toContain("n'existe pas"));
});
