import { describe, expect, it } from "vitest";
import type { EvenementProf, Plage } from "@/app/_types/prof";
import { numeroterSeances, seancesDeLaSession } from "@/lib/calendrier";
import { calendrierScolaire, fichierCours, numerosFichiersCours } from "@/lib/donnees";
import { dateDepuisIso } from "@/lib/temps";

const scolaire = calendrierScolaire();
const cours = (jour: string, debut: string, fin: string): Plage => ({ jour, debut, fin, type: "cours", cours: "420-1P6-EM", groupe: "1010", local: "D-0601" });
const plages: Plage[] = [cours("lundi", "08:00", "11:00"), cours("mercredi", "13:00", "16:00"), { jour: "mercredi", debut: "09:00", fin: "10:00", type: "dispo" }];
const evenements: EvenementProf[] = [
  { date: "2026-11-02", type: "absence" }, // toute la journée
  { date: "2026-11-18", type: "absence", debut: "08:00", fin: "12:00" }, // le matin : le cours de 13 h a lieu
  { date: "2026-11-25", type: "absence", debut: "15:00", fin: "16:00" }, // la fin du cours : il est annulé
  { date: "2026-11-11", remplace: "2026-11-09", type: "deplacement", cours: "420-1P6-EM", local: "D-0003" }, // repris un mercredi
  { date: "2026-12-10", remplace: "2026-11-16", type: "deplacement", cours: "420-1P6-EM", groupe: "1020" }, // un autre groupe
];
const seances = seancesDeLaSession(scolaire, { plages, evenements, sessionId: "A2026" });
const statut = (date: string) => seances.filter((s) => s.date === date).map((s) => s.statut);

describe("seancesDeLaSession", () => {
  it("suit le calendrier scolaire", () => {
    const dates = seances.map((s) => s.date);
    expect(dates.slice(0, 2)).toEqual(["2026-08-24", "2026-08-26"]);
    expect(dates).toContain("2026-10-06"); // mardi qui suit l'horaire du lundi
    expect(dates).toContain("2026-12-14"); // évaluations selon l'horaire régulier
    for (const d of ["2026-09-07", "2026-10-05", "2026-10-12", "2026-10-14", "2026-11-11", "2026-12-16"]) expect(dates).not.toContain(d);
    expect(seances.every((s) => s.plage.type === "cours")).toBe(true);
  });
  it("annule les séances d'une absence, ou seulement celles qu'elle chevauche", () => {
    expect(statut("2026-11-02")).toEqual(["annulé"]);
    expect(statut("2026-11-18")).toEqual(["normal"]);
    expect(statut("2026-11-25")).toEqual(["annulé"]);
  });
  it("déplace la séance visée, pas celles d'un autre groupe", () => {
    expect(seances.find((s) => s.date === "2026-11-09")).toMatchObject({ statut: "déplacé", deplacement: { date: "2026-11-11" } });
    expect(statut("2026-11-16")).toEqual(["normal"]);
  });
  it("rien sans session connue", () => expect(seancesDeLaSession(scolaire, { plages, sessionId: "H2099" })).toEqual([]));
});

describe("numeroterSeances", () => {
  const numerotees = numeroterSeances(seances);
  it("numérote les séances qui ont lieu, dans l'ordre où elles ont lieu", () => {
    const tenues = numerotees.filter((s) => s.statut !== "annulé");
    expect(tenues.map((s) => s.n)).toEqual(tenues.map((_, i) => i + 1));
    expect(numerotees.map((s) => s.date)).toEqual([...numerotees.map((s) => s.date)].sort());
  });
  it("une séance annulée n'a pas de numéro : la matière passe à la suivante", () => {
    const i = numerotees.findIndex((s) => s.date === "2026-11-02");
    expect(numerotees[i]).toEqual({ date: "2026-11-02", debut: "08:00", fin: "11:00", local: "D-0601", statut: "annulé" });
    expect(numerotees[i + 1].n).toBe(numerotees[i - 1].n! + 1);
  });
  it("une séance déplacée prend son rang à sa nouvelle date, avec son heure et son nouveau local", () => {
    const d = numerotees.find((s) => s.statut === "déplacé")!;
    expect(d).toMatchObject({ date: "2026-11-11", remplace: "2026-11-09", debut: "08:00", fin: "11:00", local: "D-0003" });
    const veille = numerotees.find((s) => s.date === "2026-11-04")!;
    expect(d.n).toBe(veille.n! + 1);
  });
});

