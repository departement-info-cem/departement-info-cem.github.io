# Changement de session : horaires des profs et des labos

Une fois par session, quand le cégep publie l'horaire des locaux de la nouvelle session (ex. passage de A2026 à H2027).
Le site calcule le reste tout seul : profs actifs, séances datées, agenda des étudiants, JSON des sites de cours, choix périmés dans « Mes cours ».

## Avant de commencer

- **Le moment :** après la `fin` de la session qui se termine (`data/calendrier-scolaire.yaml`). Plus tôt, les pages des profs montreraient le nouvel horaire pendant que l'ancien a encore cours, le bandeau perdrait les dispos de la session en cours et la page Locaux dirait l'horaire des locaux incomplet. Si l'utilisateur veut le faire plus tôt, rappelle-le-lui une fois, puis fais comme il dit.
- **La nouvelle session existe** dans `sessions:` de `data/calendrier-scolaire.yaml`. Sinon, lance `npm run calendrier` dans `web/`. Si elle n'y est toujours pas, le cégep n'a pas encore publié son calendrier : arrête-toi et dis-le.
- **Le PDF « Horaire du local »** (rapport RPHOR020) de la nouvelle session : l'utilisateur te le donne, ou il est dans le dépôt du cours 420-SN1 :
  `gh api repos/departement-info-cem/420-SN1/contents/web/static/pdf/horairelabos.pdf -H "Accept: application/vnd.github.raw" > horairelabos.pdf`.
  La session est écrite en haut à droite de chaque page : vérifie que c'est la bonne.
- Travaille sur une branche.

## 1. Recopier le PDF dans `data/laboratoires.yaml`

Le PDF ne contient que des images, une page par local : `pdftoppm -r 110 -png horairelabos.pdf page`, puis lis chaque image.
Un bloc donne le cours abrégé, son numéro, le groupe (`g.1030`), le nombre d'étudiants et le prof (« Marsolais, D »).
Les règles de transcription (cours de 5 h en cadre rouge, `horsCalendrier`, `complet`) sont en tête de `laboratoires.yaml`.

- Remplace les `occupations` de chaque local par les blocs de sa page, aux heures exactes du PDF (08:10, 12:10…).
- Un local absent du fichier : ajoute-le, avec `postes` (« Nombre de places idéal ») et les champs des autres locaux.
- Mets la nouvelle session dans `session:` de chaque local, et la session et la date du PDF (en bas à gauche) dans le commentaire « Source » en tête du fichier.
- Note au passage la liste prof → blocs : elle sert à l'étape 2.

**Fini quand :** pour chaque page, le nombre de blocs égale le nombre d'occupations du local, et chaque local porte la nouvelle session.

## 2. Mettre à jour la fiche de chaque prof du PDF

Retrouve chaque prof du PDF par son `nom:` dans `data/profs/*.yaml` (« Marsolais, D » → `nom: "David Marsolais"`). Dans sa fiche :

- `session:` la nouvelle session.
- `cours:` les numéros de ses blocs, plus les cours hors labo que l'utilisateur t'indique.
- `horaire.plages` :
  - `cours` : remplace-les par ses blocs du PDF, `{ jour, debut, fin, type: cours, cours, groupe, local }`, local écrit comme dans `laboratoires.yaml` (`D-0003`), mêmes heures. La grille de l'horaire commence quand même à 8 h : laisse `horaire.debut` à `"08:00"`.
  - Les blocs `horsCalendrier` (AEC du soir) restent seulement dans `laboratoires.yaml` : l'horaire d'une fiche suit le calendrier scolaire (JR, relâche), que l'AEC ne suit pas. Mets leur numéro dans `cours:`, sans plage.
  - `dispo` et `centre-aide` : retire celles de la session passée. Le prof a changé d'horaire, elles seraient fausses : mieux vaut rien. Ajoute seulement celles qu'il a envoyées pour la nouvelle session.
  - `reunion` et `autre` : garde celles que l'utilisateur confirme pour la nouvelle session.
- `horaire.prerempli: true` : sa page affiche l'avis « Cours tirés de l'horaire officiel des laboratoires… ». Si la fiche a le commentaire « PRÉREMPLI … (PDF RPHOR020 du …) », mets-y la date du nouveau PDF.
- `calendrier:` retire les dates déjà passées et garde les autres (une remise d'AEC peut tomber entre deux sessions) ; s'il n'en reste aucune, écris `calendrier: []`.
- Garde `aide:` (les cours où il peut aider ne dépendent pas de la session) et les commentaires de la fiche.

**Fini quand :** chaque bloc du PDF dont le prof a une fiche se trouve dans cette fiche, et `npm run valider` ne donne aucun avertissement « absent de l'horaire » ni « hors de la réservation ».

## 3. Les cas à part : les lister pour l'utilisateur

Ces cas demandent une information que le PDF n'a pas : rassemble-les, et agis sur la réponse de l'utilisateur.

- **Prof avec une fiche, absent du PDF** (cours hors labo, congé, départ) : laisse sa fiche telle quelle. Sans mise à jour, elle quitte la liste des profs 30 jours après le début de la session (`web/lib/actif.ts`).
- **Prof du PDF dont la fiche dit `actif: false`** (retour de congé) : mets sa fiche à jour comme les autres, et demande à l'utilisateur si on retire `actif: false`.
- **Nom du PDF sans fiche** : crée sa fiche à partir de `data/profs/_modele.yaml` quand l'utilisateur te donne son courriel.
- **Cours absent de `data/cours.yaml`** (avertissement de `valider`) : ajoute-le s'il est dans une grille de `data/programmes/`, sinon signale-le.
- **`actif: true`** (coordination sans cours) et **`actif: false`** (congé, départ) : seulement sur la parole de l'utilisateur.

## 4. Les autres dates de la session

- `data/profs/_modele.yaml` : la nouvelle session dans `session:`, et des dates d'exemple qui tombent dedans.
- `web/lib/raccourcis.ts` : `PORTES_OUVERTES` et `ETUDIANT_D_UN_JOUR`. Une date passée disparaît seule de l'accueil ; prends les prochaines dates sur les pages du cégep liées dans `web/app/page.tsx`, ou demande-les.

## 5. Vérifier et rendre compte

- Dans `web/` : `npm run valider` (0 erreur, aucun avertissement de concordance), `npm test`, `npm run lint`.
- `npm run dev` (relance-le s'il tournait déjà : il garde les données en mémoire) : ouvre la page d'un prof de l'étape 2 (l'avis de préremplissage, ses cours aux bonnes heures) et celle d'un local, `/locaux/D-0003/`.
- Rends compte à l'utilisateur : les fiches mises à jour, les cas de l'étape 3, les fiches en attente des dispos du prof (celles qui ont `prerempli: true`).
- La PR ne change que des données : pas de captures avant / après.

## Pendant la session

Un prof envoie ses dispos, son centre d'aide ou une correction : mets-les dans sa fiche, et enlève `prerempli: true` quand il a confirmé son horaire.
