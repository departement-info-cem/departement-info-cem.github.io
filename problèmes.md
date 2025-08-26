# Tu as un problème pendant tes études

Cette page sert à te guider vers les bonnes resources si ça ne va pas pendant ton DEC.

## Problème personnel, santé physique ou mentale, problème d'argent

Si ce n'est pas facile d'en parler, n'hésite pas à approcher le prof ou l'employé du collègue avec lequel tu es le plus à l'aise.

Si tu as une situation et que tu es fatigué de répéter, adresse toi aux profs PAIRE. Avec ton accord, ils pourront partager
l'information avec toutes les personnes qui peuvent t'aider.

**EN BREF :** _Profs PAIRE, personne avec qui tu es à l'aise_

## Problème avec un professeur

Si tu as un conflit / problème avec un professeur, nous te recommandons les étapes suivantes:

- Essaie d'en parler avec le/la prof
- Si cela ne résoud pas le problème, si tu ne souhaites pas en parler avec le prof, tu peux ensuite t'adresser à la coordination du département
- Si le problème est avec la coordination ou que tu n'es pas à l'aise, tu peux en parler avec un enseignant de ton choix ou alors à la direction des études.
- Dans tous les cas, ce que tu dis ne sera pas communiqué au prof, sauf si tu es d'accord et pour régler la situation

**EN BREF :** _Prof, coordo ou direction_

### Retard ou absence d'un prof

Si un professeur est absent ou en retard dans un cours, que ça se répète, que ce n'est pas affiché sur Omnivox ou les écrans au collège,
passe prévenir la coordination. Tu peux te déplacer à leur bureau ou juste leur écrire sur Teams.

### Retard de correction

Nous devons te remettre ta copie avec des commentaires et des retours (une retroaction) dans les 3 semaines après la remise du travail.

Si ce n'est pas le cas, n'hésite pas à le mentionner ... au prof ou à la coordination.

### Plaintes

Tu peux produire une plainte concernant un professeur auprès de la direction des études (notre "boss"). Si tu as besoin d'aide dans le processus, n'hésite pas à en parler avec la coordination.

### Comment nous rejoindre

Si tu souhaites parler en privé, de manière confidentiel, nous te recommandons de rencontrer la personne (prof ou coordonateur) à son
bureau et d'expliquer la situation de vive voix.

Si c'est approprié tu peux aussi communiquer par écrit sur Teams.

## Objet perdu

La plupart des objets perdus sont rapportés à la sécurité (l'aquarium au bout du couloir de l'aile D).

Il y a aussi parfois des étudiants qui rapportent les clés USB ou les disques externes au bureau des coordonateurs. Passe voir.

## Problème technique

Si tu as un problème avec ton code, ton infrastructure etc. ta resource principale est ton prof.

Ceci dit tu peux également aller au centre d'aide pour demander à un autre prof.

Si tu as un problème de débogage, regarde la page suivante:
[débogage](debogage.md)

## Résumé et schéma visuel

```mermaid
flowchart TB
    PB[Problème avec ...] --> |un prof| Prof[Problème avec un prof]
    PB -->|la coordination| Coordo[Problème avec la coordination]
    Coordo -->|ok pour parler avec| ParleCoordo{Je parle avec coordo}
    Coordo -->|difficile en parler| ParleConfiance{Je parle avec prof de confiance}
    Prof -->|ok pour parler avec| ParleProf{Je parle avec prof}
    ParleCoordo -->|c'est réglé| Ok((Mon problème est résolu))
    ParlePAIRE -->|c'est réglé| Ok
    ParleProf -->|c'est réglé| Ok
    ParleProf -->|pas réglé| ParleCoordo
    ParleDirection --> |pas réglé| Plainte((Je commence une plainte))
    Plainte --> ParleDirection
    ParleCoordo -->|pas réglé| ParleDirection
    ParleCoordo -->|pas réglé| ParleConfiance
    PB -->|la vie| Vie[Problème santé argent, la vie]
    Vie -->|ok avec prof PAIRE| ParlePAIRE{Je parle à PAIRE}
    Vie -->|pas sûr avec prof PAIRE| ParleConfiance
    ParleConfiance -->|c'est réglé| Ok
    Prof -->|ok ni avec le prof ni le coordo| ParleConfiance
    Prof -->|mon problème est avec le coordo| ParleDirection{Parle à la direction}
    style PB stroke:#d13,stroke-width:8px
    style Ok stroke:#3d6,stroke-width:8px
    style Plainte stroke:#d33,stroke-width:8px

```
