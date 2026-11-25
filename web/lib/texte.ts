/** Minuscules et sans accents, pour chercher « edouard » et trouver « Édouard ». */
export function simplifier(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** « Pierre-Olivier Brillant » -> « P.-O. Brillant », « Éric B. Gendron » -> « É. B. Gendron » */
export function nomCourt(nom: string): string {
  const [prenom, ...reste] = nom.trim().split(/\s+/);
  if (!reste.length) return nom;
  return `${prenom.split("-").filter(Boolean).map((p) => `${p[0].toUpperCase()}.`).join("-")} ${reste.join(" ")}`;
}
