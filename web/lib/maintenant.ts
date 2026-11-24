// « En ce moment » : où sont les profs et quels laboratoires sont libres, en tenant compte du calendrier
// scolaire (congés, JR, horaires modifiés) et des absences inscrites par les profs.
import type { CalendrierScolaire, Laboratoire } from "@/app/_types/divers";
import type { EvenementProf, Plage, Prof } from "@/app/_types/prof";
import { situationDuJour } from "@/lib/calendrier";
import { estDispo, fusionnerDispos } from "@/lib/horaire";
import { heureEnMinutes, isoDepuisDate, jourDeLaSemaine, dateDepuisIso, minutesEnHeure, normaliserJour } from "@/lib/temps";

export type ProfHoraire = Pick<Prof, "id" | "nom" | "session" | "calendrier" | "bureau" | "photo"> & { plages: Plage[] };

export type EtatProf =
  | { etat: "dispo"; local?: string; debut: string; fin: string; centreAide: boolean }
  | { etat: "en-classe"; local?: string; debut: string; fin: string; cours?: string }
  | { etat: "occupe"; local?: string; debut: string; fin: string; titre?: string }
  | { etat: "absent"; titre: string }
  | { etat: "libre" }
  | { etat: "inconnu"; raison?: string };

const minutes = (d: Date) => d.getHours() * 60 + d.getMinutes();
const dansPlage = (p: { debut: string; fin: string }, m: number) => heureEnMinutes(p.debut)! <= m && m < heureEnMinutes(p.fin)!;

function absence(calendrier: EvenementProf[] | undefined, iso: string, m?: number): EvenementProf | undefined {
  return calendrier?.find(
    (e) => e.type === "absence" && !e.cours && e.date <= iso && iso <= (e.au ?? e.date) && (m === undefined || !e.debut || !e.fin || dansPlage({ debut: e.debut, fin: e.fin }, m)),
  );
}

export function etatProf(prof: Pick<ProfHoraire, "session" | "calendrier" | "plages">, scolaire: CalendrierScolaire, date: Date): EtatProf {
  const iso = isoDepuisDate(date);
  const m = minutes(date);
  const abs = absence(prof.calendrier, iso, m);
  if (abs) return { etat: "absent", titre: abs.titre ?? "Absence" };

  // Un cours repris aujourd'hui (souvent une journée JR) compte même s'il n'y a pas de cours réguliers
  const repris = prof.calendrier?.find((e) => e.type === "deplacement" && e.date === iso && e.debut && e.fin && dansPlage({ debut: e.debut, fin: e.fin }, m));
  if (repris) return { etat: "en-classe", local: repris.local, debut: repris.debut!, fin: repris.fin!, cours: repris.cours };

  const s = situationDuJour(scolaire, iso);
  if (!prof.plages.length) return { etat: "inconnu" };
  if (!prof.session || s.session !== prof.session) return { etat: "inconnu", raison: "horaire d'une autre session" };
  if (s.sansCours) return { etat: "inconnu", raison: s.raison };

  const duJour = prof.plages.filter((p) => normaliserJour(p.jour) === s.horaireSuivi);
  const deplace = (p: Plage) =>
    prof.calendrier?.some(
      (e) =>
        ((e.type === "deplacement" && e.remplace === iso) || (e.type === "absence" && e.cours && e.date <= iso && iso <= (e.au ?? e.date))) &&
        e.cours?.toUpperCase() === p.cours?.toUpperCase() &&
        (!e.groupe || e.groupe === p.groupe),
    );
  const enCours = duJour.filter((p) => dansPlage(p, m) && !(p.type === "cours" && deplace(p)));
  const cours = enCours.find((p) => p.type === "cours");
  if (cours) return { etat: "en-classe", local: cours.local, debut: cours.debut, fin: cours.fin, cours: cours.cours };
  const dispo = fusionnerDispos(duJour).find((p) => dansPlage(p, m));
  if (dispo) return { etat: "dispo", local: dispo.local, debut: dispo.debut, fin: dispo.fin, centreAide: dispo.centreAide };
  const autre = enCours.find((p) => !estDispo(p));
  if (autre) return { etat: "occupe", local: autre.local, debut: autre.debut, fin: autre.fin, titre: autre.titre };
  return { etat: "libre" };
}

