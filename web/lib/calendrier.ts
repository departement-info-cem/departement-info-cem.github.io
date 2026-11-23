// Construit le calendrier d'un prof en fusionnant :
//  - le calendrier scolaire (congés, journées pédagogiques, horaires modifiés...) ;
//  - les séances de ses cours (son horaire de la semaine projeté sur les dates de la session) ;
//  - ses propres événements (remises, examens, absences...).
import type { CalendrierScolaire, TypeJourScolaire } from "@/app/_types/divers";
import { SANS_COURS } from "@/app/_types/divers";
import type { EvenementProf, Plage } from "@/app/_types/prof";
import { dateDepuisIso, formaterDate, isoDepuisDate, jourDeLaSemaine, normaliserJour, type Jour } from "@/lib/temps";

export type SourceEvenement = "scolaire" | "seance" | "prof";

export type EvenementJour = {
  source: SourceEvenement;
  titre: string;
  /** type scolaire ou type d'événement du prof, ou "seance" */
  type: string;
  cours?: string;
  groupe?: string;
  heure?: string;
  local?: string;
  description?: string;
  /** code officiel (JR, EC, EHR...) */
  code?: string;
  /** séance annulée (absence) ou déplacée à une autre date */
  annulee?: string;
};

export type JourCalendrier = {
  iso: string;
  /** jour dont on suit l'horaire (différent du jour réel si horaire modifié) */
  horaireSuivi?: Jour;
  sansCours: boolean;
  evenements: EvenementJour[];
};

function chaqueJour(debut: string, fin: string, f: (iso: string) => void) {
  const d = dateDepuisIso(debut);
  const dFin = dateDepuisIso(fin);
  while (d <= dFin) {
    f(isoDepuisDate(d));
    d.setDate(d.getDate() + 1);
  }
}

