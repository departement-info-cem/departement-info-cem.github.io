import { z } from "zod";
import { heureEnMinutes, normaliserJour } from "@/lib/temps";

// Schéma d'un fichier data/profs/<identifiant>.yaml.
// Les messages d'erreur sont en français : ils s'affichent dans GitHub Actions
// et dans l'aperçu de la page « Modifier mon profil ».

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const heure = z
  .string({ error: "une heure doit être écrite entre guillemets, ex. \"08:00\"" })
  .refine((h) => heureEnMinutes(h) !== null, { error: (i) => `heure invalide « ${i.input} » (format attendu : \"08:00\" ou \"8:00\")` });

const jour = z
  .string({ error: "jour manquant (lundi, mardi, mercredi, jeudi ou vendredi)" })
  .refine((j) => normaliserJour(j) !== null, { error: (i) => `jour inconnu « ${i.input} » (écris lundi, mardi, mercredi, jeudi ou vendredi)` });

export const TYPES_PLAGE = ["cours", "dispo", "centre-aide", "reunion", "autre"] as const;
export type TypePlage = (typeof TYPES_PLAGE)[number];

export const LIBELLES_TYPES_PLAGE: Record<TypePlage, string> = {
  cours: "Cours",
  dispo: "Disponibilité",
  "centre-aide": "Centre d'aide",
  reunion: "Réunion",
  autre: "Autre",
};

const texteOuNombre = z.union([z.string(), z.number()]).transform(String);

export const plageSchema = z
  .object({
    jour,
    debut: heure,
    fin: heure,
    type: z.enum(TYPES_PLAGE, { error: `type inconnu (choix : ${TYPES_PLAGE.join(", ")})` }).default("cours"),
    titre: z.string().optional(),
    cours: z.string().optional(),
    groupe: texteOuNombre.optional(),
    local: z.string().optional(),
  })
  .superRefine((p, ctx) => {
    const d = heureEnMinutes(p.debut);
    const f = heureEnMinutes(p.fin);
    if (d !== null && f !== null && f <= d) {
      ctx.addIssue({ code: "custom", path: ["fin"], message: `la fin (${p.fin}) doit être après le début (${p.debut})` });
    }
    if (p.type === "cours" && !p.cours && !p.titre) {
      ctx.addIssue({ code: "custom", path: ["cours"], message: "une plage de type cours doit indiquer le numéro du cours (ex. 420-5N6-EM) ou un titre" });
    }
  });
export type Plage = z.infer<typeof plageSchema>;

export const TYPES_EVENEMENT = ["remise", "examen", "cours", "absence", "deplacement", "activite", "autre"] as const;
export type TypeEvenement = (typeof TYPES_EVENEMENT)[number];

export const TYPES_EVALUATION = ["sommative", "formative"] as const;

