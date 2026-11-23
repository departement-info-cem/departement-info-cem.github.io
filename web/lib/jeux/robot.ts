// Le monde du jeu de programmation : Octet, un petit robot, range des paquets de données dans un centre de données.
import { analyser, ErreurPython, executer, type Etape, type Native } from "@/lib/jeux/mini-python";

// Cartes : « . » plancher, « # » serveur (obstacle), « o » paquet, « T » terminal, « > v < ^ » départ, espace = vide
export type Niveau = {
  titre: string;
  notion: string;
  consigne: string;
  indice: string;
  cartes: string[][];
  commandes: string[];
  maxLignes?: number;
  depart: string;
  solution: string;
};

export type Monde = {
  carte: string[][];
  x: number;
  y: number;
  /** 0 = est, 1 = sud, 2 = ouest, 3 = nord. Peut dépasser 3 pour que la rotation animée reste continue. */
  dir: number;
  paquets: Set<string>;
  ramasses: number;
  total: number;
};

const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];
const cle = (x: number, y: number) => `${x},${y}`;

export function creerMonde(lignes: string[]): Monde {
  const largeur = Math.max(...lignes.map((l) => l.length));
  const carte = lignes.map((l) => l.padEnd(largeur).split(""));
  const monde: Monde = { carte, x: 0, y: 0, dir: 0, paquets: new Set(), ramasses: 0, total: 0 };
  carte.forEach((ligne, y) =>
    ligne.forEach((c, x) => {
      const d = ">v<^".indexOf(c);
      if (d >= 0) {
        Object.assign(monde, { x, y, dir: d });
        ligne[x] = ".";
      }
      if (c === "o") {
        monde.paquets.add(cle(x, y));
        ligne[x] = ".";
      }
    }),
  );
  monde.total = monde.paquets.size;
  return monde;
}

export const copier = (m: Monde): Monde => ({ ...m, paquets: new Set(m.paquets) });

const libre = (m: Monde, dir: number) => {
  const d = ((dir % 4) + 4) % 4;
  const c = m.carte[m.y + DY[d]]?.[m.x + DX[d]];
  return c === "." || c === "T";
};

export function natives(m: Monde): Record<string, Native> {
  const capteur = (f: () => boolean): Native => ({ arite: 0, action: false, f });
  const action = (f: () => void): Native => ({
    arite: 0,
    action: true,
    f: () => {
      f();
      return null;
    },
  });
  return {
    avancer: action(() => {
      const d = ((m.dir % 4) + 4) % 4;
      const c = m.carte[m.y + DY[d]]?.[m.x + DX[d]];
      if (c === "#") throw new Error("Boum ! Octet a foncé dans un serveur.");
      if (c === undefined || c === " ") throw new Error("Oups ! Octet allait tomber dans le vide.");
      m.x += DX[d];
      m.y += DY[d];
    }),
    tourner_gauche: action(() => (m.dir -= 1)),
    tourner_droite: action(() => (m.dir += 1)),
    ramasser: action(() => {
      if (!m.paquets.delete(cle(m.x, m.y))) throw new Error("Il n'y a pas de paquet à ramasser ici.");
      m.ramasses++;
    }),
    devant_libre: capteur(() => libre(m, m.dir)),
    droite_libre: capteur(() => libre(m, m.dir + 1)),
    gauche_libre: capteur(() => libre(m, m.dir - 1)),
    sur_paquet: capteur(() => m.paquets.has(cle(m.x, m.y))),
    sur_terminal: capteur(() => m.carte[m.y][m.x] === "T"),
  };
}

/** null si la mission est réussie, sinon ce qui manque. */
export function bilan(m: Monde): string | null {
  if (m.paquets.size) return `Il reste ${m.paquets.size} paquet${m.paquets.size > 1 ? "s" : ""} à ramasser.`;
  if (m.carte[m.y][m.x] !== "T") return "Octet doit terminer sur le terminal vert.";
  return null;
}

export function lancer(source: string, monde: Monde, commandes?: string[]): Generator<Etape, void> {
  const toutes = natives(monde);
  const permises = commandes ? Object.fromEntries(Object.entries(toutes).filter(([n]) => commandes.includes(n))) : toutes;
  return executer(analyser(source), permises);
}

/** Exécute d'un coup (tests, vérification sur les autres cartes). */
export function verifier(source: string, niveau: Niveau, n: number): string | null {
  const m = creerMonde(niveau.cartes[n]);
  try {
    for (const e of lancer(source, m, niveau.commandes)) void e;
  } catch (e) {
    if (e instanceof ErreurPython) return `Ligne ${e.ligne} : ${e.message}`;
    throw e;
  }
  return bilan(m);
}

