# Les consignes pour utiliser git au département

## Créer un dépôt

Le plus simple sera de toujours créer ton repo sur github.com:
1. va sur github.com
2. rentre tes infos de connexion
3. une fois sur la page d'accueil, tu as un bouton "+" en haut à droite
4. choisis new repository
5. quand tu remplis ton formulaire:
  - la plupart du temps, mets ton repo privé (private) pour éviter tout risque de plagiat
  - ajoute le fichier README, cela va créer un premier commit dans ton repo
  - si tu penses y ajouter plein de projets et des fichiers différents, n'ajoute pas de .gitignore

Nous te conseillons d'éviter de créer un repo depuis ton environnement de développement ou ton client git.

## Quand créer un repo

- si ton prof utilise classroom pour les remises, il va t'envoyer un lien et tu n'auras pas à créer le repo
- nous te conseillons de te faire un repo pour chaque cours pour y garder tes exercices et tes notes

## Modifier le .gitignore

Un fichier .gitignore est simplement un fichier texte, il suffit de l'ouvrir avec un éditeur de texte (VScode, NotePad++ etc.)

Le .gitignore indique à git que certains fichiers n'ont aucun intérêt. La plupart du temps il s'agit de:
- fichiers compilés: ce qui a de la valeur c'est ton code source mais avant d'exécuter, il faut souvent produire des fichiers qui n'ont pas besoin d'être dans le repo:
  - le dossier build pour un projet Android ou kotlin
  - le dossier target pour un projet C#
- librairies: ton projet télécharge souvent des librairies pour fonctionner. Ici encore pas besoin de les ajouter au repo

Dans ton repo, chaque dossier peut avoir son propre .gitignore. Comme tu es débutant:
- si ton IDE (VS code, Visual Studio, Android Studio etc.) a créé un .gitignore au moment de la création du projet, on t'encourage à le lire et poser des questions à ton prof sur comment ça marche
- s'il n'y a pas de .gitignore et que tu vois plein de fichiers bizarres / inconnus dans tes commits, demande à ton prof s'il a un .gitignore de référence ou encore à quoi sert chaque fichier.

## Cloner ton repo

### Github Desktop

### En ligne de commandes

## Faire un commit:

Un commit, c'est un ensemble de modifications qui augmentent la valeur de ton repo:
```
Règle du pouce : un commit dès que tu as gagné un point ou plus dans le barème de ton travail
```

On va donner un titre à ton commit. Il faut que ça t'aide à retracer ce que tu as fait en étant court. 

La description est là si tu veux en indiquer plus

Exemple de commit simple:
```
titre : FCT Interface écran de connexion HTML et CSS fait
description : aucune
```

Exemple de commit complexe:
```
titre : FCT sauvegarde de configuration dans fichier
description : J'ai utilisé la librairie Guava pour simplifier la sauvegarde.
Le format de sauvegarde est tel que décrit à l'URL https://exemple.com/format
```

IMPORTANT IMPORTANT IMPORTANT : commit push, commit push, commit push
Dès que tu fais un commit au collège, tu dois le pousser sur ton repo distant. Il s'agit de ne pas perdre ton travail.

Pour les 10-20 premiers commits que tu produiras, n'hésite pas à vérifier sur github.com que tu vois ton repo, ton dernier commit et le code que tu viens de produire

