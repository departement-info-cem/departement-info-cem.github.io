import path from "node:path";
import type { NextConfig } from "next";

// Le site est exporté en fichiers statiques (GitHub Pages) et servi sous /react/
// en parallèle de l'ancien site Angular. Pour la bascule finale : basePath "".
// À la bascule, des adresses en /react/ sont déjà dans la nature et doivent continuer de répondre :
// - /react/agenda/*.ics : les agendas des téléphones y sont abonnés (ils ne suivent pas de redirection en JavaScript) ;
// - /react/donnees/cours/*.json : les sites de cours (depinfo-gabarit) essaient /donnees/ puis /react/, garder un temps ;
// - les pages /react/... : liens partagés, favoris, et l'appli de l'écran d'accueil qui démarre sur /react/mes-cours/.
export const BASE_PATH = "/react";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  // /react/joris.deguet/ -> joris.deguet/index.html : GitHub Pages sait servir ça directement.
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  turbopack: {
    // racine du dépôt : le site lit les données dans ../data
    root: path.resolve(__dirname, ".."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
