import type { CoursAffiche } from "@/app/_types/programme";

/** Total d'heures d'une liste de cours (les cours sans heures sont ignorés). */
export function totalHeures(cours: CoursAffiche[]): number {
  return cours.reduce((t, c) => t + (c.heures ?? 0), 0);
}
