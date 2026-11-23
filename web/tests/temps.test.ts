import { describe, expect, it } from "vitest";
import { heureEnMinutes, jourDeLaSemaine, dateDepuisIso, normaliserJour } from "@/lib/temps";

describe("normaliserJour", () => {
  it.each([["lundi", "lundi"], ["Mardi", "mardi"], ["wed", "mercredi"], ["venus di", "vendredi"], ["jupiter di", "jeudi"]])("%s -> %s", (entree, attendu) => {
    expect(normaliserJour(entree)).toBe(attendu);
  });
  it("refuse un jour mal écrit", () => expect(normaliserJour("mecredi")).toBeNull());
});

describe("heureEnMinutes", () => {
  it("accepte 8:00 et 08:00", () => {
    expect(heureEnMinutes("8:00")).toBe(480);
    expect(heureEnMinutes("08:30")).toBe(510);
  });
  it("refuse une heure invalide", () => {
    expect(heureEnMinutes("25:00")).toBeNull();
    expect(heureEnMinutes("huit")).toBeNull();
  });
});

it("jourDeLaSemaine : le 2026-11-23 est un lundi", () => expect(jourDeLaSemaine(dateDepuisIso("2026-11-23"))).toBe("lundi"));
