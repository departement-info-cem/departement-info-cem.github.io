// Le monde du jeu réseau : une petite salle réseau vue de dessus, avec des PC, des commutateurs (switchs), un routeur
// et des câbles. La simulation d'un ping est simplifiée mais honnête : couche physique (câble, port),
// couche 2 (VLAN), couche 3 (adresse, masque, passerelle), à l'aller ET au retour.

export type Port = { actif: boolean; vlan?: number; ip?: string };
export type Appareil = {
  id: string;
  type: "pc" | "switch" | "routeur";
  nom: string;
  /** position en cases */
  x: number;
  y: number;
  ports: Port[];
  ip?: string;
  passerelle?: string;
  /** choix offerts au joueur (absent = non modifiable) */
  choixIp?: string[];
  choixPasserelle?: string[];
  choixVlan?: number[];
};
export type Bout = { app: string; port: number };
export type Cable = { id: string; a: Bout; b: Bout | null; fixe?: boolean };
export type Reseau = { appareils: Appareil[]; cables: Cable[] };

export type NiveauReseau = {
  titre: string;
  notion: string;
  histoire: string;
  indice: string;
  bravo: string;
  /** « # » mur, « = » baie de serveurs (décor), « . » plancher */
  salle: string[];
  joueur: { x: number; y: number };
  /** bout de câble qui traîne par terre */
  boutAuSol?: { cable: string; x: number; y: number };
  source: string;
  destination: string;
  reseau: Reseau;
};

export const MASQUE = "255.255.255.0";
const reseauDe = (ip: string) => ip.split(".").slice(0, 3).join(".");

export const appareil = (r: Reseau, id: string) => r.appareils.find((a) => a.id === id)!;
const memeBout = (a: Bout | null, app: string, port: number) => a?.app === app && a.port === port;

export function cableDe(r: Reseau, app: string, port: number): Cable | undefined {
  return r.cables.find((c) => memeBout(c.a, app, port) || memeBout(c.b, app, port));
}

function autreBout(r: Reseau, app: string, port: number): Bout | null {
  const c = cableDe(r, app, port);
  if (!c) return null;
  return memeBout(c.a, app, port) ? c.b : c.a;
}

export type Diode = "eteinte" | "orange" | "verte";

/** Diode d'un port : éteinte sans lien physique, orange si un des deux bouts est désactivé, verte si le lien est établi. */
export function diode(r: Reseau, app: string, port: number): Diode {
  const bout = autreBout(r, app, port);
  if (!bout) return "eteinte";
  return appareil(r, app).ports[port].actif && appareil(r, bout.app).ports[bout.port].actif ? "verte" : "orange";
}

const voisin = (r: Reseau, app: string, port: number) => (diode(r, app, port) === "verte" ? autreBout(r, app, port) : null);

/** Livraison sur le réseau local : on cherche l'appareil qui a l'adresse demandée, à travers les switchs et les VLAN. */
function livrer(r: Reseau, depart: Bout, ip: string): { chemin: string[]; arrivee: Bout | null; derniers: string[] } {
  const visites = new Set<string>();
  const trouves: { chemin: string[]; arrivee: Bout }[] = [];
  let plusLoin: string[] = [depart.app];
  const file: { bout: Bout; vlan: number | null; chemin: string[] }[] = [];
  const v = voisin(r, depart.app, depart.port);
  if (v) file.push({ bout: v, vlan: null, chemin: [depart.app, v.app] });
  while (file.length) {
    const { bout, vlan, chemin } = file.shift()!;
    const a = appareil(r, bout.app);
    if (chemin.length > plusLoin.length) plusLoin = chemin;
    if (a.type !== "switch") {
      if (a.ip === ip || a.ports[bout.port].ip === ip) trouves.push({ chemin, arrivee: bout });
      continue;
    }
    if (visites.has(a.id)) continue;
    visites.add(a.id);
    const vlanPort = a.ports[bout.port].vlan ?? 1;
    const vlanTrame = vlan ?? vlanPort;
    if (vlanPort !== vlanTrame) continue;
    a.ports.forEach((p, i) => {
      if (i === bout.port || !p.actif || (p.vlan ?? 1) !== vlanTrame) return;
      const suivant = voisin(r, a.id, i);
      if (suivant) file.push({ bout: suivant, vlan: vlanTrame, chemin: [...chemin, suivant.app] });
    });
  }
  if (trouves.length) return { chemin: trouves[0].chemin, arrivee: trouves[0].arrivee, derniers: plusLoin };
  return { chemin: plusLoin, arrivee: null, derniers: plusLoin };
}

