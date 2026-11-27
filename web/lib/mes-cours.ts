// « Mes cours » : l'étudiant indique ses cours et son groupe ; le site met ses profs en avant.
// Le choix reste dans le navigateur (localStorage), rien n'est envoyé nulle part.
// Logique pure, sans React : utilisée par le contexte (app/_contexts/mes-cours-context.tsx) et testée.
import type { CalendrierScolaire } from "@/app/_types/divers";
import type { EvenementProf, Plage } from "@/app/_types/prof";
import { construireCalendrier, type EvenementJour, type JourCalendrier } from "@/lib/calendrier";
import { dateDepuisIso, heureEnMinutes, isoDepuisDate, minutesEnHeure } from "@/lib/temps";

/** Un cours de l'étudiant. Sans prof : le cours seul (groupe inconnu, ou cours absent des fiches). */
export type MonCours = { cours: string; prof?: string; groupe?: string; session?: string };

export type Seance = { jour: string; debut: string; fin: string; local?: string };

/** Un groupe d'un cours, tel qu'inscrit dans l'horaire d'un prof. Sans séances : le prof donne le cours, sans horaire inscrit. */
export type GroupeCours = { cours: string; prof: string; groupe?: string; session?: string; seances: Seance[] };

/** aide : les cours pour lesquels il peut aider (ceux qu'il donne compris) ; calendrier : ses dates. Numéros de cours canoniques. */
export type InfoProfMesCours = { nom: string; session?: string; cours: string[]; aide: string[]; dispos: Plage[]; calendrier: EvenementProf[] };

/** Ce que le serveur prépare au build (profs actifs seulement), passé une fois dans le layout. */
export type DonneesMesCours = {
  /** numéro canonique du cours -> ses groupes */
  groupes: Record<string, GroupeCours[]>;
  profs: Record<string, InfoProfMesCours>;
  /** numéro (et anciens numéros) -> nom du cours */
  cours: Record<string, { no: string; nom: string; url?: string }>;
};

export type Lien = { niveau: "mon-prof" | "meme-cours" | null; cours: string[] };

/** 420-5N6-EM -> 5N6 */
export const court = (no: string) => no.replace(/^420-/, "").replace(/-(EM|RE)$/, "");

/** « 5N6 gr. 1020 » */
export const libelle = (m: Pick<MonCours, "cours" | "groupe">) => `${court(m.cours)}${m.groupe ? ` gr. ${m.groupe}` : ""}`;

export const memeChoix = (a: MonCours, b: MonCours) => a.cours === b.cours && a.prof === b.prof && a.groupe === b.groupe;

export const choixDe = (g: GroupeCours): MonCours => ({ cours: g.cours, prof: g.prof, groupe: g.groupe, session: g.session });

/** Ajoute un choix (un seul groupe par cours : il remplace l'ancien), ou le retire s'il y est déjà. */
export function basculer(mesCours: MonCours[], choix: MonCours): MonCours[] {
  if (mesCours.some((m) => memeChoix(m, choix))) return mesCours.filter((m) => !memeChoix(m, choix));
  return [...mesCours.filter((m) => m.cours !== choix.cours), choix];
}

/** Choix d'une autre session : le prof a changé d'horaire depuis (ou n'est plus actif). */
export function estPerime(m: MonCours, profs: DonneesMesCours["profs"]): boolean {
  if (!m.prof) return false;
  const p = profs[m.prof];
  return !p || Boolean(m.session && p.session && m.session !== p.session);
}

/** Lit ce qui est dans le localStorage sans faire confiance à son contenu. */
export function nettoyer(brut: unknown): MonCours[] {
  if (!Array.isArray(brut)) return [];
  const texte = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  return brut.flatMap((m) => {
    const cours = texte(m?.cours);
    return cours ? [{ cours, prof: texte(m.prof), groupe: texte(m.groupe), session: texte(m.session) }] : [];
  });
}

