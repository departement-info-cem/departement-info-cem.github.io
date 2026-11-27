// Agenda du téléphone : un fichier iCalendar (RFC 5545) par groupe, généré au build (app/agenda/[fichier]/route.ts).
// L'étudiant s'y abonne depuis la page « Mes cours » : son appli d'agenda montre chaque séance de la session, avec un
// rappel 15 minutes avant, et relit le fichier de temps en temps (congés, cours annulés ou déplacés suivent tout seuls).
// Rien n'est envoyé : le fichier d'un groupe est le même pour tous ses étudiants.
import type { CalendrierScolaire } from "@/app/_types/divers";
import type { Plage } from "@/app/_types/prof";
import { construireCalendrier } from "@/lib/calendrier";
import { chemin } from "@/lib/chemins";
import { choixDe, court, evenementsPourMoi, libelle, type DonneesMesCours, type GroupeCours } from "@/lib/mes-cours";
import { heureEnMinutes } from "@/lib/temps";

export const ORIGINE = "https://info.cegepmontpetit.ca";
const DOMAINE = new URL(ORIGINE).host;
export const RAPPEL_MINUTES = 15;

export type EvenementAgenda = {
  /** identifiant stable d'un build à l'autre : l'agenda met à jour la séance au lieu de la dupliquer */
  uid: string;
  /** AAAA-MM-JJ */
  date: string;
  /** "08:00", heure de Montréal */
  debut: string;
  fin: string;
  titre: string;
  lieu?: string;
  description?: string;
  url?: string;
  /** minutes avant le début ; sans rappel, la séance est annulée */
  rappel?: number;
};

/** Le fichier d'un groupe, « A2026-5N6-1020.ics », ou null s'il n'a pas d'horaire (ou pas de session pour le placer). */
export function fichierAgenda(g: GroupeCours): string | null {
  if (!g.session || g.seances.length === 0) return null;
  return `${g.session}-${court(g.cours)}-${g.groupe ?? g.prof}.ics`.replace(/[^A-Za-z0-9.-]/g, "-");
}