export const evenementProfSchema = z
  .object({
    date: z.string({ error: "date manquante (format AAAA-MM-JJ, ex. 2026-09-15)" }).regex(DATE, { error: "date invalide (format AAAA-MM-JJ, ex. 2026-09-15)" }),
    au: z.string().regex(DATE, { error: "date de fin invalide (format AAAA-MM-JJ)" }).optional(),
    titre: z.string({ error: "titre manquant" }).optional(),
    type: z.enum(TYPES_EVENEMENT, { error: `type inconnu (choix : ${TYPES_EVENEMENT.join(", ")})` }).default("autre"),
    cours: z.string().optional(),
    groupe: texteOuNombre.optional(),
    /** déplacement : la date du cours d'origine (le cours est repris à « date ») */
    remplace: z.string().regex(DATE, { error: "remplace : date invalide (format AAAA-MM-JJ, la date du cours d'origine)" }).optional(),
    debut: heure.optional(),
    fin: heure.optional(),
    local: z.string().optional(),
    description: z.string().optional(),
    /** évaluation sommative (comptée) ou formative : mise en avant dans le calendrier des étudiants du cours */
    evaluation: z.enum(TYPES_EVALUATION, { error: "evaluation : sommative ou formative" }).optional(),
  })
  .strict()
  .superRefine((e, ctx) => {
    if (e.evaluation && (e.type === "absence" || e.type === "deplacement")) ctx.addIssue({ code: "custom", path: ["evaluation"], message: "« evaluation » ne va pas avec une absence ou un déplacement" });
    if (e.evaluation && !e.cours) ctx.addIssue({ code: "custom", path: ["cours"], message: "une évaluation doit indiquer son cours (ex. cours: 420-5N6-EM), pour paraître dans le calendrier des étudiants" });
    if (!e.titre && e.type !== "deplacement" && e.type !== "absence") ctx.addIssue({ code: "custom", path: ["titre"], message: "titre manquant" });
    if (e.type === "deplacement" && !e.remplace) ctx.addIssue({ code: "custom", path: ["remplace"], message: "un déplacement doit indiquer la date du cours d'origine, ex. remplace: 2026-11-05" });
    if (e.type === "deplacement" && !e.cours) ctx.addIssue({ code: "custom", path: ["cours"], message: "un déplacement doit indiquer le cours déplacé" });
    if (e.type !== "deplacement" && e.remplace) ctx.addIssue({ code: "custom", path: ["remplace"], message: "« remplace » ne sert qu'avec type: deplacement" });
    const [d, f] = [e.debut && heureEnMinutes(e.debut), e.fin && heureEnMinutes(e.fin)];
    if (d && f && f <= d) ctx.addIssue({ code: "custom", path: ["fin"], message: `la fin (${e.fin}) doit être après le début (${e.debut})` });
    if (e.au && e.au < e.date) ctx.addIssue({ code: "custom", path: ["au"], message: "la date de fin (au) doit être après la date de début" });
  });
export type EvenementProf = z.infer<typeof evenementProfSchema>;

export const profSchema = z
  .object({
    nom: z.string({ error: "nom manquant" }).min(1),
    courriel: z
      .string({ error: "courriel manquant (sans @cegepmontpetit.ca)" })
      .regex(/^[a-z0-9][a-z0-9.-]*$/, { error: "courriel invalide : seulement la partie avant @cegepmontpetit.ca, en minuscules" }),
    bureau: z.string().optional(),
    photo: z.string().optional(),
    poste: texteOuNombre.optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
    site: z.url({ error: "site : adresse web invalide (commence par https://)" }).optional(),
    presentation: z.string().optional(),
    /** Remplace le calcul de lib/actif.ts (cours cette session). À true pour la coordination. */
    actif: z.boolean({ error: "actif : écris true ou false, sans guillemets" }).optional(),
    cours: z.array(z.string()).optional(),
    /** cours pour lesquels il peut aider (centre d'aide) ; ceux qu'il donne comptent d'office */
    aide: z
      .array(z.string({ error: "numéro de cours complet attendu, ex. 420-1P6-EM" }).regex(/^\d{3}-[0-9A-Z]{3}-[A-Z]{2}$/i, { error: (i) => `numéro de cours invalide « ${i.input} » (écris-le au complet, ex. 420-1P6-EM)` }))
      .optional(),
    session: z.string().regex(/^[AHE]\d{4}$/, { error: "session invalide (ex. A2026 pour automne 2026, H2027 pour hiver 2027)" }).optional(),
    horaire: z
      .object({
        /** true : cours recopiés de l'horaire officiel des locaux, pas encore vérifiés par le prof */
        prerempli: z.boolean().optional(),
        debut: heure.default("08:00"),
        fin: heure.default("18:00"),
        plages: z.array(plageSchema).default([]),
      })
      .optional(),
    calendrier: z.array(evenementProfSchema).optional(),
  })
  .strict();

export type Prof = z.infer<typeof profSchema> & {
  /** identifiant = nom du fichier (= courriel), sert dans l'URL /react/<id> */
  id: string;
};
