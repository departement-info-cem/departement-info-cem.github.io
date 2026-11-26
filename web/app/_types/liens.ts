import { z } from "zod";

// z.url() seul accepte n'importe quel protocole, dont javascript: et data: :
// un lien dans les données ne doit mener qu'à une page web.
export const urlWeb = (error = "adresse web invalide (commence par https://)") => z.url({ protocol: /^https?$/, error });

// Lien vers une page du site (/programmes/dec-prog) ou une adresse web.
// « // » est exclu : //exemple.com mènerait vers un autre site.
export const lienSiteOuWeb = z.union([z.string().regex(/^\/(?!\/)/), urlWeb()], {
  error: "lien invalide : une page du site (commence par /) ou une adresse web (commence par https://)",
});