const BASE = ["avancer", "tourner_gauche", "tourner_droite", "ramasser"];

export const NIVEAUX: Niveau[] = [
  {
    titre: "Premier démarrage",
    notion: "Une séquence d'instructions",
    consigne: "Un programme, c'est une suite d'instructions exécutées dans l'ordre. Fais ramasser le paquet de données à Octet, puis amène-le au terminal vert.",
    indice: "Avance jusqu'au paquet, ramasse-le, tourne à droite, puis avance encore.",
    cartes: [[">.o ", "  . ", "  . ", "  T "]],
    commandes: BASE,
    depart: "avancer()\navancer()\n",
    solution: "avancer()\navancer()\nramasser()\ntourner_droite()\navancer()\navancer()\navancer()",
  },
  {
    titre: "Le long corridor",
    notion: "Répéter avec une boucle for",
    consigne: "Six paquets de suite ! Au lieu de recopier six fois la même chose, utilise une boucle. Tu as droit à 5 lignes.",
    indice: "for i in range(6): répète six fois les lignes décalées en dessous : avancer, puis ramasser. Le terminal est une case plus loin.",
    cartes: [[">ooooooT"]],
    commandes: BASE,
    maxLignes: 5,
    depart: "for i in range(2):\n    avancer()\n",
    solution: "for i in range(6):\n    avancer()\n    ramasser()\navancer()",
  },
  {
    titre: "Dans le noir",
    notion: "Répéter tant que… (while) avec un capteur",
    consigne: "La panne de courant change la longueur des corridors : ton programme doit marcher sur les 3 plans. Utilise le capteur devant_libre().",
    indice: "while devant_libre(): avance tant qu'il n'y a pas d'obstacle. Il y a deux corridors : avance, ramasse, tourne à droite, avance encore.",
    cartes: [
      [">...o#", "####.#", "    T "],
      [">.o#", "##.#", " #.#", " #T "],
      [">......o#", "#######.#", "      #.#", "      #.#", "      #T "],
    ],
    commandes: [...BASE, "devant_libre"],
    maxLignes: 8,
    depart: "while devant_libre():\n    avancer()\n",
    solution: "while devant_libre():\n    avancer()\nramasser()\ntourner_droite()\nwhile devant_libre():\n    avancer()",
  },
  {
    titre: "Paquets perdus",
    notion: "Décider avec if",
    consigne: "Les paquets sont tombés n'importe où, et pas au même endroit sur les 3 plans. Ramasse seulement s'il y a quelque chose à ramasser !",
    indice: "Dans une boucle « while not sur_terminal(): », avance, puis « if sur_paquet(): » ramasse.",
    cartes: [[">.o..oo.T"], [">o.o.T"], [">..o.o.ooT"]],
    commandes: [...BASE, "devant_libre", "sur_paquet", "sur_terminal"],
    maxLignes: 6,
    depart: "while not sur_terminal():\n    avancer()\n",
    solution: "while not sur_terminal():\n    avancer()\n    if sur_paquet():\n        ramasser()",
  },
  {
    titre: "Le labyrinthe des serveurs",
    notion: "Un vrai algorithme",
    consigne: "Trois salles de serveurs différentes, un seul programme. Trouve une règle qui sort de n'importe quel labyrinthe, en ramassant les paquets croisés en route.",
    indice: "Garde toujours la main droite sur le mur : si la droite est libre, tourne à droite et avance ; sinon, si c'est libre devant, avance ; sinon, tourne à gauche.",
    cartes: [
      [">..#..", "##.#.T", "o..#.#", ".#...#", "......"],
      ["v#.o.", ".#.#.", "o..#.", "##.#T"],
      [">o.#T", "##.#.", "o..#.", ".####", "..o..", "##.#.", "T..#."],
    ],
    commandes: [...BASE, "devant_libre", "droite_libre", "gauche_libre", "sur_paquet", "sur_terminal"],
    maxLignes: 12,
    depart: "while not sur_terminal():\n    if droite_libre():\n        tourner_droite()\n    # à toi de continuer...\n    avancer()\n",
    solution:
      "while not sur_terminal():\n    if droite_libre():\n        tourner_droite()\n        avancer()\n    elif devant_libre():\n        avancer()\n    else:\n        tourner_gauche()\n    if sur_paquet():\n        ramasser()",
  },
];