/** La prochaine disponibilité d'un prof dans les 14 prochains jours. */
export function prochaineDispo(prof: Pick<ProfHoraire, "session" | "calendrier" | "plages">, scolaire: CalendrierScolaire, date: Date): { iso: string; debut: string; fin: string; local?: string } | undefined {
  const dispos = fusionnerDispos(prof.plages);
  for (let i = 0; i < 14; i++) {
    const d = dateDepuisIso(isoDepuisDate(date));
    d.setDate(d.getDate() + i);
    const iso = isoDepuisDate(d);
    const s = situationDuJour(scolaire, iso);
    if (s.sansCours || !prof.session || s.session !== prof.session) continue;
    const p = dispos.find((x) => x.jour === s.horaireSuivi && (i > 0 || heureEnMinutes(x.debut)! > minutes(date)) && !absence(prof.calendrier, iso, heureEnMinutes(x.debut)!));
    if (p) return { iso, debut: p.debut, fin: p.fin, local: p.local };
  }
  return undefined;
}

// ---------- Laboratoires ----------

export type Occupation = Laboratoire["occupations"][number] & { prof?: string };

/** D-0003, d0003 et D-3 désignent le même local. */
export const normaliserLocal = (l: string) => l.toUpperCase().replace(/\s/g, "").replace(/^([A-Z])-?0*(\d+)$/, "$1$2");

const seChevauchent = (a: { debut: string; fin: string }, b: { debut: string; fin: string }) => heureEnMinutes(a.debut)! < heureEnMinutes(b.fin)! && heureEnMinutes(b.debut)! < heureEnMinutes(a.fin)!;

type Seance = { jour: string; debut: string; fin: string; cours?: string };
const memeCours = (a: Seance, b: Seance) => a.cours?.toUpperCase() === b.cours?.toUpperCase() && normaliserJour(a.jour) === normaliserJour(b.jour) && seChevauchent(a, b);

/** Entre deux cours, il y a une pause de 10 minutes : le local n'est pas vraiment libre. */
const PAUSE = 10;

/** Occupations d'un local : celles de data/laboratoires.yaml et les cours des fiches de profs, sans doublons. */
export function occupationsLocal(local: string, session: string, labo: Laboratoire | undefined, profs: ProfHoraire[]): Occupation[] {
  const cle = (o: { jour: string; debut: string; fin: string; cours?: string; groupe?: string }) => [normaliserJour(o.jour), heureEnMinutes(o.debut), heureEnMinutes(o.fin), o.cours?.toUpperCase() ?? "", o.groupe ?? ""].join("|");
  const resultat = new Map<string, Occupation>();
  const officielles = labo?.session === session ? labo.occupations : [];
  for (const o of officielles) resultat.set(cle(o), o);
  for (const p of profs) {
    if (p.session !== session) continue;
    for (const x of p.plages) {
      if (x.type !== "cours" || !x.local || normaliserLocal(x.local) !== normaliserLocal(local)) continue;
      // L'horaire officiel dit « 08:10 », un prof écrit souvent « 08:00 » : c'est le même cours
      if (officielles.some((o) => memeCours(o, x))) continue;
      const existante = resultat.get(cle(x));
      resultat.set(cle(x), { jour: x.jour, debut: x.debut, fin: x.fin, cours: x.cours, groupe: x.groupe, titre: x.titre, prof: existante?.prof ? `${existante.prof}, ${p.nom}` : p.nom });
    }
  }
  return [...resultat.values()];
}

