// Utilitaires de jours et d'heures partagés par l'horaire, le calendrier et la validation.
// Inspiré du composant WeeklySchedule du cours 5N6.

export const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;
export type Jour = (typeof JOURS)[number];

export const JOURS_OUVRABLES: Jour[] = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];

export const LIBELLES_JOURS: Record<Jour, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

// Plusieurs façons d'écrire un jour sont acceptées (français, anglais, abrégé...
// et même les « jours planétaires » de l'horaire du 5N6 : lune di, mars di, etc.).
const ALIAS_JOURS: Record<string, Jour> = {
  lundi: "lundi", lun: "lundi", monday: "lundi", mon: "lundi", "lune di": "lundi",
  mardi: "mardi", mar: "mardi", tuesday: "mardi", tue: "mardi", "mars di": "mardi",
  mercredi: "mercredi", mer: "mercredi", wednesday: "mercredi", wed: "mercredi", "mercure di": "mercredi",
  jeudi: "jeudi", jeu: "jeudi", thursday: "jeudi", thu: "jeudi", "jupiter di": "jeudi",
  vendredi: "vendredi", ven: "vendredi", friday: "vendredi", fri: "vendredi", "venus di": "vendredi", "vénus di": "vendredi",
  samedi: "samedi", sam: "samedi", saturday: "samedi", sat: "samedi", "saturne di": "samedi",
  dimanche: "dimanche", dim: "dimanche", sunday: "dimanche", sun: "dimanche", "soleil di": "dimanche",
};

/** Retourne le jour normalisé ("lundi"...) ou null si on ne le reconnaît pas. */
export function normaliserJour(valeur: string): Jour | null {
  const cle = valeur.trim().toLowerCase().replace(/\s+/g, " ");
  return ALIAS_JOURS[cle] ?? null;
}

/** "8:00" ou "08:00" -> 480. Retourne null si le format est invalide. */
export function heureEnMinutes(heure: string): number | null {
  const m = /^(\d{1,2})[:h](\d{2})$/.exec(heure.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** 480 -> "08:00" */
export function minutesEnHeure(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "07:00" -> "7h00" (dans une phrase) */
export function formaterHeure(heure: string): string {
  const total = heureEnMinutes(heure)!;
  return `${Math.floor(total / 60)}h${String(total % 60).padStart(2, "0")}`;
}

/** "2026-09-15" -> Date locale à midi (évite les décalages de fuseau). */
export function dateDepuisIso(iso: string): Date {
  const [a, m, j] = iso.split("-").map(Number);
  return new Date(a, m - 1, j, 12);
}

/** Date -> "2026-09-15" */
export function isoDepuisDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Jour de la semaine d'une date, en français. */
export function jourDeLaSemaine(d: Date): Jour {
  // getDay(): 0 = dimanche
  return (["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const)[d.getDay()];
}

export const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function formaterDate(iso: string): string {
  const d = dateDepuisIso(iso);
  return `${LIBELLES_JOURS[jourDeLaSemaine(d)]} ${d.getDate() === 1 ? "1er" : d.getDate()} ${MOIS[d.getMonth()]}`;
}
