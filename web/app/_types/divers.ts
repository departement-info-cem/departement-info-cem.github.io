import { z } from "zod";
import { heureEnMinutes, normaliserJour } from "@/lib/temps";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// data/calendrier-scolaire.yaml
export const TYPES_JOUR_SCOLAIRE = [
  "conge", // pas de cours
  "pedagogique", // pas de cours
  "mise-a-jour", // pas de cours
  "relache", // semaine de relâche
  "encadrement", // activités sans évaluation
  "suspension", // élections, journée institutionnelle...
  "horaire-modifie", // on suit l'horaire d'un autre jour
  "reprise", // journée particulière d'enseignement
  "evaluations", // évaluations terminales communes (EC, EUL) : pas de cours réguliers
  "evaluations-horaire", // évaluations terminales selon l'horaire régulier (EHR)
  "limite", // date limite administrative (désinscription, abandon)
  "info",
] as const;
export type TypeJourScolaire = (typeof TYPES_JOUR_SCOLAIRE)[number];

/** Types de journées où les cours réguliers n'ont pas lieu. */
export const SANS_COURS: TypeJourScolaire[] = ["conge", "pedagogique", "mise-a-jour", "relache", "suspension", "evaluations", "reprise", "encadrement"];

export const calendrierScolaireSchema = z
  .object({
    source: z.url().optional(),
    /** les PDF officiels dont le fichier est extrait */
    pdf: z.array(z.object({ annee: z.string(), url: z.url(), revise: z.string().optional() }).strict()).default([]),
    sessions: z.array(
      z.object({ id: z.string(), nom: z.string(), debut: z.string().regex(DATE), fin: z.string().regex(DATE) }).strict(),
    ),
    journees: z.array(
      z
        .object({
          date: z.string().regex(DATE),
          au: z.string().regex(DATE).optional(),
          titre: z.string(),
          type: z.enum(TYPES_JOUR_SCOLAIRE),
          /** code officiel du calendrier : JR, EC, EHR, JM, JP... */
          code: z.string().optional(),
          horaireDu: z.string().optional(),
        })
        .strict(),
    ),
  })
  .strict();
export type CalendrierScolaire = z.infer<typeof calendrierScolaireSchema>;

// data/faq.yaml
export const faqSchema = z.array(
  z
    .object({
      question: z.string(),
      reponse: z.string(),
      categories: z.array(z.string()).default([]),
      liens: z.array(z.string()).default([]),
    })
    .strict(),
);
export type Question = z.infer<typeof faqSchema>[number];

// data/bot.yaml : arbre de décision du bot d'orientation
const choixSchema = z
  .object({
    texte: z.string(),
    suivant: z.string().optional(),
    resultat: z.string().optional(),
  })
  .strict()
  .refine((c) => Boolean(c.suivant) !== Boolean(c.resultat), { error: "un choix mène soit à une question (suivant), soit à un résultat (resultat)" });

export const botSchema = z
  .object({
    depart: z.string(),
    questions: z.record(z.string(), z.object({ question: z.string(), aide: z.string().optional(), choix: z.array(choixSchema).min(1) }).strict()),
    resultats: z.record(
      z.string(),
      z
        .object({
          titre: z.string(),
          compatibilite: z.number().min(0).max(100),
          texte: z.string(),
          liens: z.array(z.object({ texte: z.string(), href: z.string() }).strict()).default([]),
        })
        .strict(),
    ),
  })
  .strict();
export type Bot = z.infer<typeof botSchema>;

// data/logiciels.yaml
export const logicielsSchema = z.array(
  z
    .object({
      nom: z.string(),
      /** fichier dans web/public/images/logiciels/ */
      logo: z.string().optional(),
      identifiant: z.string(),
      description: z.string(),
      lien: z.url(),
      bouton: z.string(),
      vedette: z.boolean().default(false),
    })
    .strict(),
);
export type Logiciel = z.infer<typeof logicielsSchema>[number];

// data/laboratoires.yaml : les locaux et leur horaire d'occupation
const heureLabo = z.string().refine((h) => heureEnMinutes(h) !== null, { error: (i) => `heure invalide « ${i.input} » (ex. "08:00")` });
export const laboratoireSchema = z
  .object({
    local: z.string(),
    nom: z.string().optional(),
    postes: z.number().optional(),
    description: z.string().optional(),
    /** session de l'horaire ci-dessous (ex. A2026) */
    session: z.string().optional(),
    /** true si toutes les occupations sont inscrites : seulement alors, on ose dire « libre » */
    complet: z.boolean().default(false),
    ouverture: heureLabo.default("07:00"),
    fermeture: heureLabo.default("23:00"),
    occupations: z
      .array(
        z
          .object({
            jour: z.string().refine((j) => normaliserJour(j) !== null, { error: (i) => `jour inconnu « ${i.input} »` }),
            debut: heureLabo,
            fin: heureLabo,
            cours: z.string().optional(),
            groupe: z.union([z.string(), z.number()]).transform(String).optional(),
            titre: z.string().optional(),
            prof: z.string().optional(),
            /** groupe du soir (AEC) qui ne suit pas le calendrier scolaire */
            horsCalendrier: z.boolean().optional(),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();
export const laboratoiresSchema = z.array(laboratoireSchema);
export type Laboratoire = z.infer<typeof laboratoireSchema>;

// data/cours-service.yaml : Sciences de la nature (où l'informatique est une discipline) et cours de service
export const coursServiceSchema = z.array(
  z
    .object({
      programme: z.string(),
      court: z.string(),
      /** l'informatique est une discipline de ce programme : ce n'est pas un cours de service */
      discipline: z.boolean().default(false),
      lien: z.url().optional(),
      description: z.string().optional(),
      cours: z.array(z.object({ no: z.string(), quand: z.array(z.string()).default([]), note: z.string().optional() }).strict()),
    })
    .strict(),
);
export type CoursService = z.infer<typeof coursServiceSchema>;
