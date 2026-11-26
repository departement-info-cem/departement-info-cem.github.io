import { describe, expect, it } from "vitest";
import { donneesMesCours } from "@/lib/donnees";
import { aVenir, basculer, garderMonGroupe, court, ecrireParamCours, estPerime, lireParamCours, evenementsPourMoi, libelle, lienAvecMoi, nettoyer, trierPourMoi, type InfoProfMesCours, type MonCours } from "@/lib/mes-cours";
import { construireCalendrier } from "@/lib/calendrier";
import { adresseAvecCours } from "@/components/partager-page";
import { calendrierScolaire } from "@/lib/donnees";
import { dateDepuisIso } from "@/lib/temps";

const cinqN6: MonCours = { cours: "420-5N6-EM", prof: "joris.deguet", groupe: "1020", session: "A2026" };

describe("mes cours", () => {
  it("libellés courts", () => {
    expect(court("420-5N6-EM")).toBe("5N6");
    expect(libelle(cinqN6)).toBe("5N6 gr. 1020");
    expect(libelle({ cours: "420-SN1-RE" })).toBe("SN1");
  });
  it("un seul groupe par cours ; recliquer le retire", () => {
    const un = basculer([], cinqN6);
    const autre = basculer(un, { ...cinqN6, prof: "po.brillant", groupe: "1010" });
    expect(autre).toEqual([{ ...cinqN6, prof: "po.brillant", groupe: "1010" }]);
    expect(basculer(un, { ...cinqN6, session: "H2027" })).toEqual([]);
  });
  it("ignore un stockage abîmé", () => {
    expect(nettoyer("n'importe quoi")).toEqual([]);
    expect(nettoyer([{ cours: "420-5N6-EM", groupe: 1020 }, { prof: "x" }, null])).toEqual([{ cours: "420-5N6-EM", prof: undefined, groupe: undefined, session: undefined }]);
  });
  it("mon prof, prof d'un de mes cours, ou rien", () => {
    expect(lienAvecMoi("joris.deguet", ["420-5N6-EM"], [cinqN6])).toEqual({ niveau: "mon-prof", cours: ["420-5N6-EM"] });
    expect(lienAvecMoi("po.brillant", ["420-4W6-EM", "420-5N6-EM"], [cinqN6])).toEqual({ niveau: "meme-cours", cours: ["420-5N6-EM"] });
    expect(lienAvecMoi("kevin.leduc", ["420-1B3-EM"], [cinqN6]).niveau).toBeNull();
  });
  it("trie mes profs, puis ceux de mes cours, en gardant l'ordre", () => {
    const cours: Record<string, string[]> = { a: ["420-1B3-EM"], b: ["420-5N6-EM"], c: ["420-1B3-EM"], d: ["420-5N6-EM"], joris: ["420-5N6-EM"] };
    const ids = ["a", "b", "c", "joris", "d"];
    const mes = [{ ...cinqN6, prof: "joris" }];
    expect(trierPourMoi(ids, (id) => lienAvecMoi(id, cours[id], mes))).toEqual(["joris", "b", "d", "a", "c"]);
  });
  it("un choix d'une autre session est périmé", () => {
    const profs = { "joris.deguet": { nom: "Joris", session: "H2027", cours: [], aide: [], dispos: [], calendrier: [] } };
    expect(estPerime(cinqN6, profs)).toBe(true);
    expect(estPerime({ ...cinqN6, session: "H2027" }, profs)).toBe(false);
    expect(estPerime({ ...cinqN6, prof: "parti" }, profs)).toBe(true);
    expect(estPerime({ cours: "420-5N6-EM" }, profs)).toBe(false);
  });
});