export type ResultatPing = { ok: boolean; aller: string[]; retour: string[]; message: string; explication: string };

function trajet(r: Reseau, src: string, ipDst: string): { ok: boolean; chemin: string[]; message: string; explication: string; arrivee?: string } {
  const chemin = [src];
  let courant = appareil(r, src);
  let sortie = 0;
  for (let ttl = 8; ttl > 0; ttl--) {
    let prochaine: string | undefined;
    if (courant.type === "pc") {
      if (courant.ip && reseauDe(courant.ip) === reseauDe(ipDst)) prochaine = ipDst;
      else if (!courant.passerelle) return { ok: false, chemin, message: "Échec général : réseau inaccessible.", explication: `${ipDst} n'est pas dans le réseau de ${courant.nom} (${courant.ip}), et ${courant.nom} n'a pas de passerelle pour en sortir.` };
      else if (reseauDe(courant.passerelle) !== reseauDe(courant.ip!)) return { ok: false, chemin, message: "Échec général : réseau inaccessible.", explication: `La passerelle de ${courant.nom} (${courant.passerelle}) n'est pas dans son propre réseau (${courant.ip}) : impossible de la joindre.` };
      else prochaine = courant.passerelle;
      sortie = 0;
    } else {
      const i = courant.ports.findIndex((p) => p.ip && reseauDe(p.ip) === reseauDe(ipDst));
      if (i < 0) return { ok: false, chemin, message: "Réseau de destination inaccessible.", explication: `${courant.nom} ne connaît aucune route vers le réseau ${reseauDe(ipDst)}.0.` };
      if (courant.ports[i].ip === ipDst) return { ok: true, chemin, message: "", explication: "", arrivee: courant.id };
      sortie = i;
      prochaine = ipDst;
    }
    const l = livrer(r, { app: courant.id, port: sortie }, prochaine);
    chemin.push(...l.chemin.slice(1));
    if (!l.arrivee) {
      const dernier = appareil(r, l.chemin.at(-1)!);
      const d = diode(r, courant.id, sortie);
      return {
        ok: false,
        chemin,
        message: `Hôte de destination inaccessible.`,
        explication:
          l.chemin.length === 1
            ? `Le message ne sort même pas de ${courant.nom} : la diode de son port est ${d === "orange" ? "orange (un des deux ports est désactivé)" : "éteinte (pas de câble)"}.`
            : `Personne ne répond à l'adresse ${prochaine}. Le message s'est rendu jusqu'à ${dernier.nom}.`,
      };
    }
    const a = appareil(r, l.arrivee.app);
    if (a.ip === ipDst) return { ok: true, chemin, message: "", explication: "", arrivee: a.id };
    courant = a;
  }
  return { ok: false, chemin, message: "Durée de vie expirée.", explication: "Le message tourne en rond entre les routeurs." };
}

export function ping(r: Reseau, src: string, dst: string): ResultatPing {
  const [s, d] = [appareil(r, src), appareil(r, dst)];
  if (s.ip === d.ip) return { ok: false, aller: [src], retour: [], message: "Conflit d'adresses IP.", explication: `${s.nom} et ${d.nom} ont la même adresse (${s.ip}) : chacun doit avoir la sienne.` };
  const prisePar = r.appareils.find((a) => a.id !== dst && (a.ip === d.ip || a.ports.some((p) => p.ip === d.ip)));
  if (prisePar) return { ok: false, aller: [src], retour: [], message: "Conflit d'adresses IP.", explication: `${prisePar.nom} utilise déjà l'adresse ${d.ip}.` };
  const a = trajet(r, src, d.ip!);
  if (!a.ok) return { ok: false, aller: a.chemin, retour: [], message: a.message, explication: a.explication };
  const b = trajet(r, dst, s.ip!);
  if (!b.ok) return { ok: false, aller: a.chemin, retour: b.chemin, message: "Délai d'attente de la demande dépassé.", explication: `La demande s'est rendue à ${d.nom}, mais la réponse se perd au retour. ${b.explication}` };
  return { ok: true, aller: a.chemin, retour: b.chemin, message: `Réponse de ${d.ip} : octets=32 temps<1ms`, explication: "L'aller et le retour fonctionnent." };
}

