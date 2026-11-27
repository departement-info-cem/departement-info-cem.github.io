import { z } from "zod";
import { urlWeb } from "./liens";

// data/cours.yaml : catalogue des cours
export const coursSchema = z
  .object({
    no: z.string(),
    nom: z.string(),
    heures: z.number().optional(),
    ponderation: z.string().optional(),
    ecole: z.string().optional(),
    tags: z.array(z.string()).optional(),
    url: urlWeb().optional(),
    /** fiche officielle du cours dans un autre établissement (UdeS) */
    fiche: urlWeb().optional(),
    description: z.string().optional(),
    /** anciens numéros du cours, avec l'ancien titre s'il a changé avec le programme */
    alias: z.array(z.union([z.string().transform((no) => ({ no, nom: undefined as string | undefined })), z.object({ no: z.string(), nom: z.string().optional() }).strict()])).optional(),
  })
  .strict();
export type Cours = z.infer<typeof coursSchema>;

// Dans une grille, un cours est soit un numéro du catalogue, soit un cours « hors catalogue ».
export const coursHorsCatalogueSchema = z
  .object({
    nom: z.string(),
    no: z.string().optional(),
    heures: z.number().optional(),
    ponderation: z.string().optional(),
    ecole: z.string().optional(),
    tags: z.array(z.string()).optional(),
    url: urlWeb().optional(),
    /** fiche officielle du cours dans un autre établissement (UdeS) */
    fiche: urlWeb().optional(),
    description: z.string().optional(),
  })
  .strict();

export const TYPES_PROGRAMME = ["dec", "dec-bac", "aec", "pre-u"] as const;

export const programmeSchema = z
  .object({
    nom: z.string(),
    court: z.string(),
    type: z.enum(TYPES_PROGRAMME),
    code: z.string().optional(),
    famille: z.string().optional(),
    duree: z.string(),
    ordre: z.number().default(99),
    resume: z.string(),
    lien: urlWeb().optional(),
    source: urlWeb().optional(),
    remarque: z.string().optional(),
    sessions: z.array(
      z
        .object({
          titre: z.string(),
          note: z.string().optional(),
          /** liste de cours parmi lesquels on en choisit un : exclue des totaux */
          auChoix: z.boolean().default(false),
          cours: z.array(z.union([z.string(), coursHorsCatalogueSchema])),
        })
        .strict(),
    ),
  })
  .strict();

/** Cours tel qu'affiché dans une grille (catalogue résolu). */
export type CoursAffiche = {
  no?: string;
  nom: string;
  heures?: number;
  ponderation?: string;
  ecole?: string;
  tags: string[];
  url?: string;
  fiche?: string;
  description?: string;
  /** cours donné par le département d'informatique (420-...) */
  departement: boolean;
};

export type Programme = Omit<z.infer<typeof programmeSchema>, "sessions"> & {
  id: string;
  sessions: { titre: string; note?: string; auChoix: boolean; cours: CoursAffiche[] }[];
};
