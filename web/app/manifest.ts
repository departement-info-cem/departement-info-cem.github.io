import type { MetadataRoute } from "next";
import { chemin } from "@/lib/chemins";

// Ce qui permet d'ajouter le site à l'écran d'accueil d'un téléphone, comme une appli (voir components/installer-appli.tsx).
// Next n'ajoute pas /react aux adresses écrites ici : d'où chemin().
// Les PNG reprennent public/images/logo.svg sur fond marine : arrondi pour icone-192 et icone-512, plein pour la version
// masquable et apple-icon.png (Android et iOS découpent eux-mêmes l'icône). Une cellule du logo y fait un nombre entier
// de pixels (4, 10 ou 11) pour rester nette. À refaire si le logo change.

// Exigé par l'export statique (output: "export")
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: chemin("/"),
    name: "Département d'informatique | Cégep Édouard-Montpetit",
    // Sous l'icône, il n'y a de la place que pour une douzaine de lettres
    short_name: "Info CEM",
    description: "Tes cours, ton horaire, tes profs et les locaux libres du département d'informatique.",
    lang: "fr-CA",
    // L'appli s'ouvre sur l'horaire de l'étudiant. Sur iPhone, elle ne voit pas les cours entrés dans Safari :
    // la première fois, elle tombe donc là où on les choisit.
    start_url: chemin("/mes-cours/"),
    scope: chemin("/"),
    display: "standalone",
    background_color: "#0c3455",
    theme_color: "#0c3455",
    icons: [
      { src: chemin("/icone-192.png"), sizes: "192x192", type: "image/png" },
      { src: chemin("/icone-512.png"), sizes: "512x512", type: "image/png" },
      { src: chemin("/icone-masquable.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Appui long sur l'icône (Android)
    shortcuts: [
      { name: "Profs", url: chemin("/profs/") },
      { name: "Locaux libres", url: chemin("/maintenant/") },
      { name: "Calendrier", url: chemin("/calendrier/") },
      { name: "Sites des cours", url: chemin("/sites/") },
    ],
  };
}
