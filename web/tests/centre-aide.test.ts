import { describe, expect, it } from "vitest";
import { aidants, aidantsHorsCentre, horaireCentreAide } from "@/lib/centre-aide";
import { donneesMesCours } from "@/lib/donnees";
import type { InfoProfMesCours } from "@/lib/mes-cours";
import { dateDepuisIso } from "@/lib/temps";
import { validerYamlProf } from "@/lib/validation";

const prof = (nom: string, aide: string[], type: "dispo" | "centre-aide", session = "A2026"): InfoProfMesCours => ({
  nom, session, cours: [], aide, calendrier: [], dispos: [{ jour: "lundi", debut: "11:00", fin: "12:00", type }],
});
const profs = {
  a: prof("Ana", ["420-5M6-EM", "420-SN1-RE"], "centre-aide"),
  b: prof("Bob", ["420-1P6-EM"], "centre-aide"),
  c: prof("Cléo", ["420-5M6-EM"], "dispo"),
  d: prof("Dan", ["420-5M6-EM"], "centre-aide", "H2026"),
};

describe("centre d'aide", () => {
  it("sans cours : toutes les présences de la session", () => expect(aidants(profs, { session: "A2026" }).map((a) => a.id)).toEqual(["a", "b"]));
  it("mes cours : seulement les profs qui peuvent y aider, avec les cours en commun", () => {
    const liste = aidants(profs, { cours: ["420-5M6-EM", "420-3W6-EM"], session: "A2026" });
    expect(liste.map((a) => [a.id, a.cours])).toEqual([["a", ["420-5M6-EM"]]]);
    expect(horaireCentreAide(liste, true)[0]).toMatchObject({ titre: "Ana · 5M6", type: "centre-aide" });
  });
  it("une simple dispo n'est pas du centre d'aide", () => {
    expect(aidants(profs, { cours: ["420-5M6-EM"] }).map((a) => a.id)).not.toContain("c");
    expect(aidantsHorsCentre(profs, "420-5M6-EM", "A2026").map((a) => a.id)).toEqual(["c"]);
  });
  it("les cours donnés comptent d'office, en numéros canoniques", () =>
    expect(donneesMesCours(dateDepuisIso("2026-11-25")).profs["joris.deguet"].aide).toEqual(expect.arrayContaining(["420-5M6-EM", "420-SN1-RE"])));
  it("refuse un sigle lu comme un nombre (4E4) ou mal écrit", () => {
    const erreurs = (aide: string) => validerYamlProf(`nom: T\ncourriel: a.b\naide: ${aide}\n`).problemes.map((p) => p.message).join();
    expect(erreurs("[4E4]")).toContain("420-");
    expect(erreurs("[1P6]")).toContain("420-");
    expect(erreurs("[420-4E4-EM, 360-4A3-EM]")).toBe("");
  });
});
