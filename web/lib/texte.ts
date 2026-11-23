/** Minuscules et sans accents, pour chercher « edouard » et trouver « Édouard ». */
export function simplifier(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