/** Mon prof (il donne un de mes groupes), prof d'un de mes cours, ou rien. */
export function lienAvecMoi(profId: string, coursDuProf: string[], mesCours: MonCours[]): Lien {
  const miens = mesCours.filter((m) => m.prof === profId).map((m) => m.cours);
  if (miens.length) return { niveau: "mon-prof", cours: miens };
  const communs = coursDuProf.filter((no) => mesCours.some((m) => m.cours === no));
  return communs.length ? { niveau: "meme-cours", cours: communs } : { niveau: null, cours: [] };
}

const RANG = { "mon-prof": 0, "meme-cours": 1 } as const;

/** Mes profs, puis les profs de mes cours, puis les autres ; l'ordre d'origine est gardé dans chaque groupe. */
export function trierPourMoi<T>(liste: T[], lien: (t: T) => Lien): T[] {
  const rang = (t: T) => {
    const n = lien(t).niveau;
    return n ? RANG[n] : 2;
  };
  return liste.map((t, i) => ({ t, i, r: rang(t) })).sort((a, b) => a.r - b.r || a.i - b.i).map((x) => x.t);
}

/**
 * Les dates de mes profs qui me concernent, pour mon calendrier : celles de mes cours (et de mon groupe),
 * et leurs absences, qui annulent mes séances avec eux. Une date modifiée par le prof suit toute seule.
 */
export function evenementsPourMoi(mesCours: MonCours[], profs: DonneesMesCours["profs"]): EvenementProf[] {
  return mesCours.flatMap((m) => {
    const p = m.prof ? profs[m.prof] : undefined;
    if (!p) return [];
    return p.calendrier.flatMap((e): EvenementProf[] => {
      if (!e.cours) {
        // Une absence sans cours précisé annule tous ses cours : ici, seulement mon groupe
        return e.type === "absence" ? [{ ...e, cours: m.cours, groupe: m.groupe, titre: `${court(m.cours)} · Cours annulé (${p.nom})` }] : [];
      }
      if (e.cours !== m.cours || (e.groupe && m.groupe && e.groupe !== m.groupe)) return [];
      return [{ ...e, titre: e.titre && `${court(m.cours)} · ${e.titre}` }];
    });
  });
}

export type StatutRencontre = "prevue" | "annulee" | "deplacee" | "reprise";

/** Une rencontre datée d'un groupe. Heures "08:00", heure de Montréal. */
export type Rencontre = {
  /** rang dans la session (1, 2...) des rencontres qui ont lieu ; absent pour une séance annulée ou déplacée */
  numero?: number;
  date: string;
  debut: string;
  fin: string;
  local?: string;
  statut: StatutRencontre;
  /** déplacée : « déplacé au jeudi 10 décembre » ; reprise : « Reprise du cours du mercredi 2 décembre. » */
  note?: string;
};

/**
 * Les rencontres d'un groupe pour toute sa session : son horaire de la semaine sur les dates du calendrier scolaire
 * (congés, horaire d'un autre jour), avec les absences et les déplacements de son prof. Sert à l'agenda (lib/agenda.ts),
 * au navigateur comme au build.
 */
export function rencontresDuGroupe(g: GroupeCours, profs: DonneesMesCours["profs"], scolaire: CalendrierScolaire): Rencontre[] {
  const plages: Plage[] = g.seances.map((s) => ({ ...s, type: "cours", cours: g.cours, groupe: g.groupe }));
  const jours = construireCalendrier(scolaire, { plages, evenements: evenementsPourMoi([choixDe(g)], profs), sessionId: g.session });
  const hhmm = (h: string) => minutesEnHeure(heureEnMinutes(h)!);
  const rencontres: Rencontre[] = [];
  for (const j of jours.values()) {
    for (const e of j.evenements) {
      const reprise = e.source === "prof" && e.type === "deplacement";
      const [debut, fin] = (e.heure ?? "").split("–");
      if ((e.source !== "seance" && !reprise) || !debut || !fin || heureEnMinutes(debut) === null || heureEnMinutes(fin) === null) continue;
      const deplacee = e.annulee?.startsWith("déplacé");
      rencontres.push({
        date: j.iso,
        debut: hhmm(debut),
        fin: hhmm(fin),
        local: e.local,
        statut: reprise ? "reprise" : deplacee ? "deplacee" : e.annulee ? "annulee" : "prevue",
        note: reprise ? e.description : deplacee ? e.annulee : undefined,
      });
    }
  }
  rencontres.sort((a, b) => a.date.localeCompare(b.date) || a.debut.localeCompare(b.debut));
  let numero = 0;
  for (const r of rencontres) if (r.statut === "prevue" || r.statut === "reprise") r.numero = ++numero;
  return rencontres;
}

