// La salle 3D du mode rétro (voir components/retro/salle-3d.tsx) : une classe et sa salle réseau, décrites
// en centimètres. x va vers la droite, y vers le haut (0 = le plancher), z vers le fond de la classe ;
// on regarde le tableau quand on fait face aux z négatifs. Ce fichier ne dessine rien : il décrit les faces,
// les obstacles et les places où on peut s'asseoir, et fait les calculs de déplacement.

export type Orientation = "avant" | "arriere" | "gauche" | "droite" | "haut" | "bas";

/** Un rectangle de la salle : centre (x, y, z), largeur l et hauteur h, tourné vers `vers`
 * (avant : vers les z positifs, gauche : vers les x négatifs, haut : vers le plafond...). */
export type Face = { x: number; y: number; z: number; l: number; h: number; vers: Orientation; classe: string; contenu?: string };

/** Obstacle au sol, en plan : on ne peut pas y entrer. */
export type Obstacle = { x1: number; z1: number; x2: number; z2: number };

/** Un ordinateur sur une table. sens 1 : l'écran regarde vers le fond (z positifs) et on s'assoit du côté du fond ;
 * sens -1 : l'inverse. */
export type Poste = { x: number; z: number; sens: 1 | -1; ecran: string; place?: "moi" | "reseau" };

/** Position et regard de la caméra. lacet : vers la gauche en degrés (0 = vers le tableau) ; tangage : vers le haut ;
 * champ : angle de vue vertical. */
export type Pose = { x: number; y: number; z: number; lacet: number; tangage: number; champ: number };

export const ECRAN_LARGEUR = 32;
export const HAUTEUR = 280;
export const YEUX_DEBOUT = 160;
export const RAYON = 22;
/** Champ de vue assis : étroit, pour qu'on soit à 40 cm d'un écran qui remplit la vue. Debout : large. */
export const CHAMP_ASSIS = 28;
export const CHAMP_DEBOUT = 72;

const CLASSE = { x1: -450, x2: 450, z1: -380, z2: 380 };
const RESEAU = { x1: 450, x2: 800, z1: 0, z2: 380 };
const PORTE = { z1: 180, z2: 280, haut: 210 };
const TABLE_Y = 72;
const RANGEES = [-170, 20, 210];
const TABLES: [number, number][] = [[-380, -60], [60, 380]];
const BUREAU_PROF = { x: -260, z: -270 };
const TABLE_RESEAU = { x: 625, z: 345 };
const BAIES = { x1: 700, x2: 800, z1: 40, z2: 240 };

export const ECRANS_ELEVES = [
  "C:\\> dir\n\nMAIN.PY\nNOTES.TXT\nTP1.ZIP",
  "Hello, world!\nHello, world!\nHello, world!\n_",
  "C:\\> git commit\n-m \"ça marche\"",
  "ERREUR LIGNE 42\nPoint-virgule\nmanquant",
  "C:\\> ping\n10.0.0.1\nRéponse : 3 ms",
  "while True:\n    pass\n\n(ça tourne)",
  "TETRIS\n\n  ##\n   ##\n\nSCORE 1985",
  "C:\\> cd PROJET\nC:\\PROJET> _",
  "Compilation...\n████████░░ 80 %",
  "SELECT *\nFROM cours\nWHERE fun = 1;",
  "C:\\> format A:\nÊtes-vous sûr ?\n(O/N) _",
];

/** Les postes : trois rangées de quatre, celui du prof, et le terminal de la salle réseau. */
export function postes(): Poste[] {
  const liste: Poste[] = [];
  let i = 0;
  for (const z of RANGEES) {
    for (const x of [-300, -140, 140, 300]) {
      const moi = z === RANGEES[2] && x === 140;
      liste.push({ x, z, sens: 1, ecran: moi ? "" : ECRANS_ELEVES[i++ % ECRANS_ELEVES.length], place: moi ? "moi" : undefined });
    }
  }
  liste.push({ x: BUREAU_PROF.x, z: BUREAU_PROF.z, sens: -1, ecran: "Correction...\n\nCopie 1 / 32\nNote : 98 %" });
  liste.push({
    x: TABLE_RESEAU.x,
    z: TABLE_RESEAU.z,
    sens: -1,
    place: "reseau",
    ecran: "C:\\> ping 10.0.0.1\nDélai d'attente\ndépassé.\n\n** PANNE **\nAssieds-toi pour\nréparer_",
  });
  return liste;
}

