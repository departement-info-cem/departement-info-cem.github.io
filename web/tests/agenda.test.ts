import { describe, expect, it } from "vitest";
import { agendasDesGroupes, echapper, fichierAgenda, replier, seancesDuGroupe, texteAgenda } from "@/lib/agenda";
import { chemin } from "@/lib/chemins";
import { calendrierScolaire } from "@/lib/donnees";
import type { DonneesMesCours, GroupeCours } from "@/lib/mes-cours";

const groupe: GroupeCours = {
  cours: "420-5N6-EM",
  prof: "joris.deguet",
  groupe: "1020",
  session: "A2026",
  seances: [
    { jour: "lundi", debut: "15:00", fin: "18:00", local: "D-0624" },
    { jour: "mercredi", debut: "9:00", fin: "12:00", local: "D-0605" },
  ],
};
const donnees: DonneesMesCours = {
  groupes: { "420-5N6-EM": [groupe, { ...groupe, groupe: "1010", seances: [{ jour: "mardi", debut: "08:00", fin: "11:00" }] }] },
  profs: {
    "joris.deguet": {
      nom: "Joris Deguet",
      session: "A2026",
      cours: ["420-5N6-EM"],
      aide: [],
      dispos: [],
      calendrier: [
        { date: "2026-11-02", type: "absence" },
        { date: "2026-11-09", type: "absence", cours: "420-5N6-EM", groupe: "1010" },
        { date: "2026-12-10", remplace: "2026-12-02", type: "deplacement", cours: "420-5N6-EM", groupe: "1020" },
      ],
    },
  },
  cours: { "420-5N6-EM": { no: "420-5N6-EM", nom: "Applications mobiles", url: "https://exemple.org/5n6" } },
};
const seances = seancesDuGroupe(groupe, donnees, calendrierScolaire());
const le = (date: string) => seances.filter((s) => s.date === date);

describe("seancesDuGroupe", () => {
  it("une séance par jour de cours, avec titre, local, prof et rappel", () => {
    expect(le("2026-08-31")).toEqual([
      expect.objectContaining({ debut: "15:00", fin: "18:00", titre: "5N6 gr. 1020 · Applications mobiles", lieu: "D-0624", rappel: 15, url: "https://exemple.org/5n6" }),
    ]);
    expect(le("2026-08-31")[0].description).toContain("Prof : Joris Deguet");
    expect(le("2026-09-02")[0]).toMatchObject({ debut: "09:00", fin: "12:00", lieu: "D-0605" });
  });
  it("rien les jours de congé ni pendant la relâche", () => {
    expect(le("2026-09-07")).toEqual([]);
    for (const d of ["2026-10-12", "2026-10-14"]) expect(le(d)).toEqual([]);
  });
  it("suit l'horaire d'un autre jour", () => expect(le("2026-10-06")).toEqual([expect.objectContaining({ debut: "15:00" })]));
  it("une absence du prof annule la séance, sans rappel", () => {
    expect(le("2026-11-02")).toEqual([expect.objectContaining({ titre: "Annulé : 5N6 gr. 1020 · Applications mobiles", rappel: undefined })]);
  });
  it("l'absence d'un autre groupe ne change rien", () => expect(le("2026-11-09")[0].rappel).toBe(15));
  it("un cours déplacé paraît à sa nouvelle date", () => {
    expect(le("2026-12-02")[0]).toMatchObject({ titre: "Déplacé : 5N6 gr. 1020 · Applications mobiles", rappel: undefined });
    expect(le("2026-12-10")).toEqual([expect.objectContaining({ debut: "09:00", fin: "12:00", lieu: "D-0605", rappel: 15 })]);
    expect(le("2026-12-10")[0].description).toContain("Reprise du cours du mercredi 2 décembre.");
  });
  it("rien hors de la session", () => expect(seances.every((s) => s.date >= "2026-08-24" && s.date <= "2026-12-24")).toBe(true));
  it("des UID uniques et stables d'un build à l'autre", () => {
    expect(new Set(seances.map((s) => s.uid)).size).toBe(seances.length);
    expect(seancesDuGroupe(groupe, donnees, calendrierScolaire()).map((s) => s.uid)).toEqual(seances.map((s) => s.uid));
    expect(le("2026-08-31")[0].uid).toBe("2026-08-31-1500-A2026-5N6-1020@info.cegepmontpetit.ca");
  });
});

