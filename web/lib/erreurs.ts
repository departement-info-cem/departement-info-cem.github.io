import type { z } from "zod";

/**
 * Transforme les erreurs zod en lignes lisibles en français, par ex. :
 *   - horaire → plages → 3e élément → jour : jour inconnu « mecredi » (...)
 */
export function formaterErreurs(erreur: z.ZodError): string {
  return erreur.issues
    .map((i) => {
      const chemin = i.path
        .map((p) => (typeof p === "number" ? `${p + 1}${p === 0 ? "er" : "e"} élément` : String(p)))
        .join(" → ");
      let message = i.message;
      if (i.code === "unrecognized_keys") message = `champ inconnu : ${i.keys.join(", ")} (faute de frappe ?)`;
      else if (i.code === "invalid_type" && i.input === undefined) message = message.startsWith("Invalid") ? "champ obligatoire manquant" : message;
      return `  - ${chemin ? `${chemin} : ` : ""}${message}`;
    })
    .join("\n");
}
