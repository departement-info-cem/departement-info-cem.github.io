import { describe, expect, it } from "vitest";
import { construireCalendrier, semainesDuMois } from "@/lib/calendrier";
import { calendrierScolaire, laboratoires, profs, profsHoraire } from "@/lib/donnees";
import { positionnerPlages } from "@/lib/horaire";
import { analyserCalendrier, type TextePdf } from "@/lib/calendrier-pdf";
import { fusionnerDispos } from "@/lib/horaire";
import { etatLabo, etatProf, occupationsLocal, normaliserLocal, prochaineDispo, profsUtiles, resumeMaintenant } from "@/lib/maintenant";
import fixture from "./fixtures/calendrier-2026-2027.json";
import type { Plage } from "@/app/_types/prof";

const plages: Plage[] = [
  { jour: "lundi", debut: "08:00", fin: "11:00", type: "cours", cours: "420-1P6-EM" },
  { jour: "mardi", debut: "13:00", fin: "16:00", type: "cours", cours: "420-2P6-EM" },
  { jour: "lundi", debut: "13:00", fin: "14:00", type: "dispo" },
];
const cal = construireCalendrier(calendrierScolaire(), {
  plages,
  evenements: [{ date: "2026-11-03", au: "2026-11-04", titre: "Colloque", type: "absence" }],
  sessionId: "A2026",
});
const seances = (iso: string) => cal.get(iso)?.evenements.filter((e) => e.source === "seance").map((e) => e.cours) ?? [];

describe("construireCalendrier", () => {
  it("place les cours un jour normal", () => {
    expect(seances("2026-08-31")).toEqual(["420-1P6-EM"]);
    expect(seances("2026-09-01")).toEqual(["420-2P6-EM"]);
  });
  it("ne projette que les cours, pas les dispos", () => expect(seances("2026-08-31")).toHaveLength(1));
  it("pas de cours un jour férié", () => {
    expect(cal.get("2026-09-07")?.sansCours).toBe(true);
    expect(seances("2026-09-07")).toEqual([]);
  });
  it("mardi 6 octobre suit l'horaire du lundi", () => expect(seances("2026-10-06")).toEqual(["420-1P6-EM"]));
  it("rien hors de la session", () => expect(seances("2027-01-11")).toEqual([]));
  it("étale un événement sur plusieurs jours", () => {
    for (const d of ["2026-11-03", "2026-11-04"]) expect(cal.get(d)?.evenements.some((e) => e.titre === "Colloque")).toBe(true);
  });
});

it("semainesDuMois commence un lundi et couvre le mois", () => {
  for (let m = 0; m < 12; m++) {
    const s = semainesDuMois(2026, m);
    expect(s[0][0].getDay()).toBe(1);
    const jours = s.flat().filter((d) => d.getMonth() === m).length;
    expect(jours).toBe(new Date(2026, m + 1, 0).getDate());
  }
});

it("positionnerPlages met côte à côte les plages qui se chevauchent", () => {
  const p = positionnerPlages([
    { jour: "vendredi", debut: "08:00", fin: "11:00", type: "cours" },
    { jour: "vendredi", debut: "10:00", fin: "11:00", type: "centre-aide" },
    { jour: "vendredi", debut: "11:00", fin: "12:00", type: "dispo" },
  ]).vendredi;
  expect(p.map((x) => [x.colonne, x.colonnes])).toEqual([[0, 2], [1, 2], [0, 1]]);
});

// ---------- Calendrier officiel (PDF) ----------
const textes: TextePdf[] = (fixture as [number, number, number, number, string][]).map(([x, y, l, h, t]) => ({ x, y, l, h, t }));

describe("analyserCalendrier", () => {
  const c = analyserCalendrier(textes);
  const du = (iso: string) => c.journees.filter((j) => j.date <= iso && iso <= (j.au ?? j.date)).map((j) => j.code ?? j.type);
  it("lit les sessions et la date de révision", () => {
    expect(c).toMatchObject({ annee: "2026-2027", revise: "2026-11-17" });
    expect(c.sessions).toMatchObject([
      { id: "A2026", debut: "2026-08-24", fin: "2026-12-24" },
      { id: "H2027", debut: "2027-01-25", fin: "2027-06-01" },
    ]);
  });
  it("lit la relâche, les JR et les EC", () => {
    expect(du("2026-10-14")).toEqual(["relache", "JM"]);
    expect(du("2027-03-16")).toEqual(["relache", "JP"]);
    expect(du("2026-11-11")).toEqual(["JR*"]);
    for (const d of ["2026-12-10", "2027-04-07", "2027-05-18", "2027-05-19"]) expect(du(d)).toEqual(["JR"]);
    for (const d of ["2026-12-15", "2026-12-18", "2026-12-21", "2027-05-24", "2027-05-27", "2027-05-28"]) expect(du(d)).toEqual(["EC"]);
    expect(du("2026-12-16").sort()).toEqual(["EC", "EUL"]);
  });
  it("lit les horaires modifiés et la journée marquée d'une image", () => {
    expect(c.journees.filter((j) => j.horaireDu).map((j) => [j.date, j.horaireDu])).toEqual([["2026-10-06", "lundi"], ["2027-03-30", "vendredi"], ["2027-04-23", "mercredi"], ["2027-05-10", "mercredi"]]);
    expect(du("2027-04-21")).toEqual(["suspension"]);
  });
  it("nomme les congés", () => expect(c.journees.find((j) => j.date === "2027-03-26")?.titre).toContain("Vendredi saint"));
  it("refuse un PDF dont une case ne tombe pas sur le bon jour", () => {
    const faux = textes.map((t) => (t.t === "11 JR*" ? { ...t, t: "12 JR*" } : t));
    expect(() => analyserCalendrier(faux)).toThrow("2026-11-11");
  });
});