const pc = (id: string, nom: string, x: number, y: number, ip: string, extra: Partial<Appareil> = {}): Appareil => ({ id, type: "pc", nom, x, y, ip, ports: [{ actif: true }], ...extra });
const sw = (id: string, nom: string, x: number, y: number, ports: Port[], extra: Partial<Appareil> = {}): Appareil => ({ id, type: "switch", nom, x, y, ports, ...extra });
const ports = (n: number, vlan?: number): Port[] => Array.from({ length: n }, () => ({ actif: true, vlan }));
const lien = (id: string, a: [string, number], b: [string, number] | null, fixe = true): Cable => ({ id, a: { app: a[0], port: a[1] }, b: b && { app: b[0], port: b[1] }, fixe });

export const NIVEAUX_RESEAU: NiveauReseau[] = [
  {
    titre: "Le câble qui traîne",
    notion: "Couche physique : sans câble, pas de réseau",
    histoire: "Quelqu'un s'est pris les pieds dans un câble. Accueil n'arrive plus à joindre Biblio. Trouve le bout du câble et rebranche-le.",
    indice: "Marche sur le bout de câble qui traîne pour le ramasser, puis va voir le PC dont la diode est éteinte.",
    bravo: "La diode est passée au vert : le lien physique est établi. C'est toujours la première chose à vérifier !",
    salle: ["###############", "#......=......#", "#.............#", "#.............#", "#.............#", "#.............#", "#......=......#", "#.............#", "###############"],
    joueur: { x: 7, y: 7 },
    boutAuSol: { cable: "c2", x: 9, y: 5 },
    source: "accueil",
    destination: "biblio",
    reseau: {
      appareils: [pc("accueil", "Accueil", 2, 2, "192.168.1.10"), sw("sw", "Switch 1", 7, 3, ports(4)), pc("biblio", "Biblio", 12, 2, "192.168.1.20")],
      cables: [lien("c1", ["accueil", 0], ["sw", 0]), lien("c2", ["sw", 2], null, false)],
    },
  },
  {
    titre: "La diode orange",
    notion: "Un port peut être désactivé",
    histoire: "Tous les câbles sont branchés, et pourtant Labo 1 ne rejoint pas Labo 2. Regarde bien les diodes du switch…",
    indice: "Une diode orange : le câble est là, mais le port est désactivé d'un côté ou de l'autre. Examine les deux switchs.",
    bravo: "Un administrateur avait fermé le port (shutdown). Les ports inutilisés se ferment par sécurité : il faut penser à les rouvrir !",
    salle: ["###############", "#.............#", "#.............#", "#.............#", "#......=......#", "#......=......#", "#.............#", "#.............#", "###############"],
    joueur: { x: 2, y: 6 },
    source: "labo1",
    destination: "labo2",
    reseau: {
      appareils: [
        pc("labo1", "Labo 1", 2, 2, "10.0.0.11"),
        sw("swa", "Switch A", 5, 2, [{ actif: true }, { actif: true }, { actif: true }]),
        sw("swb", "Switch B", 9, 2, [{ actif: true }, { actif: false }, { actif: true }]),
        pc("labo2", "Labo 2", 12, 2, "10.0.0.12"),
        pc("labo3", "Labo 3", 12, 6, "10.0.0.13"),
      ],
      cables: [lien("c1", ["labo1", 0], ["swa", 0]), lien("c2", ["swa", 2], ["swb", 0]), lien("c3", ["swb", 1], ["labo2", 0]), lien("c4", ["swb", 2], ["labo3", 0])],
    },
  },
  {
    titre: "La mauvaise adresse",
    notion: "Couche 3 : être dans le même réseau, sans conflit",
    histoire: "Toutes les diodes sont vertes, mais le nouveau PC de Sam est injoignable depuis celui d'Alex. Le masque est 255.255.255.0 : les trois premiers nombres doivent être identiques.",
    indice: "Compare les adresses de Alex et de Sam. Choisis-en une dans le même réseau… que personne n'utilise déjà.",
    bravo: "Même réseau, adresse unique : ils peuvent se parler sans routeur.",
    salle: ["###############", "#......=......#", "#.............#", "#.............#", "#.............#", "#.............#", "#.............#", "#.............#", "###############"],
    joueur: { x: 7, y: 6 },
    source: "alex",
    destination: "sam",
    reseau: {
      appareils: [
        pc("alex", "PC d'Alex", 2, 2, "192.168.5.10"),
        sw("sw", "Switch 1", 7, 3, ports(4)),
        pc("sam", "PC de Sam", 12, 2, "192.168.50.12", { choixIp: ["192.168.50.12", "192.168.5.10", "192.168.5.30", "192.168.5.42", "192.168.6.12"] }),
        pc("imprimante", "Imprimante", 12, 6, "192.168.5.30"),
      ],
      cables: [lien("c1", ["alex", 0], ["sw", 0]), lien("c2", ["sw", 1], ["sam", 0]), lien("c3", ["sw", 2], ["imprimante", 0])],
    },
  },
  {
    titre: "Les réseaux invisibles",
    notion: "Couche 2 : les VLAN séparent un même switch",
    histoire: "Diodes vertes, bonnes adresses… et rien ne passe entre les deux profs. Ce switch est découpé en réseaux virtuels (VLAN) : les PC des profs doivent être dans le même.",
    indice: "Ouvre le switch et regarde le VLAN de chaque port. Les deux profs doivent avoir le même numéro, partout sur le chemin : aussi sur le lien entre les deux switchs.",
    bravo: "Un VLAN, c'est comme un switch dans le switch : des câbles communs, mais des réseaux étanches.",
    salle: ["###############", "#.............#", "#.............#", "#.............#", "#......=......#", "#.............#", "#.............#", "#.............#", "###############"],
    joueur: { x: 7, y: 6 },
    source: "prof1",
    destination: "prof2",
    reseau: {
      appareils: [
        pc("prof1", "Prof 1", 2, 2, "172.16.10.1"),
        pc("eleve", "Élève", 2, 6, "172.16.10.50"),
        sw("swa", "Switch A", 5, 3, [{ actif: true, vlan: 10 }, { actif: true, vlan: 20 }, { actif: true, vlan: 20 }], { choixVlan: [10, 20] }),
        sw("swb", "Switch B", 9, 3, [{ actif: true, vlan: 10 }, { actif: true, vlan: 20 }, { actif: true, vlan: 20 }], { choixVlan: [10, 20] }),
        pc("prof2", "Prof 2", 12, 2, "172.16.10.2"),
      ],
      cables: [lien("c1", ["prof1", 0], ["swa", 0]), lien("c2", ["eleve", 0], ["swa", 1]), lien("c3", ["swa", 2], ["swb", 0]), lien("c4", ["swb", 1], ["prof2", 0])],
    },
  },
  {
    titre: "La panne du vendredi soir",
    notion: "Tout à la fois : routeur, passerelles, ports et câbles",
    histoire: "Deux réseaux, un routeur entre les deux, et plusieurs pannes en même temps. Le Siège doit joindre l'Entrepôt. Procède couche par couche : câbles, ports, adresses, passerelles.",
    indice: "1) Un bout de câble traîne. 2) Une interface du routeur est fermée. 3) La passerelle d'un PC doit être l'adresse du routeur DANS son réseau. 4) La réponse doit aussi pouvoir revenir !",
    bravo: "Tu viens de faire un vrai dépannage réseau, couche par couche. On t'attend en DEC Réseau !",
    salle: ["###############", "#......=......#", "#.............#", "#.............#", "#.............#", "#.............#", "#.............#", "#......=......#", "###############"],
    joueur: { x: 7, y: 5 },
    boutAuSol: { cable: "c2", x: 4, y: 5 },
    source: "siege",
    destination: "entrepot",
    reseau: {
      appareils: [
        pc("siege", "Siège", 2, 2, "192.168.1.10", { passerelle: "192.168.2.1", choixPasserelle: ["(aucune)", "192.168.1.1", "192.168.2.1", "192.168.1.10"] }),
        sw("swa", "Switch A", 4, 4, ports(3)),
        { id: "rt", type: "routeur", nom: "Routeur", x: 7, y: 3, ports: [{ actif: true, ip: "192.168.1.1" }, { actif: false, ip: "192.168.2.1" }] },
        sw("swb", "Switch B", 10, 4, ports(3)),
        pc("entrepot", "Entrepôt", 12, 2, "192.168.2.20", { choixPasserelle: ["(aucune)", "192.168.1.1", "192.168.2.1", "192.168.2.254"] }),
        pc("serveur", "Serveur", 12, 6, "192.168.2.50", { passerelle: "192.168.2.1" }),
      ],
      cables: [lien("c1", ["siege", 0], ["swa", 0]), lien("c2", ["swa", 2], null, false), lien("c3", ["rt", 1], ["swb", 0]), lien("c4", ["swb", 1], ["entrepot", 0]), lien("c5", ["swb", 2], ["serveur", 0])],
    },
  },
];
