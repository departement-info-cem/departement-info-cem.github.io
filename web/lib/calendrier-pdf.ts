// Lecture du calendrier scolaire officiel (PDF) à partir des textes positionnés.
// Le PDF est un tableau : 5 colonnes (lundi à vendredi) pour l'automne à gauche, 5 pour l'hiver à droite.
//  - chaque case contient le jour du mois et parfois un code : « 11 JR* », « 6/Lu », « 16 EUL/EC » ;
//  - le petit chiffre au coin d'une case est le numéro de la séance : sans lui, pas de cours régulier ;
//  - des symboles (polices Wingdings) marquent le début et la fin de session, les dates limites, etc.
// Garde-fou : chaque case doit tomber sur le bon jour du mois, sinon on refuse le PDF.
import type { CalendrierScolaire, TypeJourScolaire } from "@/app/_types/divers";
import { dateDepuisIso, isoDepuisDate, MOIS } from "@/lib/temps";

export type TextePdf = { x: number; y: number; l: number; h: number; t: string };
type Journee = CalendrierScolaire["journees"][number];
export type CalendrierExtrait = {
  annee: string;
  revise?: string;
  sessions: CalendrierScolaire["sessions"];
  journees: Journee[];
  avertissements: string[];
};

const DEBUT_SESSION = "";
const FIN_SESSION = /[◄]/;
const POINT = ""; // ● désinscription, ●● abandon
const REMISE_NOTES = "";
const HORAIRES: Record<string, string> = { Lu: "lundi", Ma: "mardi", Me: "mercredi", Je: "jeudi", Ve: "vendredi" };

const CODES: Record<string, { titre: string; type: TypeJourScolaire }> = {
  JE: { titre: "Journée d'encadrement", type: "encadrement" },
  JM: { titre: "Journée de mise à jour", type: "mise-a-jour" },
  JP: { titre: "Journée pédagogique", type: "pedagogique" },
  JR: { titre: "Journée particulière d'enseignement (reprises)", type: "reprise" },
  "JR*": { titre: "Journée particulière d'enseignement (priorité à l'EUL)", type: "reprise" },
  JPR: { titre: "Journée provisoire de reprise", type: "reprise" },
  EC: { titre: "Évaluations terminales communes", type: "evaluations" },
  EUL: { titre: "Épreuve uniforme de langue", type: "evaluations" },
  EHR: { titre: "Évaluations terminales (horaire régulier)", type: "evaluations-horaire" },
  "ÉLECTIONS": { titre: "Journée d'élections (suspension des cours)", type: "suspension" },
};

const plus = (iso: string, jours: number) => {
  const d = dateDepuisIso(iso);
  d.setDate(d.getDate() + jours);
  return isoDepuisDate(d);
};

