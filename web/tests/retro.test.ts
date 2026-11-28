import { describe, expect, it } from "vitest";
import { ajouterEntree, ajouterTouche, cheminDos, CODE_CLAVIER, CODE_TACTILE, codeComplet, entreeClavier, geste, lirePhosphore, phosphoreSuivant, type Entree } from "@/lib/retro";

// Tape une suite de touches et dit si le code a été reconnu à la fin.
function taper(touches: string[]) {
  let historique: readonly Entree[] = [];
  for (const t of touches) historique = ajouterTouche(historique, t);
  return codeComplet(historique, CODE_CLAVIER);
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

describe("code Konami au clavier", () => {
  it("reconnaît le code", () => expect(taper(KONAMI)).toBe(true));
  it("accepte B et A en majuscules, avec Maj", () => expect(taper([...KONAMI.slice(0, 8), "Shift", "B", "Shift", "A"])).toBe(true));
  it("ignore les touches hors du code", () => expect(entreeClavier("Enter")).toBeNull());
  it("reconnaît le code après des touches au hasard", () => expect(taper(["x", "ArrowDown", "Enter", ...KONAMI])).toBe(true));
  // ↑ ↑ ↑ : les deux derniers ↑ restent le début du code
  it("reconnaît le code après un ↑ de trop", () => expect(taper(["ArrowUp", ...KONAMI])).toBe(true));
  it("refuse le code incomplet", () => expect(taper(KONAMI.slice(0, 9))).toBe(false));
  it("refuse le code interrompu par une autre touche", () => expect(taper([...KONAMI.slice(0, 4), "x", ...KONAMI.slice(4)])).toBe(false));
  it("refuse A B à la place de B A", () => expect(taper([...KONAMI.slice(0, 8), "a", "b"])).toBe(false));
});

describe("code Konami au doigt", () => {
  it("reconnaît huit glissements et deux touchers", () => {
    const gestes = [geste(0, -80, 150), geste(5, -90, 150), geste(0, 80, 150), geste(-3, 70, 150), geste(-90, 0, 150), geste(90, 4, 150), geste(-60, 10, 150), geste(60, 0, 150), geste(2, 1, 80), geste(0, 0, 90)];
    let historique: Entree[] = [];
    for (const g of gestes) historique = ajouterEntree(historique, g, CODE_TACTILE);
    expect(codeComplet(historique, CODE_TACTILE)).toBe(true);
  });
});

describe("geste", () => {
  it("lit la direction du glissement", () => {
    expect(geste(0, -80, 200)).toBe("haut");
    expect(geste(0, 80, 200)).toBe("bas");
    expect(geste(-80, 0, 200)).toBe("gauche");
    expect(geste(80, 0, 200)).toBe("droite");
  });
  it("ignore un glissement en diagonale ou trop court", () => {
    expect(geste(60, 60, 200)).toBeNull();
    expect(geste(25, 0, 200)).toBeNull();
  });
  it("distingue un toucher d'un appui long", () => {
    expect(geste(3, 2, 120)).toBe("toucher");
    expect(geste(3, 2, 800)).toBeNull();
  });
});

describe("phosphore", () => {
  it("passe du vert à l'ambre, au blanc, puis revient au vert", () => {
    expect(phosphoreSuivant("vert")).toBe("ambre");
    expect(phosphoreSuivant("ambre")).toBe("blanc");
    expect(phosphoreSuivant("blanc")).toBe("vert");
  });
  it("refuse une valeur inconnue", () => {
    expect(lirePhosphore("ambre")).toBe("ambre");
    expect(lirePhosphore("rose")).toBeNull();
    expect(lirePhosphore(null)).toBeNull();
  });
});

describe("cheminDos", () => {
  it("montre la racine", () => expect(cheminDos("/")).toBe("C:\\DEPINFO"));
  it("garde les noms courts", () => expect(cheminDos("/profs/")).toBe("C:\\DEPINFO\\PROFS"));
  it("raccourcit les noms de plus de 8 caractères", () => expect(cheminDos("/centre-aide/")).toBe("C:\\DEPINFO\\CENTRE~1"));
  it("retire les accents", () => expect(cheminDos("/jeux/r%C3%A9seau")).toBe("C:\\DEPINFO\\JEUX\\RESEAU"));
});