/** Hauteur de l'écran (sa largeur est fixe), pour qu'il ait les proportions de la fenêtre du navigateur. */
export function hauteurEcran(largeurFenetre: number, hauteurFenetre: number): number {
  return (ECRAN_LARGEUR * hauteurFenetre) / largeurFenetre;
}

// Mesures d'un poste, à partir du centre de la table : l'écran est vers l'avant de la table, la chaise derrière.
function mesures(p: Poste, ecranH: number) {
  const z = (dz: number) => p.z + p.sens * dz;
  const moniteurH = ecranH + 13;
  return {
    z,
    moniteurH,
    ecranY: TABLE_Y + 14 + 6 + ecranH / 2,
    ecranZ: z(3.5),
    siege: { x: p.x, z: z(72) },
  };
}

/** Distance entre les yeux et l'écran quand on est assis : l'écran remplit alors exactement la vue. */
export function distanceAssis(ecranH: number): number {
  return ecranH / 2 / Math.tan(((CHAMP_ASSIS / 2) * Math.PI) / 180);
}

/** La caméra assise devant un poste : les yeux à la hauteur du centre de l'écran, droit devant. */
export function poseAssise(p: Poste, ecranH: number): Pose {
  const m = mesures(p, ecranH);
  return { x: p.x, y: m.ecranY, z: m.ecranZ + p.sens * distanceAssis(ecranH), lacet: p.sens === 1 ? 0 : 180, tangage: 0, champ: CHAMP_ASSIS };
}

/** Debout, un pas derrière sa chaise, qui regarde son écran d'un peu plus haut. */
export function poseDebout(p: Poste, ecranH: number): Pose {
  const m = mesures(p, ecranH);
  const z = m.siege.z + p.sens * 63;
  const tangage = (-Math.atan2(YEUX_DEBOUT - m.ecranY, Math.abs(z - m.ecranZ)) * 180) / Math.PI;
  return { x: p.x, y: YEUX_DEBOUT, z, lacet: p.sens === 1 ? 0 : 180, tangage: tangage * 0.85, champ: CHAMP_DEBOUT };
}

/** Le centre de l'écran d'un poste, et l'endroit où il faut se tenir pour s'y asseoir. */
export function reperes(p: Poste, ecranH: number) {
  const m = mesures(p, ecranH);
  return { ecran: { x: p.x, y: m.ecranY, z: m.ecranZ }, siege: m.siege };
}

// ---------- Faces ----------

function boite(faces: Face[], x: number, y: number, z: number, l: number, h: number, p: number, classe: string, sans: Orientation[] = ["bas"]) {
  const f = (face: Omit<Face, "classe">) => !sans.includes(face.vers) && faces.push({ ...face, classe });
  f({ x, y: y + h, z, l, h: p, vers: "haut" });
  f({ x, y, z, l, h: p, vers: "bas" });
  f({ x, y: y + h / 2, z: z + p / 2, l, h, vers: "avant" });
  f({ x, y: y + h / 2, z: z - p / 2, l, h, vers: "arriere" });
  f({ x: x + l / 2, y: y + h / 2, z, l: p, h, vers: "droite" });
  f({ x: x - l / 2, y: y + h / 2, z, l: p, h, vers: "gauche" });
}

// Le plancher en dalles d'environ 1,5 m : leurs arêtes lumineuses dessinent le quadrillage. De longues bandes fines
// pour les lignes faisaient clignoter la salle (voir « Salle 3D » dans globals.css).
function dalles(faces: Face[], x1: number, x2: number, z1: number, z2: number) {
  const nx = Math.max(1, Math.round((x2 - x1) / 150));
  const nz = Math.max(1, Math.round((z2 - z1) / 150));
  const l = (x2 - x1) / nx;
  const p = (z2 - z1) / nz;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) faces.push({ x: x1 + l * (i + 0.5), y: 0, z: z1 + p * (j + 0.5), l, h: p, vers: "haut", classe: "plancher" });
}

// Un mur percé d'une porte, vu d'un seul côté : deux pans et le linteau au-dessus.
function murAvecPorte(faces: Face[], x: number, z1: number, z2: number, vers: Orientation) {
  const pan = (a: number, b: number) => faces.push({ x, y: HAUTEUR / 2, z: (a + b) / 2, l: b - a, h: HAUTEUR, vers, classe: "mur" });
  pan(z1, PORTE.z1);
  pan(PORTE.z2, z2);
  faces.push({ x, y: (PORTE.haut + HAUTEUR) / 2, z: (PORTE.z1 + PORTE.z2) / 2, l: PORTE.z2 - PORTE.z1, h: HAUTEUR - PORTE.haut, vers, classe: "mur" });
}