function paques(annee: number): string {
  // Calcul grégorien (Meeus)
  const a = annee % 19, b = Math.floor(annee / 100), c = annee % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31), jour = ((h + l - 7 * m + 114) % 31) + 1;
  return `${annee}-${String(mois).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
}

/** Le PDF dit seulement « congé férié » : on retrouve le nom d'après la date. */
export function nomConge(iso: string): string {
  const [annee, mois, jour] = iso.split("-").map(Number);
  const lundi = dateDepuisIso(iso).getDay() === 1;
  const p = paques(annee);
  if (iso === plus(p, -2)) return "Vendredi saint (congé)";
  if (iso === plus(p, 1)) return "Lundi de Pâques (congé)";
  if (mois === 9 && lundi && jour <= 7) return "Fête du Travail (congé)";
  if (mois === 10 && lundi && jour >= 8 && jour <= 14) return "Action de grâces (congé)";
  if (mois === 5 && lundi && jour >= 18 && jour <= 24) return "Journée nationale des patriotes (congé)";
  if (mois === 12 && jour === 25) return "Noël (congé)";
  if (mois === 1 && jour === 1) return "Jour de l'An (congé)";
  if (mois === 6 && jour === 24) return "Fête nationale (congé)";
  return "Congé férié";
}

export function analyserCalendrier(textes: TextePdf[]): CalendrierExtrait {
  const avertissements: string[] = [];
  const items = textes.filter((i) => i.t.trim());
  const tout = items.map((i) => i.t).join(" ");

  const titre = /CALENDRIER SCOLAIRE\s+(\d{4})\s*-\s*(\d{4})/.exec(tout);
  if (!titre) throw new Error("titre « CALENDRIER SCOLAIRE AAAA-AAAA » introuvable");
  const [an1, an2] = [Number(titre[1]), Number(titre[2])];
  if (an2 !== an1 + 1) throw new Error(`années incohérentes : ${titre[0]}`);
  const rev = /(?:Révisé|Adopté) le\s+(\d{1,2})(?:er)?\s+([a-zéû]+)\s+(\d{4})/i.exec(tout);
  const revise = rev && MOIS.includes(rev[2].toLowerCase()) ? `${rev[3]}-${String(MOIS.indexOf(rev[2].toLowerCase()) + 1).padStart(2, "0")}-${rev[1].padStart(2, "0")}` : undefined;

  // Les 10 colonnes, repérées par l'en-tête Lundi...Vendredi
  const enTetes = items.filter((i) => /^(Lundi|Mardi|Mercredi|Jeudi|Vendredi)$/.test(i.t.trim()));
  if (enTetes.length !== 10) throw new Error(`${enTetes.length} en-têtes de jours trouvés au lieu de 10`);
  const yEnTete = Math.max(...enTetes.map((i) => i.y));
  const centres = enTetes.map((i) => i.x + i.l / 2).sort((a, b) => a - b);
  const pas = (centres[4] - centres[0]) / 4;
  const colonne = (x: number) => centres.findIndex((c) => Math.abs(c - x) <= pas / 2 + 0.5);
  const legende = items.find((i) => i.t.trim().toUpperCase() === "LÉGENDE" && i.y < yEnTete);
  const premierCode = items.find((i) => i.t.trim() === "Journée d'encadrement");
  const yBas = Math.max(legende?.y ?? 0, premierCode?.y ?? 0);
  const cases = items.filter((i) => i.y < yEnTete - 3 && i.y > yBas + 3 && colonne(i.x + i.l / 2) >= 0);

  // Jour du mois (chiffre normal) ou numéro de séance (petit chiffre) : on compare à la taille des jours.
  const hauteurJour = Math.max(...cases.filter((i) => /^\d{1,2}$/.test(i.t.trim())).map((i) => i.h));
  const estSeance = (i: TextePdf) => /^\d{1,2}$/.test(i.t.trim()) && i.h < hauteurJour * 0.9;

  const journees: Journee[] = [];
  const sessions: CalendrierScolaire["sessions"] = [];
  let lundi = "";

  for (const moitie of [0, 1]) {
    const dans = cases.filter((i) => Math.floor(colonne(i.x + i.l / 2) / 5) === moitie);
    const lignes: { y: number; textes: TextePdf[] }[] = [];
    for (const i of dans.filter((i) => !estSeance(i) && /^\d{1,2}(\D|$)/.test(i.t.trim()))) {
      const ligne = lignes.find((l) => Math.abs(l.y - i.y) < 4);
      if (ligne) ligne.textes.push(i);
      else lignes.push({ y: i.y, textes: [i] });
    }
    lignes.sort((a, b) => b.y - a.y);
    if (!lignes.length) throw new Error("aucune semaine trouvée");

    if (moitie === 0) {
      // Premier lundi : on cherche en juillet ou en août de la première année
      const premier = parseInt(lignes[0].textes.find((t) => colonne(t.x + t.l / 2) === 0)?.t ?? "", 10);
      for (const m of [7, 8]) {
        const iso = `${an1}-0${m}-${String(premier).padStart(2, "0")}`;
        if (!lundi && dateDepuisIso(iso).getDay() === 1) lundi = iso;
      }
      if (!lundi) throw new Error("impossible de situer la première semaine");
    } else {
      lundi = plus(lundi, 7);
    }

    type Case = { iso: string; texte: string; seance: boolean };
    const jours: Case[] = [];
    lignes.forEach((ligne, n) => {
      if (n > 0) lundi = plus(lundi, 7);
      for (let c = 0; c < 5; c++) {
        const iso = plus(lundi, c);
        const ici = (i: TextePdf) => colonne(i.x + i.l / 2) === moitie * 5 + c;
        const contenu = dans.filter((i) => ici(i) && !estSeance(i) && Math.abs(i.y - ligne.y) < 4).sort((a, b) => a.x - b.x);
        const brut = contenu.map((i) => i.t.trim()).join(" ");
        const numero = /\d{1,2}/.exec(brut)?.[0];
        if (Number(numero) !== Number(iso.slice(8))) throw new Error(`case du ${iso} : le PDF indique « ${brut || "rien"} »`);
        const seance = dans.some((i) => ici(i) && estSeance(i) && i.y - ligne.y > 4 && i.y - ligne.y < 13);
        jours.push({ iso, texte: brut, seance });
      }
    });

    const debut = jours.find((j) => j.texte.includes(DEBUT_SESSION))?.iso;
    const fin = jours.find((j) => FIN_SESSION.test(j.texte))?.iso;
    if (!debut || !fin || fin < debut) throw new Error(`début ou fin de session introuvable (${moitie ? "hiver" : "automne"})`);
    sessions.push(moitie === 0 ? { id: `A${an1}`, nom: `Automne ${an1}`, debut, fin } : { id: `H${an2}`, nom: `Hiver ${an2}`, debut, fin });

    for (const j of jours) {
      const dansSession = j.iso >= debut && j.iso <= fin;
      const ajouter = (titre: string, type: TypeJourScolaire, extra: Partial<Journee> = {}) => journees.push({ date: j.iso, titre, type, ...extra });
      let reste = j.texte;
      let sansCoursConnu = false;

      if (j.iso === debut) ajouter(moitie === 0 ? "Début de la session d'automne" : "Début de la session d'hiver", "info");
      if (j.iso === fin) ajouter("Fin de la session", "info");
      const points = (reste.match(new RegExp(POINT, "g")) ?? []).length;
      if (points === 1) ajouter("Date limite de désinscription", "limite");
      if (points === 2) ajouter("Date limite d'abandon", "limite");
      if (reste.includes(REMISE_NOTES)) ajouter(/\(/.test(reste) || /JPR/.test(reste) ? "Remise des notes (délai provisoire)" : "Remise des notes", "limite");
      reste = reste.replace(/[-◄()]/g, " ").replace(/^\s*\d{1,2}/, "").trim();

      for (const code of reste.split(/[\s/]+/).filter(Boolean)) {
        const cle = code.toUpperCase();
        if (HORAIRES[code]) {
          // « 6/Lu » ou « 10 EHR/Me » : on suit l'horaire d'un autre jour
          ajouter(`Horaire du ${HORAIRES[code]}`, "horaire-modifie", { horaireDu: HORAIRES[code] });
        } else if (cle === "X") {
          ajouter(nomConge(j.iso), "conge");
          sansCoursConnu = true;
        } else if (CODES[cle]) {
          const c = CODES[cle];
          ajouter(c.titre, c.type, cle.startsWith("É") ? {} : { code: cle });
          sansCoursConnu = true;
        } else {
          ajouter(code, "info");
          avertissements.push(`${j.iso} : code inconnu « ${code} »`);
        }
      }
      // Une case sans numéro de séance, en pleine session et sans code : les cours sont suspendus
      // (par exemple la journée institutionnelle, marquée d'une image que le texte ne montre pas).
      if (dansSession && !j.seance && !sansCoursConnu) {
        const institutionnelle = /institutionnelle/i.test(tout);
        ajouter(institutionnelle ? "Journée institutionnelle (suspension des cours)" : "Pas de cours réguliers", "suspension");
        avertissements.push(`${j.iso} : case sans numéro de séance, considérée comme une suspension des cours`);
      }
    }

    // Semaine de relâche : une semaine qui compte au moins deux journées de mise à jour
    const parLundi = new Map<string, number>();
    for (const j of jours) if (/\bJM\b/.test(j.texte)) {
      const l = plus(j.iso, -(dateDepuisIso(j.iso).getDay() - 1));
      parLundi.set(l, (parLundi.get(l) ?? 0) + 1);
    }
    for (const [l, n] of parLundi) if (n >= 2) journees.push({ date: l, au: plus(l, 4), titre: "Semaine de relâche", type: "relache" });
  }

  if (sessions.some((s) => dateDepuisIso(s.fin).getTime() - dateDepuisIso(s.debut).getTime() < 90 * 86_400_000)) throw new Error("session de moins de 90 jours : lecture douteuse");
  journees.sort((a, b) => a.date.localeCompare(b.date) || a.titre.localeCompare(b.titre));
  const regroupees: Journee[] = [];
  for (const j of journees) {
    // Jours ouvrables consécutifs de même nature : une seule entrée avec « au »
    const precedente = regroupees.findLast((r) => r.titre === j.titre && r.type === j.type && !j.au && j.type !== "horaire-modifie" && r.type !== "relache");
    const suivant = precedente && plus(precedente.au ?? precedente.date, dateDepuisIso(precedente.au ?? precedente.date).getDay() === 5 ? 3 : 1);
    if (precedente && suivant === j.date && dateDepuisIso(j.date).getDay() !== 1) precedente.au = j.date;
    else regroupees.push(j);
  }
  journees.length = 0;
  journees.push(...regroupees);
  journees.sort((a, b) => a.date.localeCompare(b.date) || (a.type === "relache" ? -1 : b.type === "relache" ? 1 : 0));
  return { annee: `${an1}-${an2}`, revise, sessions, journees, avertissements };
}