describe("donneesMesCours (fiches figées)", () => {
  const d = donneesMesCours(dateDepuisIso("2026-11-25"));
  it("regroupe les séances par prof et par groupe", () => {
    const g = d.groupes["420-5M6-EM"].find((x) => x.prof === "joris.deguet" && x.groupe === "1020");
    expect(g?.seances.map((s) => `${s.jour} ${s.debut}`)).toEqual(["lundi 15:00", "mercredi 09:00"]);
    expect(g?.session).toBe("A2026");
    expect(d.groupes["420-905-EM"].filter((x) => x.prof === "david.marsolais").map((x) => x.groupe)).toEqual(["1030", "1040"]);
  });
  it("garde les dispos et les cours de chaque prof", () => {
    expect(d.profs["joris.deguet"].cours).toEqual(["420-5M6-EM", "420-SN1-RE"]);
    expect(d.profs["joris.deguet"].dispos.length).toBeGreaterThan(0);
    expect(d.profs["joris.deguet"].dispos.every((p) => p.type === "dispo" || p.type === "centre-aide")).toBe(true);
  });
  it("seulement les profs actifs", () => expect(Object.keys(donneesMesCours(dateDepuisIso("2027-06-01")).profs)).toEqual([]));
});

describe("mon calendrier", () => {
  const prof: InfoProfMesCours = {
    nom: "Joris Deguet",
    session: "A2026",
    cours: ["420-5N6-EM", "420-SN1-RE"],
    aide: [],
    dispos: [],
    calendrier: [
      { date: "2026-11-30", titre: "Examen final", type: "examen", cours: "420-5N6-EM", evaluation: "sommative" },
      { date: "2026-12-01", titre: "Quiz", type: "examen", cours: "420-5N6-EM", groupe: "1030", evaluation: "formative" },
      { date: "2026-12-02", titre: "TP SN1", type: "remise", cours: "420-SN1-RE" },
      { date: "2026-12-07", titre: "Colloque", type: "absence" },
      { date: "2026-12-08", titre: "Réunion", type: "activite" },
    ],
  };
  const mes: MonCours[] = [cinqN6];
  const evts = evenementsPourMoi(mes, { "joris.deguet": prof });

  it("garde les dates de mon cours et de mon groupe, et les absences de mon prof", () => {
    expect(evts.map((e) => e.titre)).toEqual(["5N6 · Examen final", "5N6 · Cours annulé (Joris Deguet)"]);
    expect(evts[1]).toMatchObject({ type: "absence", cours: "420-5N6-EM", groupe: "1020" });
  });
  it("à venir : l'évaluation, puis mon cours annulé par l'absence", () => {
    const plages = [{ jour: "lundi", debut: "15:00", fin: "18:00", type: "cours" as const, cours: "420-5N6-EM", groupe: "1020" }];
    const jours = construireCalendrier(calendrierScolaire(), { plages, evenements: evts, sessionId: "A2026" });
    const liste = aVenir(jours, "2026-11-25", 14);
    expect(liste.find((j) => j.iso === "2026-11-30")?.evenements).toEqual([expect.objectContaining({ titre: "5N6 · Examen final", evaluation: "sommative" })]);
    expect(liste.find((j) => j.iso === "2026-12-07")?.evenements.map((e) => e.annulee ?? e.type)).toEqual(["absence", "annulé"]);
    // Le lundi 30, le cours a lieu normalement : il n'est pas dans « à venir »
    expect(liste.find((j) => j.iso === "2026-11-30")?.evenements.some((e) => e.source === "seance")).toBe(false);
  });
});

