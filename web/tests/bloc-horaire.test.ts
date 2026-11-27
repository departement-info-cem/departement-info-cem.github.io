import { describe, expect, it } from "vitest";
import { textesPlage } from "@/components/bloc-horaire";
import { nomCourt } from "@/lib/texte";

const cours = { "420-5M6-EM": { no: "420-5M6-EM", nom: "Applications mobiles avancées" } };
const plage = { jour: "lundi", debut: "08:00", fin: "11:00" };

describe("texte des blocs d'horaire", () => {
  it.each([["Pierre-Olivier Brillant", "P.-O. Brillant"], ["Éric B. Gendron", "É. B. Gendron"], ["David Gagné-Leroux", "D. Gagné-Leroux"], ["Ana", "Ana"]])("abrège %s", (nom, attendu) => expect(nomCourt(nom)).toBe(attendu));
  it("un cours connu porte son nom officiel, même si la fiche lui donne un titre", () =>
    expect(textesPlage({ ...plage, type: "cours", cours: "420-5M6-EM", groupe: "1010", titre: "Mobile du lundi" }, cours)).toMatchObject({ titre: "Applications mobiles avancées", sigleCourt: "5M6 gr. 1010", nomCours: "" }));
  it("ne répète pas le sigle du titre d'un cours inconnu, mais le garde au complet pour le détail", () =>
    expect(textesPlage({ ...plage, type: "cours", cours: "420-ZZ9-EM", groupe: "1010", titre: "Atelier ZZ9" }, cours)).toMatchObject({ titre: "Atelier ZZ9", sigleCourt: "gr. 1010", sigle: "420-ZZ9-EM gr. 1010", nomCours: "" }));
  it("sans titre : le nom du cours, puis le sigle", () =>
    expect(textesPlage({ ...plage, type: "cours", cours: "420-5M6-EM" }, cours)).toMatchObject({ titre: "Applications mobiles avancées", sigleCourt: "5M6", nomCours: "" }));
  it("sans titre, une présence porte le nom du prof ; avec un titre, les noms suivent", () => {
    expect(textesPlage({ ...plage, type: "centre-aide", noms: ["Joris Deguet"] }, cours)).toMatchObject({ titre: "Joris Deguet", titreCourt: "J. Deguet", noms: [] });
    expect(textesPlage({ ...plage, type: "centre-aide", titre: "Centre d'aide", noms: ["Joris Deguet"] }, cours)).toMatchObject({ titreCourt: "Centre d'aide", noms: ["Joris Deguet"] });
  });
});
