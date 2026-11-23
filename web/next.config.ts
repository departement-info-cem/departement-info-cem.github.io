import path from "node:path";
import type { NextConfig } from "next";

// Le site est exporté en fichiers statiques (GitHub Pages) et servi sous /react/
// en parallèle de l'ancien site Angular. Pour la bascule finale : basePath "".
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