function poste(faces: Face[], p: Poste, ecranH: number) {
  const m = mesures(p, ecranH);
  const devant: Orientation = p.sens === 1 ? "avant" : "arriere";
  const derriere: Orientation = p.sens === 1 ? "arriere" : "avant";
  // Le boîtier du PC, et le moniteur posé dessus (comme les IBM PC de l'époque) : le dessus du boîtier est caché
  boite(faces, p.x, TABLE_Y, m.z(-10), 42, 14, 40, "boitier", ["bas", "haut"]);
  const moniteurZ = m.z(-12);
  boite(faces, p.x, TABLE_Y + 14, moniteurZ, 38, m.moniteurH, 34, "moniteur", ["bas", devant]);
  const faceZ = moniteurZ + (p.sens * 34) / 2;
  if (p.place === "moi") {
    // Le cadre autour de l'écran en quatre bandes : l'écran (le site lui-même) est un peu en retrait, dans le trou.
    const ecranBas = TABLE_Y + 14 + 6;
    const cote = (38 - ECRAN_LARGEUR) / 2;
    faces.push({ x: p.x, y: TABLE_Y + 14 + 3, z: faceZ, l: 38, h: 6, vers: devant, classe: "moniteur" });
    faces.push({ x: p.x, y: ecranBas + ecranH + 3.5, z: faceZ, l: 38, h: 7, vers: devant, classe: "moniteur" });
    faces.push({ x: p.x - 38 / 2 + cote / 2, y: ecranBas + ecranH / 2, z: faceZ, l: cote, h: ecranH, vers: devant, classe: "moniteur" });
    faces.push({ x: p.x + 38 / 2 - cote / 2, y: ecranBas + ecranH / 2, z: faceZ, l: cote, h: ecranH, vers: devant, classe: "moniteur" });
  } else {
    faces.push({ x: p.x, y: TABLE_Y + 14 + m.moniteurH / 2, z: faceZ, l: 38, h: m.moniteurH, vers: devant, classe: "moniteur ecran-eteint", contenu: p.ecran });
  }
  // Clavier, et chaise : un siège, un dossier vu des deux côtés, un pied
  faces.push({ x: p.x, y: TABLE_Y + 2.5, z: m.z(22), l: 44, h: 15, vers: "haut", classe: "clavier" });
  faces.push({ x: p.x, y: 46, z: m.siege.z, l: 44, h: 42, vers: "haut", classe: "chaise" });
  faces.push({ x: p.x, y: 71, z: m.z(95), l: 42, h: 42, vers: derriere, classe: "chaise" });
  faces.push({ x: p.x, y: 71, z: m.z(95), l: 42, h: 42, vers: devant, classe: "chaise" });
  for (const vers of [devant, derriere]) faces.push({ x: p.x, y: 23, z: m.siege.z, l: 5, h: 46, vers, classe: "chaise" });
}

function table(faces: Face[], x1: number, x2: number, z: number, p = 70) {
  const x = (x1 + x2) / 2;
  const l = x2 - x1;
  faces.push({ x, y: TABLE_Y, z, l, h: p, vers: "haut", classe: "table" });
  for (const [dz, vers] of [[p / 2, "avant"], [-p / 2, "arriere"]] as const) faces.push({ x, y: TABLE_Y - 6, z: z + dz, l, h: 12, vers, classe: "table" });
  for (const [dx, vers] of [[l / 2, "droite"], [-l / 2, "gauche"]] as const) faces.push({ x: x + dx, y: TABLE_Y / 2, z, l: p, h: TABLE_Y, vers, classe: "table" });
}

