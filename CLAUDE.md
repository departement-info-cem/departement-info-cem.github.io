# Consignes pour Claude

Ce dépôt contient deux sites :

- `web/` : le site (Next.js, publié à la racine de https://info.cegepmontpetit.ca/). **Tout le travail se fait là.**
- `angular/` : l'ancien site, plus déployé (il sera supprimé). N'y touche pas, ni aux fichiers JSON de `data/` qu'il lit, sauf demande explicite.

Commandes du site (dans `web/`) : voir [web/README.md](web/README.md). Particularités de cette version de Next.js : @web/AGENTS.md

**Nouvelle session**, ou mise à jour des horaires des profs et des labos : suis [data/changement-de-session.md](data/changement-de-session.md).

## Captures avant / après dans les PR

Quand une PR change l'apparence du site, sa description montre l'avant et l'après côte à côte.

- **Avant** : le site en ligne, https://info.cegepmontpetit.ca/… (redéployé à chaque push sur `main`).
  **Après** : `npm run dev` dans `web/`, puis http://localhost:3000/….
- Capture seulement ce qui change (le bouton, la carte, la section), au même endroit et avec la même taille de fenêtre des deux côtés.
  Ajoute la vue mobile si le changement y paraît.
  Émule `prefers-reduced-motion: reduce`, sinon les sections apparaissent en fondu et la capture peut tomber en plein milieu.
- GitHub n'accepte pas d'images dans une PR en ligne de commande. Dépose-les sur la branche `captures-pr`, qui n'est jamais fusionnée :

  ```bash
  N=42  # numéro de la PR ; avant.png et apres.png dans le dossier courant
  D=$(mktemp -d)
  if git fetch -q origin captures-pr 2>/dev/null; then git worktree add -q --detach --no-checkout "$D" FETCH_HEAD && git -C "$D" reset -q
  else git worktree add -q --orphan -b captures-pr "$D"; fi  # la première fois
  mkdir -p "$D/pr-$N" && cp avant.png apres.png "$D/pr-$N/"
  # --ignore-removal : le worktree est vide, sans ça les captures déjà déposées pour cette PR seraient supprimées
  git -C "$D" add --ignore-removal "pr-$N" && git -C "$D" commit -qm "Captures de la PR #$N" && git -C "$D" push -q origin HEAD:captures-pr
  SHA=$(git -C "$D" rev-parse HEAD); git worktree remove --force "$D"; git branch -qD captures-pr 2>/dev/null || true
  ```

  Pour remplacer ou ajouter des captures plus tard, relance la même commande avec seulement les nouveaux fichiers : les autres restent.

- Dans la description de la PR, avec ce `$SHA` (le dernier, si tu as redéposé des captures) :

  ```markdown
  | Avant | Après |
  | :---: | :---: |
  | ![Avant](https://raw.githubusercontent.com/departement-info-cem/departement-info-cem.github.io/<SHA>/pr-42/avant.png) | ![Après](https://raw.githubusercontent.com/departement-info-cem/departement-info-cem.github.io/<SHA>/pr-42/apres.png) |
  ```
