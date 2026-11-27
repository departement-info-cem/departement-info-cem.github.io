# Site du département d'informatique

Ce fichier sert à expliquer comment modifier l'appli ou le contenu du site du département d'informatique du collège Edouard Montpetit.

## Nouveau site React (`web/`, publié sous /react/)

- Données en YAML : `data/profs/<courriel>.yaml` (une fiche par prof), `data/programmes/`, `data/cours.yaml`,
  `data/cours-service.yaml`, `data/laboratoires.yaml`, `data/faq.yaml`, `data/bot.yaml`, `data/logiciels.yaml`.
- Mode d'emploi pour les profs : https://info.cegepmontpetit.ca/react/modifier-mon-profil
- Profs actifs : calculé (`web/lib/actif.ts`) d'après les cours et la session de la fiche, avec 30 jours de grâce en début de session.
  Le champ `actif: true` (coordination sans cours) ou `actif: false` (congé, départ) de la fiche l'emporte sur le calcul.
- Développement : `cd web && npm ci && npm run dev`, puis http://localhost:3000/react
- `data/calendrier-scolaire.yaml` est généré à partir du PDF officiel du cégep : `npm run calendrier`
  (aussi lancé à chaque déploiement et chaque matin de semaine ; `-- --verifier` dit seulement ce qui a changé).
- `data/laboratoires.yaml` vient du PDF « Horaire du local » publié dans le dépôt 420-SN1 (des images : à recopier à chaque session).
  Il a servi à préremplir les fiches de profs (`prerempli: true`, à enlever une fois vérifié). Il alimente le bandeau du bas, la page `/react/maintenant/` et une page par local (`/react/locaux/D-0003/`). Les logos de l'en-tête sont dans `web/public/images/liens/`.
- Liens directs pour les sites de cours : `/react/<prof>/horaire/` et `/react/<prof>/calendrier/`, avec `?cours=420-5N6-EM` au besoin.
- Données pour les sites de cours : `/react/donnees/cours/<numéro>.json` (ex. https://info.cegepmontpetit.ca/react/donnees/cours/420-5N6-EM.json),
  écrit à chaque build (`web/app/donnees/cours/[fichier]/route.ts`), aussi sous les anciens numéros. Le site de cours n'a plus à recopier
  horaires et dates : il garde la matière de chaque séance, par numéro. Pour chaque groupe d'un prof actif : `prof`, `groupe`, `session`,
  `plages` (l'horaire de la semaine), `seances` et `evenements` (remises, examens... de la fiche pour ce cours).
  Les séances suivent le calendrier scolaire et le `calendrier:` de la fiche : `{ n, date, debut, fin, local, statut }`, où `statut`
  vaut `normal`, `annulé` (absence : pas de `n`, la matière passe à la séance suivante) ou `déplacé` (à sa nouvelle date, `remplace` : la date prévue).
  Lecture depuis Docusaurus (même domaine, info.cegepmontpetit.ca ; GitHub Pages permet aussi la lecture d'ailleurs, ex. en local) :

  ```jsx
  import { useEffect, useState } from "react";

  export function useSeances(no, groupe) {
    const [seances, setSeances] = useState([]);
    useEffect(() => {
      fetch(`https://info.cegepmontpetit.ca/react/donnees/cours/${no}.json`)
        .then((r) => r.json())
        .then((c) => setSeances(c.groupes.find((g) => g.groupe === groupe)?.seances ?? []));
    }, [no, groupe]);
    return seances; // seances.find((s) => s.n === 5)?.date : la date de la séance 5
  }
  ```
- Vérifications : `npm run valider`, `npm run lint`, `npm test`, `npm run build`
- Tant que les deux sites cohabitent, le site Angular lit encore les fichiers JSON de `data/` :
  un changement doit être fait aux deux endroits pour apparaître sur les deux sites.

## Changer du contenu (ancien site Angular)

Le contenu du site est fourni par plusieurs fichiers JSON que vous pouvez modifier sans
toucher à l'application du site.

On peut même les modifier directement dans l'interface web de github.
Voici un exemple pour modifier la liste des profs:

- ouvrir un navigateur sur https://github.com/departement-info-cem/departement-info-cem.github.io/tree/master/data
- si vous n'avez pas les droits, les demander à un prof qui les a (coordo ...)
- sélectionner le fichier profs.json
- sur la droite, vous trouverez une icône de crayon pour éditer
- modifier le fichier en faisant attention SVP
- sauvegarder en décrivant la modification dans votre commit

## Modifier l'application

Le site est une application Angular. Merci de ne pas y toucher si vous n'êtes pas familier ou alors de travailler sur un fork du repo.

### Créer une nouvelle page

executer `ng generate component component-name` pour générer une nouvelle page.

Ensuite, il faut l'ajouter dans les routes.

## Déployer l'application

L'application est présentement automatiquement déployée à l'aide de Github Actions, il n'y a donc rien à faire pour déployer l'application.
