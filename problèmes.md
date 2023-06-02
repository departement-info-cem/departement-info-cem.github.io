# Tu as un problème au département

Ceci est la page avec les ressources.

## Problème personnel, santé physique ou mentale

## Problème d'argent

## Problème avec un professeur



## Problème avec mon code
Si tu as un problème avec ton code, regarde la page suivante:
[débogage](debogage.md)

## Résumé et schéma visuel
```mermaid
flowchart TD
    A[Problème] --> B{Avec quoi?}
    B -->|Prof| C[OK]
    B -->|Santé| D[OK]
    B -->|Mon code| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
```