describe("fichierAgenda", () => {
  it("un fichier par groupe et par session", () => expect(fichierAgenda(groupe)).toBe("A2026-5N6-1020.ics"));
  it("pas de fichier sans horaire ou sans session", () => {
    expect(fichierAgenda({ ...groupe, seances: [] })).toBeNull();
    expect(fichierAgenda({ ...groupe, session: undefined })).toBeNull();
  });
  it("agendasDesGroupes donne un agenda par groupe", () => {
    const agendas = agendasDesGroupes(donnees, calendrierScolaire());
    expect([...agendas.keys()]).toEqual(["A2026-5N6-1020.ics", "A2026-5N6-1010.ics"]);
    expect(agendas.get("A2026-5N6-1020.ics")?.nom).toBe("5N6 gr. 1020 · Applications mobiles");
  });
});

describe("format iCalendar", () => {
  it("échappe le texte", () => expect(echapper("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne"));

  const octets = (s: string) => new TextEncoder().encode(s).length;
  const deplier = (s: string) => s.replace(/\r\n /g, "");
  it("replie les lignes à 75 octets sans couper un caractère", () => {
    for (const ligne of ["DESCRIPTION:" + "a".repeat(200), "SUMMARY:" + "é".repeat(100), "SUMMARY:" + "📅é".repeat(40)]) {
      const replie = replier(ligne);
      expect(replie.split("\r\n").every((l) => octets(l) <= 75)).toBe(true);
      expect(replie.split("\r\n").slice(1).every((l) => l.startsWith(" "))).toBe(true);
      expect(deplier(replie)).toBe(ligne);
    }
    expect(replier("SUMMARY:court")).toBe("SUMMARY:court");
  });

  const texte = texteAgenda("5N6 gr. 1020 · Applications mobiles", seances, new Date("2026-11-27T15:04:05.678Z"));
  it("un calendrier complet, en lignes CRLF de 75 octets au plus", () => {
    expect(texte.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(texte.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(texte.replace(/\r\n/g, "").includes("\n")).toBe(false);
    expect(texte.split("\r\n").every((l) => octets(l) <= 75)).toBe(true);
    expect(texte).toContain("X-WR-CALNAME:5N6 gr. 1020 · Applications mobiles\r\n");
    expect(texte).toContain("BEGIN:VTIMEZONE\r\nTZID:America/Toronto\r\n");
  });
  it("chaque séance a son heure de Montréal et son rappel", () => {
    const evenements = deplier(texte).split("BEGIN:VEVENT").slice(1);
    expect(evenements).toHaveLength(seances.length);
    const premier = evenements[0];
    expect(premier).toContain("UID:2026-08-24-1500-A2026-5N6-1020@info.cegepmontpetit.ca\r\n");
    expect(premier).toContain("DTSTAMP:20261127T150405Z\r\n");
    expect(premier).toContain("DTSTART;TZID=America/Toronto:20260824T150000\r\n");
    expect(premier).toContain("DTEND;TZID=America/Toronto:20260824T180000\r\n");
    expect(premier).toContain("LOCATION:D-0624\r\n");
    expect(premier).toContain(`DESCRIPTION:Prof : Joris Deguet\\nLocal : D-0624\\nPage du prof : https://info.cegepmontpetit.ca${chemin("/joris.deguet/")}\\nSite du cours : https://exemple.org/5n6\r\n`);
    expect(premier).toContain("BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:5N6 gr. 1020 · Applications mobiles (D-0624)\r\nTRIGGER:-PT15M\r\nEND:VALARM\r\n");
  });
  it("pas de rappel pour une séance annulée", () => {
    const annulee = deplier(texte).split("BEGIN:VEVENT").find((e) => e.includes("20261102T"))!;
    expect(annulee).toContain("SUMMARY:Annulé : 5N6 gr. 1020 · Applications mobiles\r\n");
    expect(annulee).not.toContain("VALARM");
  });
});
