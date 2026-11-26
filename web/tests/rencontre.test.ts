import { describe, expect, it } from "vitest";
import type { Plage } from "@/app/_types/prof";
import { creneauxCommuns, meilleursCreneaux, type ProfRencontre } from "@/lib/rencontre";

const plage = (jour: string, debut: string, fin: string, type: Plage["type"] = "cours") => ({ jour, debut, fin, type }) as Plage;
const prof = (id: string, ...plages: Plage[]): ProfRencontre => ({ id, nom: id, plages });
const h = (x: number) => x * 60;
const options = { debut: h(8), fin: h(18), duree: 60, disposLibres: false };

describe("trouver une rencontre", () => {
  const a = prof("a", plage("lundi", "08:00", "12:00"), plage("lundi", "13:00", "18:00"));
  const b = prof("b", plage("lundi", "10:00", "11:00"), plage("lundi", "14:00", "15:00", "dispo"));

  it("trouve le trou commun, sans dépasser la journée", () => {
    const lundi = creneauxCommuns([a, b], options).filter((c) => c.jour === "lundi");
    expect(lundi).toEqual([{ jour: "lundi", debut: h(12), fin: h(13), absents: [] }]);
  });

  it("une journée sans rien est libre au complet", () => {
    expect(creneauxCommuns([a, b], options).find((c) => c.jour === "mardi")).toEqual({ jour: "mardi", debut: h(8), fin: h(18), absents: [] });
  });

  it("écarte les créneaux trop courts", () => {
    expect(creneauxCommuns([a, b], { ...options, duree: 90 }).some((c) => c.jour === "lundi")).toBe(false);
  });

  it("les dispos sont prises, sauf si on les compte comme libres", () => {
    const c = prof("c", plage("mardi", "08:00", "18:00", "dispo"));
    expect(creneauxCommuns([c], options).some((x) => x.jour === "mardi")).toBe(false);
    expect(creneauxCommuns([c], { ...options, disposLibres: true }).some((x) => x.jour === "mardi")).toBe(true);
  });

  it("sans moment commun, propose ceux où il manque le moins de monde", () => {
    const occupe = (id: string, autre: string) =>
      prof(id, ...["lundi", "mardi", "mercredi", "jeudi", "vendredi"].map((j) => plage(j, "08:00", "18:00")).slice(0, id === autre ? 5 : 4));
    // x est pris toute la semaine ; y est libre le vendredi
    const x = occupe("x", "x");
    const y = occupe("y", "x");
    expect(creneauxCommuns([x, y], options)).toEqual([]);
    expect(meilleursCreneaux([x, y], options)[0]).toEqual({ jour: "vendredi", debut: h(8), fin: h(18), absents: ["x"] });
  });
});
