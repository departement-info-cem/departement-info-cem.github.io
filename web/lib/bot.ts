import type { Bot } from "@/app/_types/divers";

// Parcours de l'arbre de décision du bot d'orientation.
export type Etape = { type: "question"; id: string } | { type: "resultat"; id: string };

export function etapeSuivante(bot: Bot, questionId: string, indexChoix: number): Etape {
  const choix = bot.questions[questionId]?.choix[indexChoix];
  if (!choix) throw new Error(`choix ${indexChoix} inexistant pour la question ${questionId}`);
  return choix.suivant ? { type: "question", id: choix.suivant } : { type: "resultat", id: choix.resultat! };
}

/** Profondeur maximale restante depuis une question (pour la barre de progression). */
export function profondeur(bot: Bot, questionId: string, vues = new Set<string>()): number {
  if (vues.has(questionId)) return 0;
  vues.add(questionId);
  const q = bot.questions[questionId];
  if (!q) return 0;
  return 1 + Math.max(0, ...q.choix.map((c) => (c.suivant ? profondeur(bot, c.suivant, new Set(vues)) : 0)));
}