export function construireCalendrier(
  scolaire: CalendrierScolaire,
  options: { plages?: Plage[]; evenements?: EvenementProf[]; sessionId?: string },
): Map<string, JourCalendrier> {
  const jours = new Map<string, JourCalendrier>();
  const obtenir = (iso: string): JourCalendrier => {
    let j = jours.get(iso);
    if (!j) {
      j = { iso, sansCours: false, evenements: [] };
      jours.set(iso, j);
    }
    return j;
  };

  // 1. Journées du calendrier scolaire
  for (const s of scolaire.journees) {
    chaqueJour(s.date, s.au ?? s.date, (iso) => {
      const j = obtenir(iso);
      j.evenements.push({ source: "scolaire", titre: s.titre, type: s.type, code: s.code });
      if (SANS_COURS.includes(s.type as TypeJourScolaire)) j.sansCours = true;
      if (s.type === "horaire-modifie" && s.horaireDu) j.horaireSuivi = normaliserJour(s.horaireDu) ?? undefined;
    });
  }

  // 2. Séances de cours : l'horaire de la semaine, pour chaque jour de la session
  const session = scolaire.sessions.find((s) => s.id === options.sessionId);
  const seances = (options.plages ?? []).filter((p) => p.type === "cours");
  const evenements = options.evenements ?? [];
  const meme = (a?: string, b?: string) => !a || a.toUpperCase() === b?.toUpperCase();
  const concerne = (e: EvenementProf, p: Plage) => meme(e.cours, p.cours) && (!e.groupe || e.groupe === p.groupe);

  if (session && seances.length) {
    chaqueJour(session.debut, session.fin, (iso) => {
      const j = jours.get(iso);
      if (j?.sansCours) return;
      const jourReel = jourDeLaSemaine(dateDepuisIso(iso));
      const jourSuivi = j?.horaireSuivi ?? jourReel;
      for (const p of seances.filter((p) => normaliserJour(p.jour) === jourSuivi)) {
        const absence = evenements.find((e) => e.type === "absence" && e.date <= iso && iso <= (e.au ?? e.date) && concerne(e, p) && (!e.debut || !e.fin || (e.debut.padStart(5, "0") < p.fin.padStart(5, "0") && p.debut.padStart(5, "0") < e.fin.padStart(5, "0"))));
        const deplacement = evenements.find((e) => e.type === "deplacement" && e.remplace === iso && concerne(e, p));
        obtenir(iso).evenements.push({
          source: "seance",
          type: "seance",
          titre: p.titre ?? p.cours ?? "Cours",
          cours: p.cours,
          groupe: p.groupe,
          heure: `${p.debut}–${p.fin}`,
          local: p.local,
          annulee: deplacement ? `déplacé au ${formaterDate(deplacement.date).toLowerCase()}` : absence ? "annulé (absence)" : undefined,
        });
      }
    });
  }

  // 3. Événements du prof
  for (const e of evenements) {
    if (e.type === "deplacement" && e.remplace) {
      // Le cours déplacé garde son heure et son local d'origine, sauf indication contraire
      const suivi = jours.get(e.remplace)?.horaireSuivi ?? jourDeLaSemaine(dateDepuisIso(e.remplace));
      const origine = seances.find((p) => normaliserJour(p.jour) === suivi && concerne(e, p));
      const [debut, fin] = [e.debut ?? origine?.debut, e.fin ?? origine?.fin];
      obtenir(e.date).evenements.push({
        source: "prof",
        type: "deplacement",
        titre: e.titre ?? `${e.cours} déplacé`,
        cours: e.cours,
        groupe: e.groupe ?? origine?.groupe,
        heure: debut && fin ? `${debut}–${fin}` : debut,
        local: e.local ?? origine?.local,
        description: [`Reprise du cours du ${formaterDate(e.remplace).toLowerCase()}.`, e.description].filter(Boolean).join(" "),
      });
      continue;
    }
    chaqueJour(e.date, e.au ?? e.date, (iso) => {
      obtenir(iso).evenements.push({
        source: "prof",
        titre: e.titre ?? "Absence",
        type: e.type,
        cours: e.cours,
        groupe: e.groupe,
        heure: e.debut && (e.fin ? `${e.debut}–${e.fin}` : e.debut),
        local: e.local,
        description: e.description,
      });
    });
  }

  // Ordre d'affichage : scolaire, événements du prof, puis séances par heure
  const rang: Record<SourceEvenement, number> = { scolaire: 0, prof: 1, seance: 2 };
  for (const j of jours.values()) {
    j.evenements.sort((a, b) => rang[a.source] - rang[b.source] || (a.heure ?? "").localeCompare(b.heure ?? ""));
  }
  return jours;
}

/** Ce que le calendrier scolaire dit d'un jour : le jour dont on suit l'horaire, ou pas de cours. */
export function situationDuJour(scolaire: CalendrierScolaire, iso: string): { session?: string; horaireSuivi: Jour; sansCours: boolean; raison?: string; code?: string } {
  const duJour = scolaire.journees.filter((j) => j.date <= iso && iso <= (j.au ?? j.date));
  const bloquant = duJour.find((j) => SANS_COURS.includes(j.type) && j.type !== "relache") ?? duJour.find((j) => SANS_COURS.includes(j.type));
  const modifie = duJour.find((j) => j.type === "horaire-modifie" && j.horaireDu);
  return {
    session: scolaire.sessions.find((s) => s.debut <= iso && iso <= s.fin)?.id,
    horaireSuivi: (modifie?.horaireDu && normaliserJour(modifie.horaireDu)) || jourDeLaSemaine(dateDepuisIso(iso)),
    sansCours: Boolean(bloquant),
    raison: (bloquant ?? modifie)?.titre,
    code: bloquant?.code,
  };
}

/** Les semaines (lundi -> dimanche) d'un mois, pour une grille de calendrier. */
export function semainesDuMois(annee: number, mois: number): Date[][] {
  const premier = new Date(annee, mois, 1, 12);
  const decalage = (premier.getDay() + 6) % 7; // lundi = 0
  const debut = new Date(annee, mois, 1 - decalage, 12);
  const semaines: Date[][] = [];
  const d = new Date(debut);
  do {
    const semaine: Date[] = [];
    for (let i = 0; i < 7; i++) {
      semaine.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    semaines.push(semaine);
  } while (d.getMonth() === mois);
  return semaines;
}
