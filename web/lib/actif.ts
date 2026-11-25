// Quels profs sont actifs en ce moment ? Ceux qui ont des cours cette session, selon leur fiche.
// Le champ « actif » de la fiche l'emporte sur ce calcul : true pour la coordination (dégagée de ses cours),
// false pour un prof parti ou en congé dont la fiche liste encore des cours.
import type { CalendrierScolaire } from "@/app/_types/divers";
import type { Prof } from "@/app/_types/prof";
import { dateDepuisIso, isoDepuisDate } from "@/lib/temps";

/** Temps laissé aux profs, en début de session, pour mettre leur fiche à jour. */
const JOURS_DE_GRACE = 30;

/** Ordre chronologique des sessions : H2027 < E2027 < A2027. */
const rang = (session: string) => Number(session.slice(1)) * 3 + "HEA".indexOf(session[0]);

/** La fiche d'une session vaut jusqu'à 30 jours après le début de la session suivante : ni les vacances, ni la rentrée ne vident la liste. */
function ficheAJour(session: string, scolaire: CalendrierScolaire, iso: string): boolean {
  const suivante = scolaire.sessions.filter((s) => rang(s.id) > rang(session)).sort((a, b) => rang(a.id) - rang(b.id))[0];
  if (!suivante) return true;
  const limite = dateDepuisIso(suivante.debut);
  limite.setDate(limite.getDate() + JOURS_DE_GRACE);
  return iso <= isoDepuisDate(limite);
}

export function estActif(prof: Pick<Prof, "actif" | "cours" | "session" | "horaire">, scolaire: CalendrierScolaire, date: Date): boolean {
  if (prof.actif !== undefined) return prof.actif;
  const aDesCours = Boolean(prof.cours?.length) || Boolean(prof.horaire?.plages.some((p) => p.type === "cours"));
  return aDesCours && (!prof.session || ficheAJour(prof.session, scolaire, isoDepuisDate(date)));
}
