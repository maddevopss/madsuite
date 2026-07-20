# Portée d’orchestration MADSuite

## Décision

Ce dépôt est le point d’orientation public et l’orchestrateur opérationnel léger de l’écosystème MADSuite.

Il ne doit pas redevenir un monorepo applicatif et ne doit pas contenir de copie du frontend, du backend, des tests E2E ou du Desktop Agent.

## Contenu autorisé

- documentation publique d’orientation;
- scripts de démarrage multi-dépôts;
- vérification des versions et des ports;
- modèles de configuration sans secret;
- orchestration locale et staging;
- commandes de validation distribuée;
- liens vers les dépôts spécialisés.

## Contenu interdit

- copie du code d’exécution d’un dépôt spécialisé;
- logique métier backend;
- composants frontend actifs;
- fichiers de session ou d’environnement réels;
- secrets, certificats ou données de production;
- duplication des fondations et standards de `bleeband/SYSTEME_MAD`.

## Disposition locale attendue

```text
workspace/
├── madsuite/
├── madsuite-frontend/
├── madsuite-backend/
├── e2e/
└── desktop-agent/
```

Les scripts d’orchestration peuvent référencer ces dépôts voisins, mais ils ne doivent pas supposer un chemin absolu propre à une machine.

## Validation locale reportée

La future commande de démarrage unique devra être validée localement avant d’être déclarée officielle :

- Windows PowerShell en priorité;
- shell compatible lorsque possible;
- contrôle Node, npm et PostgreSQL;
- validation des fichiers `.env` requis sans afficher les valeurs;
- démarrage PostgreSQL, backend et frontend;
- migrations et readiness;
- lancement E2E facultatif;
- arrêt propre des processus.

## Source de vérité

La gouvernance, les décisions d’architecture et les critères MADPROOF demeurent dans `bleeband/SYSTEME_MAD`.
