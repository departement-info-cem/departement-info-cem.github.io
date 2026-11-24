// Les grilles les plus consultées : accès direct depuis l'accueil et le menu.
export const GRILLES_DIRECTES = [
  { href: "/programmes/dec-prog", texte: "DEC Dév", sousTitre: "Développement d'applications" },
  { href: "/programmes/dec-reseau", texte: "DEC Réseau", sousTitre: "Réseaux et cybersécurité" },
  { href: "/programmes/dec-bac", texte: "DEC-BAC", sousTitre: "Avec l'Université de Sherbrooke" },
];

export const FILTRES_SITES = [
  { id: "dec-prog", texte: "DEC Dév" },
  { id: "dec-reseau", texte: "DEC Réseau" },
  { id: "dec-bac", texte: "DEC-BAC" },
  { id: "sn", texte: "Sciences de la nature" },
  { id: "service", texte: "Cours de service" },
];

export const SHAREPOINT = "https://cegepedouardmontpetit.sharepoint.com/teams/PED-INFO";

// Site des stages, tenu à part : dates, formulaire d'offre et contacts pour les entreprises.
export const STAGES = "https://info.cegepmontpetit.ca/stages/";

// Les logos à droite de l'en-tête. Les fichiers sont dans public/images/liens/.
export const LIENS_LOGOS = [
  { href: SHAREPOINT, texte: "SharePoint du département", logo: "sharepoint.png" },
  { href: "https://cegepmontpetit.omnivox.ca/", texte: "Omnivox", logo: "omnivox.png" },
  { href: "https://www.cegepmontpetit.ca", texte: "Cégep Édouard-Montpetit", logo: "cegep.svg" },
  { href: "https://www.adeptinfo.ca", texte: "ADEPT, l'association étudiante", logo: "adept.webp" },
  { href: "https://github.com/departement-info-cem", texte: "GitHub du département", logo: "github.svg" },
];