// Référence : 420-5N6-EM (ancien numéro du 420-5M6-EM), groupe 1010, automne 2026, d'après la fiche de po.brillant.
// Le site du cours (podates dans sidebars.js du dépôt 5N6-mobile-2) a 28 de ces 30 dates : il n'a pas le 28 octobre
// ni le 17 décembre, mais il a le 10 décembre (journée de reprise) et le 14 décembre (un lundi).
const PODATES = [
  "2026-08-26", "2026-08-27", "2026-09-02", "2026-09-03", "2026-09-09", "2026-09-10", "2026-09-16", "2026-09-17", "2026-09-23", "2026-09-24",
  "2026-09-30", "2026-10-01", "2026-10-07", "2026-10-08", "2026-10-21", "2026-10-22", "2026-10-29", "2026-11-04", "2026-11-05", "2026-11-12",
  "2026-11-18", "2026-11-19", "2026-11-25", "2026-11-26", "2026-12-02", "2026-12-03", "2026-12-09", "2026-12-10", "2026-12-14", "2026-12-23",
];

describe("fichierCours (420-5N6-EM)", () => {
  const fichier = fichierCours("420-5N6-EM", dateDepuisIso("2026-11-27"));
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

  it("calcule 30 séances pour le groupe 1010", () => {
    expect(po.seances).toHaveLength(30);
    expect(po.seances[0]).toEqual({ n: 1, date: "2026-08-26", debut: "14:00", fin: "17:00", local: "D-0704", statut: "normal" });
    expect(po.seances.map((s) => s.n)).toEqual(po.seances.map((_, i) => i + 1));
    const dates = po.seances.map((s) => s.date);
    expect(dates.filter((d) => PODATES.includes(d))).toHaveLength(28);
    expect(dates.filter((d) => !PODATES.includes(d))).toEqual(["2026-10-28", "2026-12-17"]);
  });

  it("deux déplacements dans la fiche redonnent exactement les dates du site du cours", () => {
    const deplacements: EvenementProf[] = [
      { date: "2026-12-10", remplace: "2026-10-28", type: "deplacement", cours: "420-5M6-EM", groupe: "1010" },
      { date: "2026-12-14", remplace: "2026-12-17", type: "deplacement", cours: "420-5M6-EM", groupe: "1010" },
    ];
    const avec = numeroterSeances(seancesDeLaSession(scolaire, { plages: po.plages.map((p) => ({ ...p, type: "cours", cours: "420-5M6-EM", groupe: "1010" })), evenements: deplacements, sessionId: "A2026" }));
    expect(avec.map((s) => s.date)).toEqual(PODATES);
  });

  it("joint les dates de la fiche pour ce cours et ce groupe, sans les autres", () => {
    const joris = fichier.groupes.find((g) => g.prof.id === "joris.deguet")!;
    expect(joris.evenements).toEqual([{ date: "2026-10-19", titre: "Examen intra (20 %)", type: "examen", evaluation: "sommative" }]);
    expect(po.evenements).toEqual([]);
  });

  it("un cours sans groupe cette session a quand même son fichier", () => {
    expect(fichierCours("420-6X5-EM", dateDepuisIso("2026-11-27")).groupes).toEqual([]);
    expect(numerosFichiersCours(dateDepuisIso("2026-11-27"))).toEqual(expect.arrayContaining(["420-5M6-EM", "420-5N6-EM", "420-6X5-EM"]));
    expect(numerosFichiersCours(dateDepuisIso("2026-11-27")).every((no) => no.startsWith("420-"))).toBe(true);
  });
});
