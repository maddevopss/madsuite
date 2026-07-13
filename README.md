# MADSuite

MADSuite est un écosystème de gestion pour travailleurs autonomes et petites équipes : clients, projets, suivi du temps, facturation, rapports et assistance contextuelle.

Ce dépôt est le **point d’orientation public** de l’écosystème. Le code d’exécution est maintenu dans des dépôts spécialisés.

## Dépôts actifs

| Dépôt | Responsabilité |
|---|---|
| [`maddevopss/madsuite-frontend`](https://github.com/maddevopss/madsuite-frontend) | Application web React/Vite |
| [`maddevopss/madsuite-backend`](https://github.com/maddevopss/madsuite-backend) | API, logique métier, sécurité multi-tenant et données |
| [`maddevopss/desktop-agent`](https://github.com/maddevopss/desktop-agent) | Agent Electron local |
| [`maddevopss/e2e`](https://github.com/maddevopss/e2e) | Validation Playwright inter-repos |

La gouvernance, les décisions d’architecture et les standards MADPROOF sont maintenus dans le dépôt privé gardien `bleeband/SYSTEME_MAD`.

## Architecture

```text
madsuite-frontend
        │
        ├── HTTP / WebSocket
        ▼
madsuite-backend ─── PostgreSQL / services externes
        ▲
        │
desktop-agent

          e2e
           │
           └── valide les parcours distribués
```

## État du produit

MADSuite est en développement actif. Les dépôts applicatifs possèdent leurs propres instructions d’installation, variables d’environnement, commandes de test et pipelines CI.

## Démarrage développeur

Clonez seulement les dépôts nécessaires ou placez les quatre dépôts actifs côte à côte pour les scénarios distribués :

```text
workspace/
├── madsuite-frontend/
├── madsuite-backend/
├── desktop-agent/
└── e2e/
```

Consultez ensuite le `README.md` de chaque dépôt. Ne suivez plus les anciennes instructions `ChronoMAD` : ce nom et l’ancien dépôt monolithique sont obsolètes.

## Principes

- sécurité multi-tenant par défaut;
- décisions et affirmations traçables;
- aucune promesse médicale ou diagnostique;
- collecte minimale et traitement local privilégié pour les fonctions contextuelles;
- petites PR, tests ciblés et guards contractuels.

## Contribution

Avant une PR :

1. exécuter la commande `check:*` du dépôt concerné;
2. documenter les impacts de déploiement et de sécurité;
3. ajouter ou mettre à jour les tests pertinents;
4. garder une seule responsabilité principale par PR.

## Licence

Chaque dépôt applicatif définit sa propre licence dans ses fichiers de projet. Aucune licence globale différente ne doit être déduite de ce méta-dépôt.

## Auteur

Marc-André Dufour — MAD DevOps
