import { describe, expect, it } from "vitest";
import { analyser, colorier, compterLignes, ErreurPython, executer, nomsDefinis, suggerer, type Suggestion } from "@/lib/jeux/mini-python";
import { NIVEAUX, verifier } from "@/lib/jeux/robot";

function calculer(source: string) {
  const sorties: unknown[] = [];
  const natives = { afficher: { arite: 1, action: false, f: (v: never) => (sorties.push(v), null) } };
  for (const e of executer(analyser(source), natives as never)) void e;
  return sorties;
}
const erreur = (source: string) => {
  try {
    calculer(source);
  } catch (e) {
    if (e instanceof ErreurPython) return `${e.ligne}: ${e.message}`;
  }
  return "aucune erreur";
};

describe("mini Python", () => {
  it("calcule, boucle et décide", () => {
    expect(calculer("t = 0\nfor i in range(1, 5):\n    if i % 2 == 0:\n        t += i\n    else:\n        t -= 1\nafficher(t)")).toEqual([4]);
    expect(calculer("n = 3\nwhile n > 0:\n    n -= 1\n    if n == 1: break\nafficher(n)")).toEqual([1]);
    expect(calculer("def double(x):\n    return x * 2\nafficher(double(4) + 1)")).toEqual([9]);
    expect(calculer("afficher(not False and 2 < 3 or False)\nafficher(-7 // 2)\nafficher(-7 % 3)")).toEqual([true, -4, 2]);
    expect(calculer("if False:\n    pass\nelif True:\n    afficher(1)\nelse:\n    afficher(2)\nafficher(3)")).toEqual([1, 3]);
    expect(calculer("for i in range(2):\n    for j in range(2):\n        if j == 1: continue\n        afficher(i * 10 + j)")).toEqual([0, 10]);
  });
  it("explique les erreurs courantes", () => {
    expect(erreur("while True\n    pass")).toContain("1: il manque les deux-points");
    expect(erreur("while True:\npass")).toContain("ligne décalée");
    expect(erreur("x = 1\nif x = 1:\n    pass")).toContain("2: ");
    expect(erreur("if 1 = 1:\n    pass")).toContain("==");
    expect(erreur("afficher")).toContain("parenthèses");
    expect(erreur("while True:\n    x = 1")).toContain("boucle infinie");
    expect(erreur("while True:\n    pass")).toContain("boucle infinie");
    expect(erreur("for i in range(1000000000):\n    pass")).toContain("trop grand");
    expect(erreur("afficher(y)")).toContain("je ne connais pas « y »");
    expect(erreur("  x = 1")).toContain("première ligne");
    expect(erreur("def f():\n    f()\nf()")).toContain("récursion");
  });
});

describe("éditeur", () => {
  const types = (ligne: string) => colorier(ligne).map((j) => `${j.type}:${j.texte}`);
  it("colore les mots, les appels, les nombres et les commentaires", () => {
    expect(types("while not sur_terminal():  # encore")).toEqual(["mot:while", "autre: ", "mot:not", "autre: ", "fonction:sur_terminal", "autre:():  ", "commentaire:# encore"]);
    expect(types("for i in range(6):")).toEqual(["mot:for", "autre: ", "nom:i", "autre: ", "mot:in", "autre: ", "fonction:range", "autre:(", "nombre:6", "autre:):"]);
    expect(types("def tour(n): x = True")).toContain("fonction:tour");
    expect(types("x = 'a#b'")).toEqual(["nom:x", "autre: = ", "texte:'a#b'"]);
    // Une ligne à moitié écrite se colore quand même, et rien ne se perd
    for (const l of ["if devant_libre(", "x = \"pas fini", "é@ ?"]) expect(colorier(l).map((j) => j.texte).join("")).toBe(l);
  });
  it("retrouve les fonctions et les variables du programme", () => {
    const { fonctions, variables } = nomsDefinis("def deux(a, b):\n    pass\nfor i in range(3):\n    total += i\nif x == 2:\n    pass");
    expect([...fonctions]).toEqual([["deux", 2]]);
    expect([...variables].sort()).toEqual(["a", "b", "i", "total"]);
  });
  it("suggère ce qui commence par le préfixe, puis ce qui le contient après un _", () => {
    const c: Suggestion[] = ["avancer", "devant_libre", "droite_libre", "sur_paquet"].map((nom) => ({ nom, type: "action" }));
    const noms = (p: string, liste = c) => suggerer(p, liste).map((s) => s.nom);
    expect(noms("d")).toEqual(["devant_libre", "droite_libre"]);
    expect(noms("libre")).toEqual(["devant_libre", "droite_libre"]);
    expect(noms("PAQ")).toEqual(["sur_paquet"]);
    expect(noms("avancer")).toEqual(["avancer"]); // gagne encore ses parenthèses
    const mots: Suggestion[] = [{ nom: "if", type: "mot" }, { nom: "in", type: "mot" }, { nom: "i", type: "variable" }];
    expect(noms("i", mots)).toEqual(["if", "in"]);
    expect(noms("if", mots)).toEqual([]);
  });
});

describe.each(NIVEAUX.map((n) => [n.titre, n] as const))("niveau « %s »", (_, n) => {
  it("la solution réussit toutes les cartes", () => n.cartes.forEach((_, i) => expect(verifier(n.solution, n, i), `carte ${i + 1}`).toBeNull()));
  it("le programme de départ ne suffit pas", () => expect(n.cartes.some((_, i) => verifier(n.depart, n, i) !== null)).toBe(true));
  it("la solution respecte le nombre de lignes", () => expect(compterLignes(n.solution)).toBeLessThanOrEqual(n.maxLignes ?? 99));
});
