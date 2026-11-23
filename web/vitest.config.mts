import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  // Données figées : modifier une fiche de prof ne doit jamais faire échouer les tests (ni le déploiement)
  test: { include: ["tests/**/*.test.ts"], env: { DOSSIER_DONNEES: "tests/fixtures/data" } },
});
