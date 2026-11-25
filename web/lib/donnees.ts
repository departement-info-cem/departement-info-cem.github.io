// Chargement des données YAML du dossier ../data, au moment du build (côté serveur seulement).
// Chaque fonction valide le fichier avec son schéma zod ; une erreur arrête le build
// avec un message clair (voir aussi scripts/valider-donnees.ts).
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { z } from "zod";
import { profSchema, type Prof } from "@/app/_types/prof";
import { coursSchema, programmeSchema, type Cours, type CoursAffiche, type Programme } from "@/app/_types/programme";
import { botSchema, calendrierScolaireSchema, coursServiceSchema, faqSchema, laboratoiresSchema, logicielsSchema, type Bot, type CalendrierScolaire, type CoursService, type Laboratoire, type Logiciel, type Question } from "@/app/_types/divers";
import type { ProfHoraire } from "@/lib/maintenant";
import type { DonneesMesCours, GroupeCours } from "@/lib/mes-cours";
import { JOURS, normaliserJour } from "@/lib/temps";
import { estActif } from "@/lib/actif";
import { formaterErreurs } from "@/lib/erreurs";

export const DOSSIER_DONNEES = path.resolve(process.cwd(), process.env.DOSSIER_DONNEES ?? "../data");

// Mémoire cache : chaque fichier n'est lu et validé qu'une fois par build.
const cache = new Map<string, unknown>();
function enCache<T>(cle: string, calcul: () => T): T {
  if (!cache.has(cle)) cache.set(cle, calcul());
  return cache.get(cle) as T;
}

function lireYaml(fichier: string): unknown {
  return YAML.parse(fs.readFileSync(path.join(DOSSIER_DONNEES, fichier), "utf8"));
}

function valider<T extends z.ZodType>(schema: T, fichier: string): z.infer<T> {
  const resultat = schema.safeParse(lireYaml(fichier));
  if (!resultat.success) {
    throw new Error(`Erreur dans data/${fichier} :\n${formaterErreurs(resultat.error)}`);
  }
  return resultat.data;
}

// ---------- Profs ----------

export function fichiersProfs(): string[] {
  return fs
    .readdirSync(path.join(DOSSIER_DONNEES, "profs"))
    .filter((f) => f.endsWith(".yaml") && !f.startsWith("_"))
    .sort();
}

