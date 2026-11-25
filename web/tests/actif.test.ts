import { describe, expect, it } from "vitest";
import { estActif } from "@/lib/actif";
import { calendrierScolaire, profs } from "@/lib/donnees";
import { dateDepuisIso } from "@/lib/temps";

const actif = (prof: Parameters<typeof estActif>[0], iso = "2026-11-25") => estActif(prof, calendrierScolaire(), dateDepuisIso(iso));
const A2026 = { session: "A2026", cours: ["420-1P6-EM"] };

describe("estActif", () => {
  it("un prof qui a des cours cette session", () => {
    expect(actif(A2026)).toBe(true);
    expect(profs().every((p) => actif(p))).toBe(true);
  });
  it("des cours seulement dans l'horaire", () =>
    expect(actif({ session: "A2026", horaire: { debut: "08:00", fin: "18:00", plages: [{ jour: "lundi", debut: "08:00", fin: "10:00", type: "cours", cours: "420-1P6-EM" }] } })).toBe(true));
  it("pas de cours : pas actif", () => {
    expect(actif({})).toBe(false);
    expect(actif({ session: "A2026", cours: [] })).toBe(false);
    expect(actif({ session: "A2026", horaire: { debut: "08:00", fin: "18:00", plages: [{ jour: "lundi", debut: "08:00", fin: "10:00", type: "dispo" }] } })).toBe(false);
  });
  it("le champ actif l'emporte sur le calcul", () => {
    expect(actif({ actif: true })).toBe(true);
    expect(actif({ ...A2026, actif: false })).toBe(false);
  });
  it("une fiche d'automne vaut encore pendant les Fêtes et au début de l'hiver, pas après", () => {
    expect(actif(A2026, "2027-01-10")).toBe(true);
    expect(actif(A2026, "2027-02-24")).toBe(true);
    expect(actif(A2026, "2027-02-25")).toBe(false);
  });
  it("une fiche d'hiver vaut encore l'été", () => expect(actif({ ...A2026, session: "H2027" }, "2027-07-15")).toBe(true));
  it("une fiche déjà prête pour la prochaine session, ou d'une session hors calendrier", () => {
    expect(actif({ ...A2026, session: "H2027" })).toBe(true);
    expect(actif({ ...A2026, session: "E2027" }, "2027-07-15")).toBe(true);
    expect(actif({ ...A2026, session: "A2024" })).toBe(false);
  });
});
