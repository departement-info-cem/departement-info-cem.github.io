import { describe, expect, it } from "vitest";
import { angle, bloque, deplacer, distanceAssis, faces, hauteurEcran, lieu, obstacles, poseAssise, poseDebout, posteAPortee, postes, reperes, type Pose } from "@/lib/salle";

const ecranH = hauteurEcran(1280, 800);
const liste = postes();
const murs = obstacles();
const moi = liste.find((p) => p.place === "moi")!;
const reseau = liste.find((p) => p.place === "reseau")!;
const debout = (x: number, z: number, lacet: number): Pose => ({ x, y: 160, z, lacet, tangage: 0, champ: 72 });

describe("écran et pose assise", () => {
  it("garde les proportions de la fenêtre", () => expect(hauteurEcran(1280, 800)).toBe(20));
  // L'écran de 20 cm doit remplir les 28° du champ de vue assis
  it("place les yeux à la distance où l'écran remplit la vue", () => {
    const d = distanceAssis(ecranH);
    expect((2 * Math.atan(ecranH / 2 / d) * 180) / Math.PI).toBeCloseTo(28);
  });
  it("met les yeux à la hauteur du centre de l'écran, droit devant", () => {
    const pose = poseAssise(moi, ecranH);
    const { ecran } = reperes(moi, ecranH);
    expect(pose.y).toBe(ecran.y);
    expect(pose.z - ecran.z).toBeCloseTo(distanceAssis(ecranH));
    expect(pose.tangage).toBe(0);
  });
});

describe("obstacles", () => {
  it("laisse de la place pour se lever derrière sa chaise", () => {
    const p = poseDebout(moi, ecranH);
    expect(bloque(p.x, p.z, murs)).toBe(false);
  });
  it("laisse atteindre les places où l'on peut s'asseoir", () => {
    for (const p of liste.filter((p) => p.place)) {
      const { siege } = reperes(p, ecranH);
      expect(bloque(siege.x, siege.z, murs)).toBe(false);
    }
  });
  it("laisse passer par la porte de la salle réseau", () => {
    let pos = { x: 400, z: 230 };
    for (let i = 0; i < 20; i++) pos = deplacer(pos.x, pos.z, 10, 0, murs);
    expect(pos.x).toBeGreaterThan(500);
    expect(lieu(pos.x)).toBe("C:\\DEPINFO\\RESEAU>");
  });
  it("arrête au mur à côté de la porte", () => {
    let pos = { x: 400, z: 100 };
    for (let i = 0; i < 20; i++) pos = deplacer(pos.x, pos.z, 10, 0, murs);
    expect(pos.x).toBeLessThan(450);
  });
  it("fait glisser le long d'un mur au lieu d'arrêter net", () => {
    const pos = deplacer(0, 350, 10, 10, murs);
    expect(pos).toEqual({ x: 10, z: 350 });
  });
});

describe("s'asseoir", () => {
  it("propose sa place quand on est derrière sa chaise, tourné vers son écran", () => {
    const { siege } = reperes(moi, ecranH);
    expect(posteAPortee(debout(siege.x, siege.z + 30, 0), liste, ecranH)).toBe(moi);
  });
  it("ne la propose pas si on regarde ailleurs", () => {
    const { siege } = reperes(moi, ecranH);
    expect(posteAPortee(debout(siege.x, siege.z + 30, 180), liste, ecranH)).toBeNull();
  });
  it("ne la propose pas de trop loin", () => expect(posteAPortee(debout(moi.x, 0, 0), liste, ecranH)).toBeNull());
  it("propose le terminal de la salle réseau, face au mur du fond", () => {
    const { siege } = reperes(reseau, ecranH);
    expect(posteAPortee(debout(siege.x, siege.z, 180), liste, ecranH)).toBe(reseau);
  });
});

describe("angle", () => {
  it.each([[190, -170], [-190, 170], [360, 0], [45, 45]])("%d° -> %d°", (a, attendu) => expect(angle(a)).toBe(attendu));
});

describe("faces", () => {
  it("décrit une salle complète, sans dimension nulle", () => {
    const toutes = faces(ecranH);
    expect(toutes.length).toBeGreaterThan(100);
    expect(toutes.every((f) => f.l > 0 && f.h > 0)).toBe(true);
  });
});