const hhmm = (h: string) => {
  const m = heureEnMinutes(h)!;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/**
 * Les séances d'un groupe pour toute sa session, d'après le calendrier scolaire (congés, horaire d'un autre jour)
 * et les dates de son prof (absences : séance annulée, sans rappel ; déplacements : séance reprise à une autre date).
 */
export function seancesDuGroupe(g: GroupeCours, donnees: DonneesMesCours, scolaire: CalendrierScolaire): EvenementAgenda[] {
  const m = choixDe(g);
  const plages: Plage[] = g.seances.map((s) => ({ ...s, type: "cours", cours: g.cours, groupe: g.groupe }));
  const jours = construireCalendrier(scolaire, { plages, evenements: evenementsPourMoi([m], donnees.profs), sessionId: g.session });
  const nomCours = donnees.cours[g.cours]?.nom;
  const titre = `${libelle(m)}${nomCours ? ` · ${nomCours}` : ""}`;
  const pageProf = `${ORIGINE}${chemin(`/${g.prof}/`)}`;
  const siteCours = donnees.cours[g.cours]?.url;
  const prof = donnees.profs[g.prof]?.nom;
  const base = fichierAgenda(g)!.replace(/\.ics$/, "");

  const resultat: EvenementAgenda[] = [];
  for (const j of [...jours.values()].sort((a, b) => a.iso.localeCompare(b.iso))) {
    for (const e of j.evenements) {
      const seance = e.source === "seance";
      const reprise = e.source === "prof" && e.type === "deplacement";
      const [debut, fin] = (e.heure ?? "").split("–");
      if ((!seance && !reprise) || !debut || !fin || heureEnMinutes(debut) === null || heureEnMinutes(fin) === null) continue;
      resultat.push({
        uid: `${j.iso}-${hhmm(debut).replace(":", "")}-${base}${reprise ? "-reprise" : ""}@${DOMAINE}`,
        date: j.iso,
        debut: hhmm(debut),
        fin: hhmm(fin),
        titre: e.annulee ? `${e.annulee.startsWith("déplacé") ? "Déplacé" : "Annulé"} : ${titre}` : titre,
        lieu: e.local,
        description: [
          e.annulee && `Cours ${e.annulee}.`,
          reprise && e.description,
          prof && `Prof : ${prof}`,
          e.local && `Local : ${e.local}`,
          `Page du prof : ${pageProf}`,
          siteCours && `Site du cours : ${siteCours}`,
        ]
          .filter(Boolean)
          .join("\n"),
        url: siteCours ?? pageProf,
        rappel: e.annulee ? undefined : RAPPEL_MINUTES,
      });
    }
  }
  return resultat;
}

/** Tous les agendas à générer : nom du fichier -> nom de l'agenda et ses séances. */
export function agendasDesGroupes(donnees: DonneesMesCours, scolaire: CalendrierScolaire): Map<string, { nom: string; evenements: EvenementAgenda[] }> {
  const agendas = new Map<string, { nom: string; evenements: EvenementAgenda[] }>();
  for (const g of Object.values(donnees.groupes).flat()) {
    const fichier = fichierAgenda(g);
    // Un groupe donné par deux profs (inscrit dans les deux fiches) : un seul fichier, celui du premier
    if (!fichier || agendas.has(fichier)) continue;
    const nomCours = donnees.cours[g.cours]?.nom;
    agendas.set(fichier, { nom: `${libelle(choixDe(g))}${nomCours ? ` · ${nomCours}` : ""}`, evenements: seancesDuGroupe(g, donnees, scolaire) });
  }
  return agendas;
}

// ---------- Format iCalendar ----------

/** Texte d'une propriété (SUMMARY, DESCRIPTION...) : \ ; , et les retours de ligne sont échappés. */
export function echapper(texte: string): string {
  return texte.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

const octets = (c: string) => {
  const n = c.codePointAt(0)!;
  return n < 0x80 ? 1 : n < 0x800 ? 2 : n < 0x10000 ? 3 : 4;
};

/** Replie une ligne trop longue : 75 octets au plus par ligne, la suite commence par une espace. Un caractère n'est jamais coupé. */
export function replier(ligne: string): string {
  const lignes: string[] = [];
  let courante = "";
  let taille = 0;
  for (const c of ligne) {
    // la suite commence par une espace, qui compte dans ses 75 octets
    if (taille + octets(c) > (lignes.length ? 74 : 75)) {
      lignes.push(courante);
      courante = "";
      taille = 0;
    }
    courante += c;
    taille += octets(c);
  }
  lignes.push(courante);
  return lignes.join("\r\n ");
}

/** Fuseau de Montréal (heure avancée du 2e dimanche de mars au 1er dimanche de novembre) */
const FUSEAU = "America/Toronto";
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${FUSEAU}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

const dateHeure = (iso: string, heure: string) => `${iso.replace(/-/g, "")}T${heure.replace(":", "")}00`;

/** Le fichier .ics : lignes repliées, terminées par CRLF. */
export function texteAgenda(nom: string, evenements: EvenementAgenda[], maintenant: Date): string {
  const horodatage = maintenant.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${DOMAINE}//Mes cours//FR`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${echapper(nom)}`,
    `X-WR-TIMEZONE:${FUSEAU}`,
    // Fréquence de relecture suggérée (Calendrier d'Apple ; Google décide lui-même)
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...VTIMEZONE,
    ...evenements.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${horodatage}`,
      `DTSTART;TZID=${FUSEAU}:${dateHeure(e.date, e.debut)}`,
      `DTEND;TZID=${FUSEAU}:${dateHeure(e.date, e.fin)}`,
      `SUMMARY:${echapper(e.titre)}`,
      ...(e.lieu ? [`LOCATION:${echapper(e.lieu)}`] : []),
      ...(e.description ? [`DESCRIPTION:${echapper(e.description)}`] : []),
      ...(e.url ? [`URL:${e.url}`] : []),
      ...(e.rappel === undefined
        ? ["TRANSP:TRANSPARENT"]
        : ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${echapper(e.lieu ? `${e.titre} (${e.lieu})` : e.titre)}`, `TRIGGER:-PT${e.rappel}M`, "END:VALARM"]),
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lignes.map(replier).join("\r\n") + "\r\n";
}
