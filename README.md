# Site du département d'informatique

Ce fichier sert à expliquer comment modifier l'appli ou le contenu du site du département d'informatique du collège Edouard Montpetit.

## Site du département (`web/`, Next.js, publié à la racine)

- Données en YAML : `data/profs/<courriel>.yaml` (une fiche par prof), `data/programmes/`, `data/cours.yaml`,
  `data/cours-service.yaml`, `data/laboratoires.yaml`, `data/faq.yaml`, `data/bot.yaml`, `data/logiciels.yaml`.
- Mode d'emploi pour les profs : https://info.cegepmontpetit.ca/modifier-mon-profil
- Profs actifs : calculé (`web/lib/actif.ts`) d'après les cours et la session de la fiche, avec 30 jours de grâce en début de session.
  Le champ `actif: true` (coordination sans cours) ou `actif: false` (congé, départ) de la fiche l'emporte sur le calcul.
- Développement : `cd web && npm ci && npm run dev`, puis http://localhost:3000
- `data/calendrier-scolaire.yaml` est généré à partir du PDF officiel du cégep : `npm run calendrier`
  (aussi lancé à chaque déploiement et chaque matin de semaine ; `-- --verifier` dit seulement ce qui a changé).
- `data/laboratoires.yaml` vient du PDF « Horaire du local » publié dans le dépôt 420-SN1 (des images : à recopier à chaque session).
  À chaque session, il sert aussi à remplir les cours des fiches de profs (`prerempli: true` jusqu'à ce que le prof confirme) :
  voir [data/changement-de-session.md](data/changement-de-session.md). Il alimente le bandeau du bas, la page `/locaux/` et une page par local (`/locaux/D-0003/`). Les logos de l'en-tête sont dans `web/public/images/liens/`.
- Liens directs pour les sites de cours : `/<prof>/horaire/` et `/<prof>/calendrier/`, avec `?cours=420-5N6-EM` au besoin.
- Raccourcis vers les sites des cours : `/1P6/`, `/4W6/`... Une page par cours qui a une `url` dans `data/cours.yaml`
  (et une par ancien numéro en `alias`), qui redirige vers ce site (`web/lib/raccourcis-cours.ts`).
  Les majuscules ne comptent pas : une page pour `1P6` et une pour `1p6`, et la page 404 rattrape les autres casses (`Sn1`).
  Aucune page ne redirige vers elle-même (`/1P6/` est l'adresse même du site du 1P6 : seule `/1p6/` est générée),
  et un sigle ne peut pas prendre l'adresse d'un prof ou d'une page.
- Données pour les sites de cours : `/donnees/cours/<numéro>.json` (ex. https://info.cegepmontpetit.ca/donnees/cours/420-5N6-EM.json),
  écrit à chaque build (`web/app/donnees/cours/[fichier]/route.ts`), aussi sous les anciens numéros. Le site de cours n'a plus à recopier
  horaires et dates : il garde la matière de chaque séance, par numéro. Pour chaque groupe d'un prof actif : `prof`, `groupe`, `session`,
  `plages` (l'horaire de la semaine), `rencontres`, `evenements` (remises, examens... de la fiche pour ce cours) et `agenda`
  (l'adresse de l'abonnement .ics du groupe, ou `null`). `profs` donne la semaine complète de chaque prof du cours (ses autres cours,
  dispos, centre d'aide), `{ nom, bureau, horaire: { debut, fin, plages }, page }`, pour l'onglet Horaire des sites de cours.
  Les adresses (`agenda`, `page`) suivent le site : les sites de cours ne codent en dur que celle du fichier.
  Les rencontres sont celles de l'agenda du téléphone (`rencontresDuGroupe` dans `web/lib/mes-cours.ts`) : le calendrier scolaire et le
  `calendrier:` de la fiche, `{ numero, date, debut, fin, local, statut, note }`. `statut` vaut `prevue`, `annulee` (absence), `deplacee`
  (à sa date prévue, `note` : « déplacé au jeudi 10 décembre ») ou `reprise` (le cours déplacé, à sa nouvelle date).
  `numero` : le rang parmi les rencontres qui ont lieu (`prevue` et `reprise`) ; une rencontre annulée ou déplacée n'en a pas, la matière passe à la suivante.
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
- Vérifications : `npm run valider`, `npm run lint`, `npm test`, `npm run build`
- Les anciennes adresses (`/react/...` et celles du site Angular : `/prof/<id>`, `/dec/p`, `/goodies`...)
  sont redirigées par la page 404 : `web/lib/redirections.ts`. Les agendas `/react/agenda/*.ics` (abonnements des téléphones)
  et les `/react/donnees/cours/*.json` (sites de cours) sont recopiés tels quels : `web/scripts/anciennes-adresses.ts`.
- L'ancien site Angular (`angular/` et les fichiers JSON de `data/`) n'est plus déployé ; il sera supprimé.

## Ancien site Angular (plus déployé)

### Changer du contenu

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
