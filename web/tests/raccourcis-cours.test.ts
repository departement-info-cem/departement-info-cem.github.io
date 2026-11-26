import { describe, expect, it } from "vitest";
import { raccourcisCours } from "@/lib/raccourcis-cours";
import { catalogue, raccourci, raccourcis } from "@/lib/donnees";

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
    // Aucun raccourci ne peut prendre l'identifiant d'un prof (minuscules)
    expect(raccourcis().every((r) => r.sigle === r.sigle.toUpperCase())).toBe(true);
    // Chaque cours qui a un site a son raccourci
    for (const c of catalogue().filter((c) => c.url)) expect(raccourcis().some((r) => r.no === c.no && r.url === c.url)).toBe(true);
  });
});