export type EtatLabo = { etat: "libre" | "occupe" | "inconnu"; occupation?: Occupation; jusqua?: string; raison?: string };

export function etatLabo(labo: Laboratoire, profs: ProfHoraire[], scolaire: CalendrierScolaire, date: Date): EtatLabo {
  const iso = isoDepuisDate(date);
  const m = minutes(date);
  const s = situationDuJour(scolaire, iso);
  if (!s.session) return { etat: "inconnu", raison: "hors session" };
  const jourReel = jourDeLaSemaine(date);
  if (jourReel === "samedi" || jourReel === "dimanche") return { etat: "inconnu", raison: "fin de semaine" };
  const toutes = occupationsLocal(labo.local, s.session, labo, profs);
  // Les groupes du soir (AEC) ne suivent pas le calendrier : ils occupent le local selon le vrai jour de la semaine
  const horsCalendrier = toutes.filter((o) => o.horsCalendrier && normaliserJour(o.jour) === jourReel);
  const soir = horsCalendrier.find((o) => dansPlage(o, m));
  if (s.sansCours && soir) return { etat: "occupe", occupation: soir, jusqua: minutesEnHeure(heureEnMinutes(soir.fin)!) };
  // Journée JR, EC, congé... : l'horaire habituel ne s'applique pas
  if (s.sansCours) return { etat: "inconnu", raison: s.raison };
  const duJour = [...toutes.filter((o) => !o.horsCalendrier && normaliserJour(o.jour) === s.horaireSuivi), ...horsCalendrier];
  // Un cours qui commence dans 10 minutes ou moins occupe déjà le local
  const enCours =
    duJour.find((o) => dansPlage(o, m)) ?? duJour.find((o) => heureEnMinutes(o.debut)! > m && heureEnMinutes(o.debut)! - m <= PAUSE);
  if (enCours) {
    // Les cours qui se suivent : on donne l'heure à laquelle le local se libère vraiment
    let fin = heureEnMinutes(enCours.fin)!;
    for (let suivant; (suivant = duJour.find((o) => heureEnMinutes(o.debut)! <= fin + PAUSE && heureEnMinutes(o.fin)! > fin)); ) fin = heureEnMinutes(suivant.fin)!;
    return { etat: "occupe", occupation: enCours, jusqua: minutesEnHeure(fin) };
  }
  if (!labo.complet || labo.session !== s.session) return { etat: "inconnu", raison: "horaire incomplet" };
  const [ouvre, ferme] = [heureEnMinutes(labo.ouverture)!, heureEnMinutes(labo.fermeture)!];
  if (m < ouvre || m >= ferme) return { etat: "inconnu", raison: "en dehors des heures de cours" };
  const prochain = Math.min(ferme, ...duJour.map((o) => heureEnMinutes(o.debut)!).filter((d) => d > m));
  return { etat: "libre", jusqua: minutesEnHeure(prochain) };
}

/** Le prochain cours dans un local (autre que celui en cours) dans les 14 prochains jours. */
export function prochainCours(labo: Laboratoire, profs: ProfHoraire[], scolaire: CalendrierScolaire, date: Date): { iso: string; occupation: Occupation } | undefined {
  const m = minutes(date);
  // Un cours qui commence dans moins de 10 minutes est déjà affiché comme « occupé »
  const actuel = etatLabo(labo, profs, scolaire, date).occupation;
  const debutApres = actuel ? Math.max(m, heureEnMinutes(actuel.debut)!) : m;
  for (let i = 0; i < 14; i++) {
    const d = dateDepuisIso(isoDepuisDate(date));
    d.setDate(d.getDate() + i);
    const iso = isoDepuisDate(d);
    const s = situationDuJour(scolaire, iso);
    if (!s.session) continue;
    const occupation = occupationsLocal(labo.local, s.session, labo, profs)
      // Les groupes du soir (AEC) suivent le vrai jour de la semaine, même un jour sans cours réguliers
      .filter((o) => o.cours && (o.horsCalendrier ? normaliserJour(o.jour) === jourDeLaSemaine(d) : !s.sansCours && normaliserJour(o.jour) === s.horaireSuivi))
      .filter((o) => i > 0 || heureEnMinutes(o.debut)! > debutApres)
      .sort((a, b) => heureEnMinutes(a.debut)! - heureEnMinutes(b.debut)!)[0];
    if (occupation) return { iso, occupation };
  }
  return undefined;
}