/** Ce qui compte dans les jours à venir : évaluations, remises, cours annulés ou déplacés, congés et dates limites. */
export function aVenir(jours: Map<string, JourCalendrier>, aujourdhui: string, nbJours = 21): { iso: string; evenements: EvenementJour[] }[] {
  const fin = dateDepuisIso(aujourdhui);
  fin.setDate(fin.getDate() + nbJours);
  const limite = isoDepuisDate(fin);
  return [...jours.values()]
    .filter((j) => j.iso >= aujourdhui && j.iso <= limite)
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .map((j) => ({ iso: j.iso, evenements: j.evenements.filter((e) => (e.source === "seance" ? Boolean(e.annulee) : e.type !== "info")) }))
    .filter((j) => j.evenements.length > 0);
}

/**
 * Calendrier d'un prof vu par un de ses étudiants : seulement les cours qu'il suit avec ce prof et, si le groupe est connu,
 * ce groupe. Restent aussi les dates du cours sans groupe (communes à tous) et celles sans cours (absences, activités).
 */
export function garderMonGroupe<T extends { cours?: string; groupe?: string }>(liste: T[], miens: MonCours[], canonique: (no: string) => string): T[] {
  return liste.filter((x) => {
    if (!x.cours) return true;
    const m = miens.find((m) => m.cours === canonique(x.cours!));
    return Boolean(m) && (!x.groupe || !m!.groupe || x.groupe === m!.groupe);
  });
}

// ---------- Liens avec des cours : /react/centre-aide/?mescours=SN1-1050,5N6-1020,3W6 ----------

/** Paramètre d'URL qui donne une liste de cours, pour montrer une page « comme si » on suivait ces cours. */
// « cours » est déjà pris par le filtre des pages /<prof>/horaire/?cours=420-5N6-EM (liens des sites de cours)
export const PARAM_COURS = "mescours";

/**
 * Lit « SN1-1050,5N6-1020,3W6 » : un sigle court ou un numéro complet (420-5N6-EM), et le groupe après un tiret
 * ou un deux-points. Un ancien numéro donne le nouveau. Le prof vient du groupe ; sans groupe, le cours est seul.
 */
export function lireParamCours(texte: string, donnees: Pick<DonneesMesCours, "groupes" | "cours">): { cours: MonCours[]; inconnus: string[] } {
  const parSigle = new Map<string, string>();
  for (const [no, info] of Object.entries(donnees.cours)) {
    parSigle.set(no.toUpperCase(), info.no.toUpperCase());
    if (!parSigle.has(court(no).toUpperCase()) || no === info.no) parSigle.set(court(no).toUpperCase(), info.no.toUpperCase());
  }
  let resultat: MonCours[] = [];
  const inconnus: string[] = [];
  for (const brut of texte.split(/[,;\s]+/).filter(Boolean)) {
    const m = /^(.+?)(?:[-:](\d{3,5}))?$/.exec(brut.trim().toUpperCase())!;
    const no = parSigle.get(m[1]);
    if (!no) {
      inconnus.push(brut);
      continue;
    }
    if (!m[2]) {
      resultat = basculer(resultat, { cours: no });
      continue;
    }
    const g = donnees.groupes[no]?.find((x) => x.groupe === m[2]);
    if (g) resultat = basculer(resultat, choixDe(g));
    else inconnus.push(brut);
  }
  return { cours: resultat, inconnus };
}

/** L'inverse : mes cours en « SN1-1050,5M6-1020,3W6 », à ajouter à n'importe quelle adresse du site. */
export function ecrireParamCours(mesCours: MonCours[]): string {
  return mesCours.map((m) => `${court(m.cours)}${m.groupe ? `-${m.groupe}` : ""}`).join(",");
}