/** Toutes les faces de la salle. ecranH : hauteur des écrans, selon les proportions de la fenêtre. */
export function faces(ecranH: number): Face[] {
  const f: Face[] = [];
  const largeurClasse = CLASSE.x2 - CLASSE.x1;
  const profondeurClasse = CLASSE.z2 - CLASSE.z1;
  const largeurReseau = RESEAU.x2 - RESEAU.x1;
  const profondeurReseau = RESEAU.z2 - RESEAU.z1;

  // La classe : plancher quadrillé, murs (celui de droite percé de la porte de la salle réseau). Pas de plafond :
  // il serait noir comme le fond ; on ne voit que ses néons, et ça fait une face géante de moins à afficher.
  dalles(f, CLASSE.x1, CLASSE.x2, CLASSE.z1, CLASSE.z2);
  f.push({ x: 0, y: HAUTEUR / 2, z: CLASSE.z1, l: largeurClasse, h: HAUTEUR, vers: "avant", classe: "mur" });
  f.push({ x: 0, y: HAUTEUR / 2, z: CLASSE.z2, l: largeurClasse, h: HAUTEUR, vers: "arriere", classe: "mur" });
  f.push({ x: CLASSE.x1, y: HAUTEUR / 2, z: 0, l: profondeurClasse, h: HAUTEUR, vers: "droite", classe: "mur" });
  murAvecPorte(f, CLASSE.x2, CLASSE.z1, CLASSE.z2, "gauche");

  // La salle réseau, de l'autre côté de la porte
  const cx = (RESEAU.x1 + RESEAU.x2) / 2;
  const cz = (RESEAU.z1 + RESEAU.z2) / 2;
  dalles(f, RESEAU.x1, RESEAU.x2, RESEAU.z1, RESEAU.z2);
  f.push({ x: cx, y: HAUTEUR / 2, z: RESEAU.z1, l: largeurReseau, h: HAUTEUR, vers: "avant", classe: "mur", contenu: "schema" });
  f.push({ x: cx, y: HAUTEUR / 2, z: RESEAU.z2, l: largeurReseau, h: HAUTEUR, vers: "arriere", classe: "mur" });
  f.push({ x: RESEAU.x2, y: HAUTEUR / 2, z: cz, l: profondeurReseau, h: HAUTEUR, vers: "gauche", classe: "mur" });
  murAvecPorte(f, RESEAU.x1, RESEAU.z1, RESEAU.z2, "droite");
  // L'embrasure de la porte (l'épaisseur du mur)
  const e = 12;
  f.push({ x: CLASSE.x2 + e / 2 - 6, y: PORTE.haut / 2, z: PORTE.z1, l: e, h: PORTE.haut, vers: "avant", classe: "cadre" });
  f.push({ x: CLASSE.x2 + e / 2 - 6, y: PORTE.haut / 2, z: PORTE.z2, l: e, h: PORTE.haut, vers: "arriere", classe: "cadre" });
  f.push({ x: CLASSE.x2 + e / 2 - 6, y: PORTE.haut, z: (PORTE.z1 + PORTE.z2) / 2, l: e, h: PORTE.z2 - PORTE.z1, vers: "bas", classe: "cadre" });

  // Néons au plafond
  for (const z of [-220, 0, 220]) for (const x of [-220, 220]) f.push({ x, y: HAUTEUR - 1, z, l: 120, h: 30, vers: "bas", classe: "neon" });
  f.push({ x: cx, y: HAUTEUR - 1, z: cz, l: 30, h: 120, vers: "bas", classe: "neon" });

  // Le tableau, les fenêtres (la nuit dehors), les affiches, l'horloge, l'écriteau de la porte
  f.push({ x: 0, y: 150, z: CLASSE.z1 + 1, l: 420, h: 130, vers: "avant", classe: "tableau", contenu: "tableau" });
  f.push({ x: 0, y: 82, z: CLASSE.z1 + 4, l: 420, h: 6, vers: "haut", classe: "table" });
  for (const z of [-250, -40]) f.push({ x: CLASSE.x1 + 1, y: 165, z, l: 160, h: 110, vers: "droite", classe: "fenetre" });
  f.push({ x: CLASSE.x1 + 1, y: 160, z: 170, l: 70, h: 95, vers: "droite", classe: "affiche", contenu: "rtfm" });
  f.push({ x: CLASSE.x1 + 1, y: 160, z: 300, l: 90, h: 95, vers: "droite", classe: "affiche", contenu: "binaire" });
  f.push({ x: CLASSE.x2 - 1, y: 160, z: -150, l: 110, h: 70, vers: "gauche", classe: "affiche", contenu: "manger" });
  f.push({ x: -150, y: 225, z: CLASSE.z2 - 1, l: 70, h: 30, vers: "arriere", classe: "affiche", contenu: "horloge" });
  f.push({ x: CLASSE.x2 - 1, y: 238, z: (PORTE.z1 + PORTE.z2) / 2, l: 110, h: 26, vers: "gauche", classe: "affiche", contenu: "porte" });

  // Tables, postes et bureau du prof
  for (const z of RANGEES) for (const [x1, x2] of TABLES) table(f, x1, x2, z);
  table(f, BUREAU_PROF.x - 80, BUREAU_PROF.x + 80, BUREAU_PROF.z);
  table(f, TABLE_RESEAU.x - 80, TABLE_RESEAU.x + 80, TABLE_RESEAU.z);
  for (const p of postes()) poste(f, p, ecranH);

  // Baies de serveurs, tournées vers la porte : leurs façades clignotent (voir salle-3d.tsx)
  const largeurBaie = (BAIES.z2 - BAIES.z1) / 3;
  for (let i = 0; i < 3; i++) {
    const z = BAIES.z1 + largeurBaie * (i + 0.5);
    boite(f, (BAIES.x1 + BAIES.x2) / 2, 0, z, BAIES.x2 - BAIES.x1, 200, largeurBaie - 4, "baie", ["bas", "gauche"]);
    f.push({ x: BAIES.x1, y: 100, z, l: largeurBaie - 4, h: 200, vers: "gauche", classe: "baie facade", contenu: i === 1 ? "baie-panneau" : "baie" });
  }
  return f;
}

