# Site du département d'informatique

Ce fichier sert à expliquer comment modifier l'appli ou le contenu du site du département d'informatique du collège Edouard Montpetit.

## Changer du contenu

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