export function profs(): Prof[] {
  return enCache("profs", () =>
    fichiersProfs()
    .map((f) => ({ ...valider(profSchema, `profs/${f}`), id: f.replace(/\.yaml$/, "") }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr")),
  );
}

export function prof(id: string): Prof | undefined {
  return profs().find((p) => p.id === id);
}

/** Identifiants des profs actifs en ce moment (cours cette session, ou « actif: true » dans la fiche). */
export function idsProfsActifs(date = new Date()): string[] {
  return profs().filter((p) => estActif(p, calendrierScolaire(), date)).map((p) => p.id);
}

// ---------- Cours et programmes ----------

export function catalogue(): Cours[] {
  return enCache("cours", () => valider(coursSchema.array(), "cours.yaml"));
}

/** Trouve un cours du catalogue par numéro, en tenant compte des alias. */
export function trouverCours(no: string): Cours | undefined {
  const n = no.trim().toUpperCase();
  return catalogue().find((c) => c.no.toUpperCase() === n || c.alias?.some((a) => a.no.toUpperCase() === n));
}

function afficher(c: Partial<Cours> & { nom: string }): CoursAffiche {
  return {
    no: c.no,
    nom: c.nom,
    heures: c.heures,
    ponderation: c.ponderation,
    ecole: c.ecole,
    tags: c.tags ?? [],
    url: c.url,
    fiche: c.fiche,
    description: c.description,
    departement: Boolean(c.no?.startsWith("420-")),
  };
}

export function programmes(): Programme[] {
  return enCache("programmes", () => lireProgrammes());
}

function lireProgrammes(): Programme[] {
  return fs
    .readdirSync(path.join(DOSSIER_DONNEES, "programmes"))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => {
      const p = valider(programmeSchema, `programmes/${f}`);
      return {
        ...p,
        id: f.replace(/\.yaml$/, ""),
        sessions: p.sessions.map((s) => ({
          ...s,
          cours: s.cours.map((c) => {
            if (typeof c !== "string") return afficher(c);
            const trouve = trouverCours(c);
            if (!trouve) throw new Error(`data/programmes/${f} : le cours ${c} n'existe pas dans data/cours.yaml`);
            return afficher(trouve);
          }),
        })),
      };
    })
    .sort((a, b) => a.ordre - b.ordre);
}

export function programme(id: string): Programme | undefined {
  return programmes().find((p) => p.id === id);
}

// ---------- Divers ----------

export function calendrierScolaire(): CalendrierScolaire {
  return enCache("calendrier-scolaire.yaml", () => valider(calendrierScolaireSchema, "calendrier-scolaire.yaml"));
}

export function faq(): Question[] {
  return enCache("faq.yaml", () => valider(faqSchema, "faq.yaml"));
}

export function logiciels(): Logiciel[] {
  return enCache("logiciels.yaml", () => valider(logicielsSchema, "logiciels.yaml"));
}

export function laboratoires(): Laboratoire[] {
  return enCache("laboratoires.yaml", () => valider(laboratoiresSchema, "laboratoires.yaml"));
}

export type ServiceAffiche = Omit<CoursService[number], "cours"> & { cours: (CoursService[number]["cours"][number] & { info: CoursAffiche })[] };

export function coursService(): ServiceAffiche[] {
  return enCache("cours-service.yaml", () =>
    valider(coursServiceSchema, "cours-service.yaml").map((p) => ({
      ...p,
      cours: p.cours.map((c) => {
        const trouve = trouverCours(c.no);
        if (!trouve) throw new Error(`data/cours-service.yaml : le cours ${c.no} n'existe pas dans data/cours.yaml`);
        return { ...c, info: afficher(trouve) };
      }),
    })),
  );
}

/** Version légère des profs (pour la page « Locaux »). */
export function profsHoraire(): ProfHoraire[] {
  return profs().map((p) => ({ id: p.id, nom: p.nom, session: p.session, calendrier: p.calendrier, bureau: p.bureau, photo: p.photo, plages: p.horaire?.plages ?? [] }));
}

export type SiteCours = { no: string; nom: string; url: string; places: { id: string; court: string; session: string }[] };

/** Tous les cours qui ont un site web, avec leur place dans les grilles. */
export function sitesCours(): SiteCours[] {
  return catalogue()
    .filter((c) => c.url)
    .map((c) => ({
      no: c.no,
      nom: c.nom,
      url: c.url!,
      places: [
        ...programmes().flatMap((p) => p.sessions.filter((s) => s.cours.some((x) => x.no === c.no)).map((s) => ({ id: p.id, court: p.court, session: s.titre }))),
        ...coursService().filter((p) => p.cours.some((x) => x.info.no === c.no)).map((p) => (p.discipline ? { id: "sn", court: p.court, session: p.programme } : { id: "service", court: p.court, session: "Cours de service" })),
      ],
    }));
}

export function bot(): Bot {
  return enCache("bot.yaml", () => valider(botSchema, "bot.yaml"));
}

/** Le modèle de fiche prof, affiché sur la page « Modifier mon profil ». */
export function modeleProf(): string {
  return fs.readFileSync(path.join(DOSSIER_DONNEES, "profs", "_modele.yaml"), "utf8");
}

/** Le texte YAML brut d'un prof (pour l'aperçu en direct). */
export function yamlProf(id: string): string {
  return fs.readFileSync(path.join(DOSSIER_DONNEES, "profs", `${id}.yaml`), "utf8");
}

/** Index léger des cours (numéro -> nom, url) pour les composants clients. */
export function indexCours(): Record<string, { no: string; nom: string; url?: string }> {
  const index: Record<string, { no: string; nom: string; url?: string }> = {};
  for (const c of catalogue()) {
    const info = { no: c.no, nom: c.nom, url: c.url };
    index[c.no.toUpperCase()] = info;
    // Un ancien numéro garde son ancien titre
    for (const a of c.alias ?? []) index[a.no.toUpperCase()] = { ...info, nom: a.nom ?? c.nom };
  }
  return index;
}

/** Numéro canonique d'un cours (un ancien numéro donne le nouveau), en majuscules. */
export function numeroCanonique(no: string): string {
  return (trouverCours(no)?.no ?? no).toUpperCase();
}

/** Les cours d'un prof (sa liste « cours » et ceux de son horaire), en numéros canoniques. */
export function coursDuProf(p: Prof): string[] {
  return [...new Set([...(p.cours ?? []), ...(p.horaire?.plages.flatMap((x) => (x.cours ? [x.cours] : [])) ?? [])].map(numeroCanonique))];
}

/** Les cours pour lesquels un prof peut aider : ceux qu'il donne et ceux du champ « aide », en numéros canoniques. */
export function coursAide(p: Prof): string[] {
  return [...new Set([...coursDuProf(p), ...(p.aide ?? []).map(numeroCanonique)])];
}

/** Pour « Mes cours » : les groupes de chaque cours (d'après les horaires des profs actifs), les cours et les dispos des profs. */
export function donneesMesCours(date = new Date()): DonneesMesCours {
  const actifs = new Set(idsProfsActifs(date));
  const groupes: DonneesMesCours["groupes"] = {};
  const infos: DonneesMesCours["profs"] = {};
  const rangJour = (j: string) => JOURS.indexOf(normaliserJour(j) ?? "dimanche");
  for (const p of profs().filter((x) => actifs.has(x.id))) {
    const cours = coursDuProf(p);
    const plages = p.horaire?.plages ?? [];
    infos[p.id] = {
      nom: p.nom,
      session: p.session,
      cours,
      aide: coursAide(p),
      dispos: plages.filter((x) => x.type === "dispo" || x.type === "centre-aide"),
      calendrier: (p.calendrier ?? []).map((e) => (e.cours ? { ...e, cours: numeroCanonique(e.cours) } : e)),
    };
    const siens = new Map<string, GroupeCours>();
    for (const x of plages) {
      if (x.type !== "cours" || !x.cours) continue;
      const no = numeroCanonique(x.cours);
      const cle = `${no}|${x.groupe ?? ""}`;
      if (!siens.has(cle)) siens.set(cle, { cours: no, prof: p.id, groupe: x.groupe, session: p.session, seances: [] });
      siens.get(cle)!.seances.push({ jour: normaliserJour(x.jour) ?? x.jour, debut: x.debut, fin: x.fin, local: x.local });
    }
    // Un cours de sa liste sans horaire inscrit : on peut quand même dire que c'est son prof
    for (const no of cours) if (![...siens.values()].some((g) => g.cours === no)) siens.set(no, { cours: no, prof: p.id, session: p.session, seances: [] });
    const parGroupe = [...siens.values()].sort((a, b) => (a.groupe ?? "").localeCompare(b.groupe ?? "", "fr", { numeric: true }));
    for (const g of parGroupe) {
      g.seances.sort((a, b) => rangJour(a.jour) - rangJour(b.jour) || a.debut.padStart(5, "0").localeCompare(b.debut.padStart(5, "0")));
      (groupes[g.cours] ??= []).push(g);
    }
  }
  // Ordre : profs par nom (profs() est trié), puis groupes par numéro
  return { groupes, profs: infos, cours: indexCours() };
}

export type LogicielAffiche = Logiciel & { coursLies: string[] };

/** Les logiciels, avec les cours où ils servent (champ cours, ou tags en commun avec les cours du catalogue). */
export function logicielsAvecCours(): LogicielAffiche[] {
  return logiciels().map((l) => ({
    ...l,
    coursLies: [
      ...new Set([
        ...(l.cours ?? []).map(numeroCanonique),
        ...catalogue().filter((c) => c.tags?.some((t) => l.tags?.includes(t))).map((c) => c.no.toUpperCase()),
      ]),
    ],
  }));
}

/** Numéro de cours -> profs qui le donnent (selon leurs fiches). */
export function profsParCours(): Record<string, { id: string; nom: string }[]> {
  const resultat: Record<string, { id: string; nom: string }[]> = {};
  for (const p of profs()) {
    const nos = new Set([...(p.cours ?? []), ...(p.horaire?.plages.flatMap((x) => (x.cours ? [x.cours] : [])) ?? [])]);
    for (const no of nos) {
      const cle = (trouverCours(no)?.no ?? no).toUpperCase();
      (resultat[cle] ??= []).push({ id: p.id, nom: p.nom });
    }
  }
  return resultat;
}

/** Cours présents dans tous les programmes d'une même famille (ex. tronc commun des deux profils du DEC). */
export function coursCommuns(id: string): string[] {
  const p = programme(id);
  if (!p?.famille) return [];
  const famille = programmes().filter((x) => x.famille === p.famille);
  if (famille.length < 2) return [];
  const ensembles = famille.map((f) => new Set(f.sessions.flatMap((s) => s.cours.map((c) => c.no)).filter(Boolean)));
  return [...ensembles[0]].filter((no) => ensembles.every((e) => e.has(no))) as string[];
}