describe("absences et déplacements", () => {
  const c = construireCalendrier(calendrierScolaire(), {
    plages,
    sessionId: "A2026",
    evenements: [
      { date: "2026-11-11", remplace: "2026-11-09", type: "deplacement", cours: "420-1P6-EM" },
      { date: "2026-11-17", type: "absence", titre: "Maladie" },
    ],
  });
  it("marque le cours d'origine et l'ajoute en JR, à la même heure", () => {
    expect(c.get("2026-11-09")?.evenements.find((e) => e.source === "seance")?.annulee).toContain("déplacé au mercredi 11 novembre");
    expect(c.get("2026-11-11")?.evenements.find((e) => e.type === "deplacement")).toMatchObject({ heure: "08:00–11:00", cours: "420-1P6-EM" });
  });
  it("annule les cours pendant une absence", () => expect(c.get("2026-11-17")?.evenements.find((e) => e.source === "seance")?.annulee).toContain("absence"));
});

describe("en ce moment", () => {
  const scolaire = calendrierScolaire();
  const p = (type: Plage["type"], jour: string, debut: string, fin: string, local: string, cours?: string): Plage => ({ type, jour, debut, fin, local, cours });
  const prof = { session: "A2026", plages: [p("centre-aide", "vendredi", "10:00", "11:00", "D-0008"), p("dispo", "vendredi", "11:00", "12:00", "D-0008"), p("dispo", "vendredi", "13:00", "15:00", "E-211"), p("cours", "lundi", "08:00", "11:00", "D-0704", "420-5N6-EM")] };
  it("fusionne les disponibilités qui se suivent dans le même local", () => {
    expect(fusionnerDispos(prof.plages).map((d) => [d.debut, d.fin, d.local])).toEqual([["10:00", "12:00", "D-0008"], ["13:00", "15:00", "E-211"]]);
  });
  it("dit où est le prof", () => {
    expect(etatProf(prof, scolaire, new Date(2026, 10, 27, 10, 30))).toMatchObject({ etat: "dispo", local: "D-0008", fin: "12:00" });
    expect(etatProf(prof, scolaire, new Date(2026, 10, 23, 9, 0))).toMatchObject({ etat: "en-classe", local: "D-0704" });
    expect(etatProf(prof, scolaire, new Date(2026, 9, 16, 10, 30)).etat).toBe("inconnu"); // relâche
    expect(etatProf({ ...prof, calendrier: [{ date: "2026-11-27", type: "absence" }] }, scolaire, new Date(2026, 10, 27, 10, 30)).etat).toBe("absent");
    expect(prochaineDispo(prof, scolaire, new Date(2026, 10, 27, 12, 0))).toMatchObject({ iso: "2026-11-27", debut: "13:00", local: "E-211" });
  });
  it("ne dit « libre » que si l'horaire du labo est complet", () => {
    const profs = [{ id: "a.b", nom: "A B", ...prof }];
    const labo = { local: "D-704", session: "A2026", complet: true, ouverture: "08:00", fermeture: "18:00", occupations: [] };
    expect(etatLabo(labo, profs, scolaire, new Date(2026, 10, 23, 9, 0))).toMatchObject({ etat: "occupe", jusqua: "11:00" });
    expect(etatLabo(labo, profs, scolaire, new Date(2026, 10, 23, 12, 0))).toMatchObject({ etat: "libre", jusqua: "18:00" });
    expect(etatLabo({ ...labo, complet: false }, profs, scolaire, new Date(2026, 10, 23, 12, 0)).etat).toBe("inconnu");
  });
});

