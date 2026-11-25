import { describe, expect, it } from "vitest";
import { aidants, aidantsHorsCentre, horaireCentreAide } from "@/lib/centre-aide";
import { donneesMesCours } from "@/lib/donnees";
import { occupationsLocal, presencesCentreAide } from "@/lib/maintenant";
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

describe("présences dans un local", () => {
  const p = { id: "a.b", nom: "A B", session: "A2026", plages: [{ jour: "lundi", debut: "11:00", fin: "12:00", type: "centre-aide" as const, local: "D0008" }, { jour: "mardi", debut: "11:00", fin: "12:00", type: "dispo" as const, local: "D-0008" }] };
  it("garde le centre d'aide de ce local et de cette session, avec le nom du prof", () => {
    expect(presencesCentreAide("D-0008", "A2026", [p])).toMatchObject([{ jour: "lundi", titre: "Centre d'aide : A B", type: "centre-aide" }]);
    expect(presencesCentreAide("D-0007", "A2026", [p])).toEqual([]);
    expect(presencesCentreAide("D-0008", "H2027", [p])).toEqual([]);
  });
  it("réunit les profs présents à la même heure", () => {
    const q = { ...p, id: "c.d", nom: "C D", plages: [{ ...p.plages[0], debut: "11h00", local: "D-0008" }] };
    expect(presencesCentreAide("D-0008", "A2026", [p, q]).map((x) => x.titre)).toEqual(["Centre d'aide : A B, C D"]);
  });
  it("ne rend pas le local occupé", () => expect(occupationsLocal("D-0008", "A2026", undefined, [p])).toEqual([]));
});