// ---------- Déplacements ----------

/** Les obstacles : murs (avec l'ouverture de la porte), tables et baies. */
export function obstacles(): Obstacle[] {
  const mur = (x1: number, z1: number, x2: number, z2: number): Obstacle => ({ x1: x1 - 1, z1: z1 - 1, x2: x2 + 1, z2: z2 + 1 });
  const liste: Obstacle[] = [
    mur(CLASSE.x1, CLASSE.z1, CLASSE.x2, CLASSE.z1),
    mur(CLASSE.x1, CLASSE.z2, CLASSE.x2, CLASSE.z2),
    mur(CLASSE.x1, CLASSE.z1, CLASSE.x1, CLASSE.z2),
    mur(CLASSE.x2, CLASSE.z1, CLASSE.x2, PORTE.z1),
    mur(CLASSE.x2, PORTE.z2, CLASSE.x2, CLASSE.z2),
    mur(RESEAU.x1, RESEAU.z1, RESEAU.x2, RESEAU.z1),
    mur(RESEAU.x1, RESEAU.z2, RESEAU.x2, RESEAU.z2),
    mur(RESEAU.x2, RESEAU.z1, RESEAU.x2, RESEAU.z2),
    { x1: BAIES.x1, z1: BAIES.z1, x2: BAIES.x2, z2: BAIES.z2 },
    { x1: BUREAU_PROF.x - 80, z1: BUREAU_PROF.z - 35, x2: BUREAU_PROF.x + 80, z2: BUREAU_PROF.z + 35 },
    { x1: TABLE_RESEAU.x - 80, z1: TABLE_RESEAU.z - 35, x2: TABLE_RESEAU.x + 80, z2: TABLE_RESEAU.z + 35 },
  ];
  for (const z of RANGEES) for (const [x1, x2] of TABLES) liste.push({ x1, z1: z - 35, x2, z2: z + 35 });
  return liste;
}

export function bloque(x: number, z: number, liste: Obstacle[], rayon = RAYON): boolean {
  return liste.some((o) => x > o.x1 - rayon && x < o.x2 + rayon && z > o.z1 - rayon && z < o.z2 + rayon);
}

/** Avance de (dx, dz) sans traverser les obstacles : on glisse le long d'un mur au lieu de s'y arrêter net. */
export function deplacer(x: number, z: number, dx: number, dz: number, liste: Obstacle[]): { x: number; z: number } {
  if (!bloque(x + dx, z, liste)) x += dx;
  if (!bloque(x, z + dz, liste)) z += dz;
  return { x, z };
}

/** Ramène un angle entre -180 et 180 degrés. */
export function angle(a: number): number {
  return ((((a + 180) % 360) + 360) % 360) - 180;
}

/** Le poste devant lequel on peut s'asseoir : assez proche de sa chaise et tourné vers son écran. */
export function posteAPortee(pose: Pose, liste: Poste[], ecranH: number): Poste | null {
  for (const p of liste) {
    if (!p.place) continue;
    const { ecran, siege } = reperes(p, ecranH);
    if (Math.hypot(pose.x - siege.x, pose.z - siege.z) > 85) continue;
    // Lacet qui regarde droit vers l'écran : 0 vers les z négatifs, positif vers la gauche
    const vise = (Math.atan2(-(ecran.x - pose.x), -(ecran.z - pose.z)) * 180) / Math.PI;
    if (Math.abs(angle(vise - pose.lacet)) < 55) return p;
  }
  return null;
}

/** Dans quelle salle on se trouve, pour l'invite affichée en haut de l'écran. */
export function lieu(x: number): string {
  return x > CLASSE.x2 ? "C:\\DEPINFO\\RESEAU>" : "C:\\DEPINFO\\CLASSE>";
}