describe("horaire officiel des locaux (A2026)", () => {
  const scolaire = calendrierScolaire();
  const a = (jour: number, h: number, m = 0) => resumeMaintenant(profsHoraire(), laboratoires(), scolaire, new Date(2026, 10, jour, h, m));
  const libres = (jour: number, h: number, m = 0) => a(jour, h, m).libres.map(({ l }) => l.local).sort();
  it("liste les locaux sans cours", () => {
    expect(libres(23, 11, 30)).toEqual(["D-0007", "D-0008", "D-0604", "D-0605", "D-0620", "D-0622", "D-0624", "D-0704"]); // lundi
    expect(libres(25, 13, 0)).toHaveLength(12); // mercredi : trou de l'horaire
  });
  it("ne compte pas la pause de 10 minutes entre deux cours", () => {
    expect(a(24, 15, 5).etats.find(({ l }) => l.local === "D-0003")!.e).toMatchObject({ etat: "occupe", jusqua: "18:00" });
    expect(a(23, 8, 2).etats.find(({ l }) => l.local === "D-0003")!.e).toMatchObject({ etat: "occupe", jusqua: "13:00" });
  });
  it("ne compte pas deux fois le cours d'une fiche de prof", () => {
    const labo = laboratoires().find((l) => l.local === "D-0003")!;
    expect(occupationsLocal("D-0003", "A2026", labo, profsHoraire())).toHaveLength(labo.occupations.length);
  });
  it("n'affiche aucun local libre un jour de JR, la fin de semaine ou à une autre session", () => {
    expect(a(11, 12)).toMatchObject({ libres: [], raison: expect.stringContaining("pas de cours réguliers") });
    expect(a(28, 12)).toMatchObject({ libres: [], raison: "C'est la fin de semaine" });
    expect(resumeMaintenant([], laboratoires(), scolaire, new Date(2027, 1, 8, 12)).libres).toEqual([]);
  });
  it("les groupes du soir occupent leur local même un jour sans cours réguliers", () => {
    expect(a(11, 19).etats.find(({ l }) => l.local === "D-0620")!.e).toMatchObject({ etat: "occupe", jusqua: "23:00" });
    expect(a(11, 12).etats.find(({ l }) => l.local === "D-0620")!.e.etat).toBe("inconnu");
  });
  it("le soir, n'annonce pas un local qui se libère à la fermeture", () => {
    expect(a(23, 21)).toMatchObject({ libres: [], prochainLibre: undefined, raison: "En dehors des heures de cours" });
  });
  it("un groupe n'est jamais dans deux locaux à la fois", () => {
    const vus = new Map<string, string[]>();
    for (const l of laboratoires())
      for (const o of l.occupations) {
        if (!o.cours) continue;
        const cle = `${o.cours} ${o.groupe} ${o.jour}`;
        for (const autre of vus.get(cle) ?? []) expect(o.fin <= autre.slice(0, 5) || o.debut >= autre.slice(6), `${cle} ${o.debut} ${autre}`).toBe(true);
        vus.set(cle, [...(vus.get(cle) ?? []), `${o.debut}-${o.fin}`]);
      }
  });
});

describe("horaires de profs préremplis avec l'horaire des locaux", () => {
  const scolaire = calendrierScolaire();
  const preremplis = profs().filter((p) => p.horaire?.prerempli);
  it("chaque plage préremplie correspond à l'horaire officiel d'un local", () => {
    expect(preremplis.length).toBe(2);
    for (const p of preremplis)
      for (const x of p.horaire!.plages) {
        const labo = laboratoires().find((l) => normaliserLocal(l.local) === normaliserLocal(x.local!));
        const officielle = labo?.occupations.find((o) => o.jour === x.jour && o.cours === x.cours && o.groupe === x.groupe && o.fin === x.fin && o.debut.slice(0, 2) === x.debut.slice(0, 2));
        expect(officielle, `${p.id} ${x.jour} ${x.debut} ${x.cours}`).toBeDefined();
      }
  });
  it("deux cours de 5 h qui se suivent sont deux séances de 2 h 30", () => {
    const marsolais = profs().find((p) => p.id === "david.marsolais")!.horaire!.plages.filter((x) => x.jour === "lundi");
    expect(marsolais.map((x) => [x.debut, x.fin, x.groupe])).toEqual([["08:00", "10:30", "1030"], ["10:30", "13:00", "1040"]]);
    for (const l of laboratoires())
      for (const a of l.occupations) for (const b of l.occupations) expect(a !== b && a.jour === b.jour && a.debut < b.fin && b.debut < a.fin, `${l.local} ${a.jour} ${a.debut}`).toBe(false);
  });
  it("un cours prérempli ne rend jamais un prof « disponible »", () => {
    for (const p of preremplis) expect(resumeMaintenant([{ ...p, plages: p.horaire!.plages }], [], scolaire, new Date(2026, 10, 23, 11, 30)).dispos).toEqual([]);
  });
  it("dit où le prof est en classe", () => {
    const leduc = profsHoraire().find((p) => p.id === "kevin.leduc")!;
    expect(etatProf(leduc, scolaire, new Date(2026, 10, 23, 16, 0))).toMatchObject({ etat: "en-classe", local: "D-0003", cours: "420-SN1-RE" });
  });
  it("garde dans le bandeau seulement les profs utiles, sans rien changer au résultat", () => {
    const utiles = profsUtiles(profsHoraire(), laboratoires());
    expect(utiles.map((p) => p.id).sort()).toEqual(["joris.deguet", "po.brillant"]);
    for (const h of [9, 11, 13, 16]) {
      const [tous, reduits] = [profsHoraire(), utiles].map((l) => resumeMaintenant(l, laboratoires(), scolaire, new Date(2026, 10, 27, h, 30)));
      expect(reduits.libres).toEqual(tous.libres);
      expect(reduits.dispos).toEqual(tous.dispos);
    }
  });
});
