// Agenda du téléphone : un fichier iCalendar (RFC 5545) par groupe, généré au build (app/agenda/[fichier]/route.ts).
// L'étudiant s'y abonne depuis la page « Mes cours » : son appli d'agenda montre chaque séance de la session, avec un
// rappel 15 minutes avant, et relit le fichier de temps en temps (congés, cours annulés ou déplacés suivent tout seuls).
// Rien n'est envoyé : le fichier d'un groupe est le même pour tous ses étudiants.
import type { CalendrierScolaire } from "@/app/_types/divers";
import { chemin } from "@/lib/chemins";
import { choixDe, court, libelle, rencontresDuGroupe, type DonneesMesCours, type GroupeCours } from "@/lib/mes-cours";

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

/**
 * Les séances d'un groupe pour l'agenda, d'après ses rencontres datées (rencontresDuGroupe) : une séance annulée
 * ou déplacée reste visible, sans rappel ; la reprise d'un cours déplacé paraît à sa nouvelle date.
 */
export function seancesDuGroupe(g: GroupeCours, donnees: DonneesMesCours, scolaire: CalendrierScolaire): EvenementAgenda[] {
  const nomCours = donnees.cours[g.cours]?.nom;
  const titre = `${libelle(choixDe(g))}${nomCours ? ` · ${nomCours}` : ""}`;
  const pageProf = `${ORIGINE}${chemin(`/${g.prof}/`)}`;
  const siteCours = donnees.cours[g.cours]?.url;
  const prof = donnees.profs[g.prof]?.nom;
  const base = fichierAgenda(g)!.replace(/\.ics$/, "");
  const prefixe = { prevue: "", reprise: "", annulee: "Annulé : ", deplacee: "Déplacé : " } as const;

  return rencontresDuGroupe(g, donnees.profs, scolaire).map((r) => ({
    uid: `${r.date}-${r.debut.replace(":", "")}-${base}${r.statut === "reprise" ? "-reprise" : ""}@${DOMAINE}`,
    date: r.date,
    debut: r.debut,
    fin: r.fin,
    titre: `${prefixe[r.statut]}${titre}`,
    lieu: r.local,
    description: [
      r.statut === "annulee" && "Cours annulé.",
      r.statut === "deplacee" && `Cours ${r.note}.`,
      r.statut === "reprise" && r.note,
      prof && `Prof : ${prof}`,
      r.local && `Local : ${r.local}`,
      `Page du prof : ${pageProf}`,
      siteCours && `Site du cours : ${siteCours}`,
    ]
      .filter(Boolean)
      .join("\n"),
    url: siteCours ?? pageProf,
    rappel: r.numero ? RAPPEL_MINUTES : undefined,
  }));
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