describe("calendrier d'un prof vu par son étudiant", () => {
  const canonique = (no: string) => (no === "420-5N6-EM" ? "420-5M6-EM" : no);
  const dates = [
    { titre: "Examen gr. 1050", cours: "420-SN1-RE", groupe: "1050" },
    { titre: "Examen gr. 1070", cours: "420-SN1-RE", groupe: "1070" },
    { titre: "Pour tous les groupes", cours: "420-SN1-RE" },
    { titre: "Absence" },
    { titre: "Autre cours", cours: "420-5N6-EM", groupe: "1020" },
  ];
  it("garde mon groupe et les dates communes, pas les autres groupes ni les autres cours", () =>
    expect(garderMonGroupe(dates, [{ cours: "420-SN1-RE", prof: "joris.deguet", groupe: "1070" }], canonique).map((d) => d.titre)).toEqual(["Examen gr. 1070", "Pour tous les groupes", "Absence"]));
  it("compare les numéros canoniques (5N6 = 5M6)", () => {
    expect(garderMonGroupe(dates, [{ cours: "420-5M6-EM", prof: "joris.deguet", groupe: "1020" }], canonique).map((d) => d.titre)).toEqual(["Absence", "Autre cours"]);
    expect(garderMonGroupe(dates, [{ cours: "420-5M6-EM", prof: "joris.deguet", groupe: "1030" }], canonique).map((d) => d.titre)).toEqual(["Absence"]);
  });
  it("groupe inconnu : tous les groupes de mon cours", () => expect(garderMonGroupe(dates, [{ cours: "420-SN1-RE", prof: "joris.deguet" }], canonique)).toHaveLength(4));
});

describe("lien avec des cours (?cours=)", () => {
  const donnees = {
    cours: {
      "420-5M6-EM": { no: "420-5M6-EM", nom: "Applications mobiles avancées" },
      "420-5N6-EM": { no: "420-5M6-EM", nom: "Applications mobiles avancées" },
      "420-SN1-RE": { no: "420-SN1-RE", nom: "Programmation en sciences" },
      "420-SN1-EM": { no: "420-SN1-RE", nom: "Programmation en sciences" },
      "420-3W6-EM": { no: "420-3W6-EM", nom: "Programmation web transactionnelle" },
    },
    groupes: {
      "420-SN1-RE": [{ cours: "420-SN1-RE", prof: "joris.deguet", groupe: "1050", session: "A2026", seances: [] }],
      "420-5M6-EM": [{ cours: "420-5M6-EM", prof: "po.brillant", groupe: "1010", session: "A2026", seances: [] }],
    },
  };
  it("lit les sigles, les anciens numéros, les groupes et le prof", () =>
    expect(lireParamCours("sn1-1050, 5N6:1010,420-3W6-EM", donnees)).toEqual({
      cours: [
        { cours: "420-SN1-RE", prof: "joris.deguet", groupe: "1050", session: "A2026" },
        { cours: "420-5M6-EM", prof: "po.brillant", groupe: "1010", session: "A2026" },
        { cours: "420-3W6-EM" },
      ],
      inconnus: [],
    }));
  it("signale ce qu'il ne trouve pas", () => expect(lireParamCours("XYZ,SN1-9999,SN1", donnees)).toEqual({ cours: [{ cours: "420-SN1-RE" }], inconnus: ["XYZ", "SN1-9999"] }));
  it("écrit et relit la même liste", () => {
    const cours = lireParamCours("SN1-1050,3W6", donnees).cours;
    expect(ecrireParamCours(cours)).toBe("SN1-1050,3W6");
    expect(lireParamCours(ecrireParamCours(cours), donnees).cours).toEqual(cours);
  });
});

describe("adresse à partager", () => {
  it("ajoute mescours sans toucher au filtre ?cours= des pages de prof", () => {
    expect(adresseAvecCours("https://x.ca/react/joris.deguet/horaire/?cours=420-5N6-EM", "SN1-1050,5M6-1020")).toBe("https://x.ca/react/joris.deguet/horaire/?cours=420-5N6-EM&mescours=SN1-1050,5M6-1020");
    expect(adresseAvecCours("https://x.ca/react/profs/?mescours=3W6", null)).toBe("https://x.ca/react/profs/");
    expect(adresseAvecCours("https://x.ca/react/profs/?mescours=3W6", "SN1")).toBe("https://x.ca/react/profs/?mescours=SN1");
  });
});
