import { describe, expect, it } from "vitest";
import { appareil, diode, NIVEAUX_RESEAU, ping, type Reseau } from "@/lib/jeux/reseau";

const cloner = (n: number) => structuredClone(NIVEAUX_RESEAU[n].reseau);
const tester = (n: number, r: Reseau) => ping(r, NIVEAUX_RESEAU[n].source, NIVEAUX_RESEAU[n].destination);

// La solution de chaque niveau, étape par étape : le ping ne doit passer qu'à la dernière.
const solutions: ((r: Reseau) => void)[][] = [
  [(r) => (r.cables[1].b = { app: "biblio", port: 0 })],
  [(r) => (appareil(r, "swb").ports[1].actif = true)],
  [(r) => (appareil(r, "sam").ip = "192.168.5.42")],
  [(r) => (appareil(r, "swa").ports[2].vlan = 10), (r) => (appareil(r, "swb").ports[1].vlan = 10)],
  [
    (r) => (r.cables[1].b = { app: "rt", port: 0 }),
    (r) => (appareil(r, "rt").ports[1].actif = true),
    (r) => (appareil(r, "siege").passerelle = "192.168.1.1"),
    (r) => (appareil(r, "entrepot").passerelle = "192.168.2.1"),
  ],
];

describe.each(NIVEAUX_RESEAU.map((n, i) => [n.titre, i] as const))("niveau réseau « %s »", (_, i) => {
  it("échoue au départ, réussit seulement une fois toutes les pannes réparées", () => {
    const r = cloner(i);
    for (const etape of solutions[i]) {
      expect(tester(i, r).ok).toBe(false);
      etape(r);
    }
    expect(tester(i, r)).toMatchObject({ ok: true });
  });
  it("les appareils et le joueur sont sur le plancher", () => {
    const n = NIVEAUX_RESEAU[i];
    expect(new Set(n.salle.map((l) => l.length)).size).toBe(1);
    for (const p of [...n.reseau.appareils, n.joueur, ...(n.boutAuSol ? [n.boutAuSol] : [])]) expect(n.salle[p.y][p.x]).toBe(".");
  });
});

describe("pannes", () => {
  it("détecte un conflit d'adresses", () => {
    const r = cloner(2);
    appareil(r, "sam").ip = "192.168.5.30";
    expect(tester(2, r).message).toContain("Conflit");
  });
  it("distingue l'aller du retour", () => {
    const r = cloner(4);
    solutions[4].slice(0, 3).forEach((f) => f(r));
    expect(tester(4, r).explication).toContain("retour");
  });
  it("allume la bonne diode", () => {
    expect(diode(cloner(0), "biblio", 0)).toBe("eteinte");
    expect(diode(cloner(1), "labo2", 0)).toBe("orange");
    expect(diode(cloner(2), "sam", 0)).toBe("verte");
  });
});
