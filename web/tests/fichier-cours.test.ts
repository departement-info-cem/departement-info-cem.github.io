import { describe, expect, it } from "vitest";
import type { EvenementProf } from "@/app/_types/prof";
import { calendrierScolaire, donneesMesCours, fichierCours, numerosFichiersCours } from "@/lib/donnees";
import { rencontresDuGroupe } from "@/lib/mes-cours";
import { dateDepuisIso } from "@/lib/temps";

// Référence : 420-5N6-EM (ancien numéro du 420-5M6-EM), groupe 1010, automne 2026, d'après la fiche figée de po.brillant (sans dates).
// Le site du cours (podates dans sidebars.js du dépôt 5N6-mobile-2) a 28 de ces 30 dates : il n'a pas le 28 octobre
// ni le 17 décembre, mais il a le 10 décembre (journée de reprise) et le 14 décembre (un lundi).
const PODATES = [
  "2026-08-26", "2026-08-27", "2026-09-02", "2026-09-03", "2026-09-09", "2026-09-10", "2026-09-16", "2026-09-17", "2026-09-23", "2026-09-24",
  "2026-09-30", "2026-10-01", "2026-10-07", "2026-10-08", "2026-10-21", "2026-10-22", "2026-10-29", "2026-11-04", "2026-11-05", "2026-11-12",
  "2026-11-18", "2026-11-19", "2026-11-25", "2026-11-26", "2026-12-02", "2026-12-03", "2026-12-09", "2026-12-10", "2026-12-14", "2026-12-23",
];

describe("fichierCours (420-5N6-EM)", () => {
  const date = dateDepuisIso("2026-11-27");
  const fichier = fichierCours("420-5N6-EM", date);
  const po = fichier.groupes.find((g) => g.prof.id === "po.brillant")!;

  it("donne le cours sous son numéro actuel, avec ses groupes", () => {
    expect(fichier).toMatchObject({ cours: "420-5M6-EM", nom: "Applications mobiles avancées" });
    expect(fichier.groupes.map((g) => [g.prof.id, g.groupe])).toEqual([["joris.deguet", "1020"], ["po.brillant", "1010"]]);
    expect(po).toMatchObject({
      prof: { id: "po.brillant", nom: "Pierre-Olivier Brillant" },
      session: "A2026",
      plages: [{ jour: "mercredi", debut: "14:00", fin: "17:00", local: "D-0704" }, { jour: "jeudi", debut: "08:00", fin: "11:00", local: "D-0704" }],
    });
  });

  it("donne l'abonnement d'agenda de chaque groupe et la semaine complète de chaque prof", () => {
    expect(po.agenda).toMatch(/^https:\/\/info\.cegepmontpetit\.ca\/(react\/)?agenda\/A2026-5M6-1010\.ics$/);
    const semaine = fichier.profs["po.brillant"];
    expect(semaine.page).toMatch(/\/po\.brillant\/horaire\/$/);
    // Ses autres cours (numéro actuel, groupe en texte) et ses dispos, pas seulement le 5M6
    expect(semaine.horaire.plages).toContainEqual(expect.objectContaining({ type: "cours", cours: "420-5M6-EM", nomCours: "Applications mobiles avancées", groupe: "1010", jour: "mercredi" }));
    expect(semaine.horaire.plages.some((x) => x.type === "cours" && x.cours !== "420-5M6-EM")).toBe(true);
    expect(semaine.horaire.plages.some((x) => x.type === "dispo" || x.type === "centre-aide")).toBe(true);
    expect(Object.keys(fichier.profs).sort()).toEqual(["joris.deguet", "po.brillant"]);
  });

  it("donne 30 rencontres numérotées pour le groupe 1010", () => {
    expect(po.rencontres).toHaveLength(30);
    expect(po.rencontres[0]).toEqual({ numero: 1, date: "2026-08-26", debut: "14:00", fin: "17:00", local: "D-0704", statut: "prevue" });
    expect(po.rencontres.map((r) => r.numero)).toEqual(po.rencontres.map((_, i) => i + 1));
    const dates = po.rencontres.map((r) => r.date);
    expect(dates.filter((d) => PODATES.includes(d))).toHaveLength(28);
    expect(dates.filter((d) => !PODATES.includes(d))).toEqual(["2026-10-28", "2026-12-17"]);
  });

  it("avec les deux déplacements de la vraie fiche, les rencontres numérotées tombent aux dates du site du cours", () => {
    const donnees = donneesMesCours(date);
    const groupe = donnees.groupes["420-5M6-EM"].find((g) => g.prof === "po.brillant" && g.groupe === "1010")!;
    const deplacements: EvenementProf[] = [
      { date: "2026-12-10", remplace: "2026-10-28", type: "deplacement", cours: "420-5M6-EM", groupe: "1010" },
      { date: "2026-12-14", remplace: "2026-12-17", type: "deplacement", cours: "420-5M6-EM", groupe: "1010" },
    ];
    const profs = { ...donnees.profs, "po.brillant": { ...donnees.profs["po.brillant"], calendrier: deplacements } };
    const rencontres = rencontresDuGroupe(groupe, profs, calendrierScolaire());
    expect(rencontres.filter((r) => r.numero).map((r) => r.date)).toEqual(PODATES);
    expect(rencontres.filter((r) => r.statut === "deplacee").map((r) => r.date)).toEqual(["2026-10-28", "2026-12-17"]);
    expect(rencontres.filter((r) => r.statut === "reprise").map((r) => [r.date, r.debut, r.fin])).toEqual([["2026-12-10", "14:00", "17:00"], ["2026-12-14", "08:00", "11:00"]]);
  });

  it("joint les dates de la fiche pour ce cours et ce groupe, sans les autres", () => {
    const joris = fichier.groupes.find((g) => g.prof.id === "joris.deguet")!;
    expect(joris.evenements).toEqual([{ date: "2026-10-19", titre: "Examen intra (20 %)", type: "examen", evaluation: "sommative" }]);
    expect(po.evenements).toEqual([]);
  });

  it("un cours sans groupe cette session a quand même son fichier", () => {
    expect(fichierCours("420-6X5-EM", date).groupes).toEqual([]);
    expect(numerosFichiersCours(date)).toEqual(expect.arrayContaining(["420-5M6-EM", "420-5N6-EM", "420-6X5-EM"]));
    expect(numerosFichiersCours(date).every((no) => no.startsWith("420-"))).toBe(true);
  });
});
