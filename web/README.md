# Documentation technique du site

Le site (Next.js, export statique) est publié à la racine de https://info.cegepmontpetit.ca/.
Pour la présentation générale et la façon de contribuer, voir le [README du dépôt](../README.md).

## Développement

```bash
cd web
npm ci
npm run dev   # http://localhost:3000
```

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement (copie d'abord les photos des profs) |
| `npm run valider` | Vérifie les fichiers de `data/` ; dans GitHub Actions, les erreurs s'affichent sur le fichier et la ligne |
| `npm run lint` | ESLint |
| `npm test` | Tests Vitest (`web/tests/`) |
| `npm run build` | Validation, build statique dans `web/out/`, puis copie des anciennes adresses |
| `npm run calendrier` | Régénère `data/calendrier-scolaire.yaml` à partir du PDF officiel (`-- --verifier` dit seulement ce qui a changé) |

Particularités de cette version de Next.js : [AGENTS.md](AGENTS.md).

## Données

Tout le contenu est dans `data/`, en YAML :

- `data/profs/<courriel>.yaml` : une fiche par prof (modèle : `_modele.yaml`). Mode d'emploi pour les profs :
  https://info.cegepmontpetit.ca/modifier-mon-profil
- `data/programmes/` : les grilles de cours ; `data/cours.yaml` : le catalogue des cours, auxquels les grilles renvoient par numéro.
- `data/cours-service.yaml`, `data/laboratoires.yaml`, `data/faq.yaml`, `data/bot.yaml` (le bot d'orientation), `data/logiciels.yaml`.
- `data/photos/` : les photos des profs.

### Profs actifs

Calculé (`web/lib/actif.ts`) d'après les cours et la session de la fiche, avec 30 jours de grâce en début de session.
Le champ `actif: true` (coordination sans cours) ou `actif: false` (congé, départ) de la fiche l'emporte sur le calcul.

### Calendrier scolaire

`data/calendrier-scolaire.yaml` est généré à partir du PDF officiel du cégep : `npm run calendrier`.
Le script est aussi lancé à chaque déploiement et chaque matin de semaine ; si le site du cégep est en panne
ou si le PDF change de forme, le calendrier du dépôt est gardé.

### Horaire des laboratoires

`data/laboratoires.yaml` vient du PDF « Horaire du local » publié dans le dépôt 420-SN1 (des images : à recopier à chaque session).
À chaque session, il sert aussi à remplir les cours des fiches de profs (`prerempli: true` jusqu'à ce que le prof confirme) :
voir [data/changement-de-session.md](../data/changement-de-session.md).
Il alimente le bandeau du bas, la page `/locaux/` et une page par local (`/locaux/D-0003/`).

Les logos de l'en-tête sont dans `web/public/images/liens/`.

## Liens directs pour les sites de cours

`/<prof>/horaire/` et `/<prof>/calendrier/`, avec `?cours=420-5N6-EM` au besoin.

## Données pour les sites de cours

`/donnees/cours/<numéro>.json` (ex. https://info.cegepmontpetit.ca/donnees/cours/420-5N6-EM.json) est écrit à chaque build
(`web/app/donnees/cours/[fichier]/route.ts`), aussi sous les anciens numéros. Le site de cours n'a plus à recopier
horaires et dates : il garde la matière de chaque séance, par numéro.

Pour chaque groupe d'un prof actif : `prof`, `groupe`, `session`, `plages` (l'horaire de la semaine), `rencontres`,
`evenements` (remises, examens... de la fiche pour ce cours) et `agenda` (l'adresse de l'abonnement .ics du groupe, ou `null`).

`profs` donne la semaine complète de chaque prof du cours (ses autres cours, dispos, centre d'aide),
`{ nom, bureau, horaire: { debut, fin, plages }, page }`, pour l'onglet Horaire des sites de cours.
Les adresses (`agenda`, `page`) suivent le site : les sites de cours ne codent en dur que celle du fichier.

Les rencontres sont celles de l'agenda du téléphone (`rencontresDuGroupe` dans `web/lib/mes-cours.ts`) : le calendrier scolaire et le
`calendrier:` de la fiche, `{ numero, date, debut, fin, local, statut, note }`.

- `statut` vaut `prevue`, `annulee` (absence), `deplacee` (à sa date prévue, `note` : « déplacé au jeudi 10 décembre »)
  ou `reprise` (le cours déplacé, à sa nouvelle date).
- `numero` : le rang parmi les rencontres qui ont lieu (`prevue` et `reprise`) ; une rencontre annulée ou déplacée n'en a pas,
  la matière passe à la suivante.

Lecture depuis Docusaurus (même domaine, info.cegepmontpetit.ca ; GitHub Pages permet aussi la lecture d'ailleurs, ex. en local) :

```jsx
import { useEffect, useState } from "react";

export function useRencontres(no, groupe) {
  const [rencontres, setRencontres] = useState([]);
  useEffect(() => {
    fetch(`https://info.cegepmontpetit.ca/donnees/cours/${no}.json`)
      .then((r) => r.json())
      .then((c) => setRencontres(c.groupes.find((g) => g.groupe === groupe)?.rencontres ?? []));
  }, [no, groupe]);
  return rencontres; // rencontres.find((r) => r.numero === 5)?.date : la date de la séance 5
}
```

## Anciennes adresses

Les anciennes adresses (`/react/...` et celles du site Angular : `/prof/<id>`, `/dec/p`, `/goodies`...)
sont redirigées par la page 404 : `web/lib/redirections.ts`. Les agendas `/react/agenda/*.ics` (abonnements des téléphones)
et les `/react/donnees/cours/*.json` (sites de cours) sont recopiés tels quels : `web/scripts/anciennes-adresses.ts`.

## Déploiement

GitHub Actions (`.github/workflows/deploy.yml`) construit et publie le site sur GitHub Pages à chaque push sur `main`
et chaque matin de semaine. Le lint et les tests tournent en parallèle sur une autre machine : le site n'est publié que si tout réussit.
Chaque pull request passe les mêmes vérifications, sans publication (`test-deploy.yml`).
