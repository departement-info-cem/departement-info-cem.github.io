import path from "node:path";
import type { NextConfig } from "next";

// Le site est exporté en fichiers statiques (GitHub Pages) et servi à la racine de info.cegepmontpetit.ca.
// Les anciennes adresses (/react/..., site Angular) sont redirigées par la page 404 : voir lib/redirections.ts.
// Les agendas (.ics) et les données des sites de cours (.json) sont aussi recopiés sous /react/ : scripts/anciennes-adresses.ts.
export const BASE_PATH = "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  // /joris.deguet/ -> joris.deguet/index.html : GitHub Pages sait servir ça directement.
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
