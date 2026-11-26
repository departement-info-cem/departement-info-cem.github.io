import { describe, expect, it } from "vitest";
import { pagesRaccourcis, raccourcisCours, trouverRaccourci } from "@/lib/raccourcis-cours";
import { catalogue, raccourci, raccourcis, segmentsRaccourcis } from "@/lib/donnees";

describe("raccourcis vers les sites des cours", () => {
  it("donne le sigle de chaque cours qui a un site, et de ses anciens numéros", () => {
    const { raccourcis, conflits } = raccourcisCours([
      { no: "420-1P6-EM", nom: "Intro", url: "https://info.cegepmontpetit.ca/1P6/" },
      { no: "420-4D6-EM", nom: "BD et Web", url: "https://info.cegepmontpetit.ca/4D5-Base-De-Donnees-Et-Prog-Web/", alias: [{ no: "420-4D5-EM", nom: "Ancien" }] },
      { no: "420-SN1-RE", nom: "SN1", url: "https://info.cegepmontpetit.ca/420-SN1/" },
      { no: "420-1B3-EM", nom: "Sans site" },
    ]);
    expect(conflits).toEqual([]);
    expect(raccourcis.map((r) => [r.sigle, r.no])).toEqual([
      ["1P6", "420-1P6-EM"],
      ["4D5", "420-4D6-EM"],
      ["4D6", "420-4D6-EM"],
      ["SN1", "420-SN1-RE"],
    ]);
  });

  it("le numéro actuel d'un cours l'emporte sur l'ancien numéro d'un autre", () => {
    const { raccourcis, conflits } = raccourcisCours([
      { no: "420-2P6-EM", nom: "Ancien 2P6 devenu 3P6", url: "https://a.ca/", alias: [{ no: "420-9X9-EM", nom: undefined }] },
      { no: "420-9X9-EM", nom: "Nouveau 9X9", url: "https://b.ca/" },
    ]);
    expect(conflits).toEqual([]);
    expect(raccourcis.find((r) => r.sigle === "9X9")?.url).toBe("https://b.ca/");
  });

  it("signale un sigle qui mènerait à deux sites", () => {
    const { conflits } = raccourcisCours([
      { no: "420-SN1-RE", nom: "A", url: "https://a.ca/" },
      { no: "420-SN1-EM", nom: "B", url: "https://b.ca/" },
    ]);
    expect(conflits).toHaveLength(1);
    expect(conflits[0]).toContain("SN1");
  });

  it("lit les raccourcis du catalogue", () => {
    expect(raccourci("1P6")?.url).toBe("https://info.cegepmontpetit.ca/1P6/");
    // Un ancien numéro (alias 420-5N6-EM du 420-5M6-EM) mène au site du cours actuel
    expect(raccourci("5N6")?.url).toBe(raccourci("5M6")?.url);
    expect(raccourci("5N6")?.no).toBe("420-5M6-EM");
    expect(raccourcis().every((r) => r.sigle === r.sigle.toUpperCase())).toBe(true);
    // Chaque cours qui a un site a son raccourci
    for (const c of catalogue().filter((c) => c.url)) expect(raccourcis().some((r) => r.no === c.no && r.url === c.url)).toBe(true);
  });

  it("ne tient pas compte de la casse", () => {
    const liste = raccourcisCours([{ no: "420-SN1-RE", nom: "SN1", url: "https://info.cegepmontpetit.ca/420-SN1/" }]).raccourcis;
    for (const s of ["SN1", "sn1", "Sn1", "sN1"]) expect(trouverRaccourci(liste, s)?.sigle).toBe("SN1");
    expect(raccourci("1p6")?.url).toBe(raccourci("1P6")?.url);
  });

  it("génère le sigle en majuscules et en minuscules", () => {
    // Dans les tests, le site est à la racine (pas de basePath) : /1P6/ y est le site du cours lui-même, sans page
    expect(segmentsRaccourcis()).toEqual(expect.arrayContaining(["1p6", "SN1", "sn1"]));
    expect(segmentsRaccourcis()).not.toContain("1P6");
    const liste = raccourcisCours([{ no: "420-905-EM", nom: "Intro", url: "https://info.cegepmontpetit.ca/905-IntroProg/" }]).raccourcis;
    // Un sigle sans lettres n'a qu'une façon de s'écrire
    expect(pagesRaccourcis(liste, "https://info.cegepmontpetit.ca/react").map((p) => p.segment)).toEqual(["905"]);
  });

  it("après la bascule à la racine, ne génère pas une page qui redirigerait vers elle-même", () => {
    const liste = raccourcisCours([
      { no: "420-Z03-EM", nom: "Z03", url: "https://info.cegepmontpetit.ca/z03/" },
      { no: "420-1P6-EM", nom: "1P6", url: "https://info.cegepmontpetit.ca/1P6/" },
    ]).raccourcis;
    const segments = (racine: string) => pagesRaccourcis(liste, racine).map((p) => p.segment);
    // Sous /react/, rien ne se recoupe
    expect(segments("https://info.cegepmontpetit.ca/react")).toEqual(["1P6", "1p6", "Z03", "z03"]);
    // À la racine, /1P6/ et /z03/ sont les sites eux-mêmes : seules les autres casses redirigent
    expect(segments("https://info.cegepmontpetit.ca")).toEqual(["1p6", "Z03"]);
  });

  it("refuse un sigle qui prendrait l'adresse d'un prof ou d'une page, peu importe la casse", () => {
    const { conflits } = raccourcisCours([{ no: "420-GIT-EM", nom: "Git", url: "https://a.ca/" }], ["git", "joris.deguet"]);
    expect(conflits).toHaveLength(1);
    expect(conflits[0]).toContain("/git/");
  });
});
