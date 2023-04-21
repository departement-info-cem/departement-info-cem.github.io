# Bonnes pratiques de débogage

## Points d'arrêts,  règles de base
Le point d'arrêt te permettent d'arrêter le temps, de regarder ce que valent les variables et enfin de comprendre 
pourquoi l'ordinateur ne fait pas ce que tu penses qu'il doit faire.

Quelques règles générales
- tu dois placer un breakpoint sur une ligne avec une instructions, pas sur une ligne vide ou un commentaire par exemple
- tu devrais laisser les points d'arrêts jusqu'à avoir résolu le problème, si tu as besoin d'aide, le placement de tes breakpoints aidera la personne à comprendre où tu es rendu
- tes points d'arrêt te servent à identifier la ligne de code où ce que tu as écrit ne fait pas ce que tu penses, on cherche donc la ou les lignes de code fautives


## Débogage quand ça crash et que j'ai une trace (stacktrace ou trace de la pile d'appels)

Quand une application ou un serveur plante, juste avant de mourir, il donne habituellement une trace de la pile d'appels au moment du drame. 

On va voir comment lire ce message et où placer ton point d'arrêt pour tenter d'élucider les causes
```
Exemple de stacktrace Java
```

```
Exemple de stacktrace C#
```

## Débogage pour un appel à un serveur / pour un appel asynchrone