// ---------- Résumé (bandeau et page « En ce moment ») ----------

export type ResumeMaintenant = ReturnType<typeof resumeMaintenant>;

export function resumeMaintenant(profs: ProfHoraire[], labos: Laboratoire[], scolaire: CalendrierScolaire, date: Date) {
  const iso = isoDepuisDate(date);
  const situation = situationDuJour(scolaire, iso);
  const avecHoraire = profs.filter((p) => p.plages.length > 0 && p.session && p.session === situation.session);
  const dispos = avecHoraire.flatMap((p) => {
    const e = etatProf(p, scolaire, date);
    return e.etat === "dispo" ? [{ p, e }] : [];
  });
  const nbAvecDispos = avecHoraire.filter((p) => p.plages.some(estDispo)).length;
  const bientot = avecHoraire
    .filter((p) => !dispos.some((d) => d.p.id === p.id))
    .flatMap((p) => {
      const d = prochaineDispo(p, scolaire, date);
      return d ? [{ p, d }] : [];
    })
    .sort((a, b) => `${a.d.iso}${a.d.debut}`.localeCompare(`${b.d.iso}${b.d.debut}`));

  const ordre = ["libre", "occupe", "inconnu"];
  const etats = labos.map((l) => ({ l, e: etatLabo(l, profs, scolaire, date) })).sort((a, b) => ordre.indexOf(a.e.etat) - ordre.indexOf(b.e.etat));
  const libres = etats.filter(({ e }) => e.etat === "libre").sort((a, b) => b.e.jusqua!.localeCompare(a.e.jusqua!));
  // Un cours qui finit à la fermeture ne libère rien pour aujourd'hui
  const premier = etats.filter(({ l, e }) => e.etat === "occupe" && e.jusqua! < l.fermeture).sort((a, b) => a.e.jusqua!.localeCompare(b.e.jusqua!))[0];

  let raison: string | undefined;
  if (!situation.session) raison = "Nous sommes hors session";
  else if (situation.sansCours) raison = `${situation.raison ? `${situation.raison} : ` : ""}pas de cours réguliers aujourd'hui`;
  else if (situation.raison) raison = situation.raison;
  else if (["samedi", "dimanche"].includes(jourDeLaSemaine(date))) raison = "C'est la fin de semaine";
  else if (labos.length > 0 && !libres.length && !premier && etats.some(({ e }) => e.raison === "en dehors des heures de cours")) raison = "En dehors des heures de cours";
  else if (labos.length > 0 && etats.every(({ e }) => e.raison === "horaire incomplet")) raison = "L'horaire des locaux de cette session n'est pas encore inscrit";

  return { iso, situation, nbAvecDispos, dispos, bientot, etats, libres, prochainLibre: premier && { local: premier.l.local, heure: premier.e.jusqua! }, raison };
}

/** Le bandeau est sur toutes les pages : on garde seulement les profs qui y changent quelque chose. */
export function profsUtiles(profs: ProfHoraire[], labos: Laboratoire[]): ProfHoraire[] {
  const officiel = (p: ProfHoraire, x: Plage) =>
    labos.some((l) => l.session === p.session && normaliserLocal(l.local) === normaliserLocal(x.local ?? "") && l.occupations.some((o) => memeCours(o, x)));
  return profs.filter((p) => p.plages.some((x) => estDispo(x) || (x.type === "cours" && x.local && !officiel(p, x))));
}
