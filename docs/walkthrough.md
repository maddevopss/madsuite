# Walkthrough: Cognitive History Engine (Sprint 1)

Ce document résume le travail effectué pour le premier sprint de la fonctionnalité **Cognitive History Engine**. 
MADSuite dispose désormais de la mémoire nécessaire pour suivre l'historique cognitif de l'utilisateur.

## Ce qui a été accompli

### 1. Structure de la Base de Données
Nous avons défini l'architecture fondamentale dans PostgreSQL :
- **`cognitive_state_events`** : Enregistre avec précision chaque phase de travail (début, fin, état exact comme `deep_focus` ou `friction`). Cette table a été conçue pour conserver l'historique brut sans aucune altération.
- **`daily_cognitive_metrics`** : Une table pré-agrégée permettant de stocker les temps totaux quotidiens et d'identifier, par exemple, la "Session la plus longue" et le "Projet dominant".
- *Fichiers modifiés :* 
  - `backend/prisma/schema.prisma`
  - `backend/db/migrations/044_cognitive_history.sql` (Migration pure SQL exécutée et validée)

### 2. L'API d'Événements Cognitifs
Nous avons créé un pipeline permettant au front-end d'envoyer la donnée brute au backend de façon idempotente :
- **Logique intelligente :** L'API `POST /api/cognitive/events` clôture automatiquement le dernier état (en calculant sa durée exacte) dès qu'un nouvel état est reçu ou qu'un changement de projet est détecté.
- *Fichiers créés/modifiés :*
  - `backend/src/controllers/cognitive.controller.js`
  - `backend/src/routes/cognitive.routes.js`
  - `backend/src/app.js`

### 3. Le Moteur d'Agrégation
Afin de transformer le flux brut en données exploitables pour le futur *Patterns Engine* (Sprint 2) sans surcharger la BD pendant la journée, nous avons implémenté un traitement par lots :
- **Cron Job :** Chaque nuit à 2h00 du matin, le `cognitiveAggregator` compile les logs de la journée précédente.
- **Analyse Déterministe :** Il calcule les temps cumulés pour chaque état (Flow, Focus, Friction, Fatigue) et identifie le projet ayant reçu le plus de `deep_focus` de manière 100% déterministe (sans IA).
- *Fichiers créés/modifiés :*
  - `backend/src/jobs/cognitiveAggregator.js`
  - `backend/src/jobs/scheduler.js`

### 4. Tracking Transparent
Le `CognitiveStateContext` du dashboard a été mis à jour pour relier le moteur en temps réel (V1) à l'historique :
- Une simple requête HTTP asynchrone est envoyée à chaque bascule d'état. L'utilisateur ne ressent aucune latence, mais le système enregistre désormais sa session pour la postérité.
- *Fichiers modifiés :*
  - `frontend/src/hooks/CognitiveStateContext.jsx`

## Prochaine étape
L'infrastructure (Sprint 1) est opérationnelle. La donnée va maintenant s'accumuler silencieusement.
La suite consistera à analyser cet historique (7, 14, 30 jours) avec le **Patterns Engine (Sprint 2)** pour extraire vos meilleures périodes de productivité.

---

# Walkthrough: Cognitive Timeline (Sprint 2)

L'objectif de ce deuxième sprint était de rendre l'historique cognitif visible sans transformer MADSuite en une usine à gaz analytique. L'interface doit permettre de comprendre l'état de la journée en 10 secondes.

## Ce qui a été accompli

### 1. Routes Backend (Data Layer)
Nous avons ajouté des routes très ciblées pour exposer l'historique :
- `GET /api/cognitive/timeline` : Renvoie les segments cognitifs du jour (chronologiques) depuis la base de données brute `cognitive_state_events`.
- `GET /api/cognitive/insight` : Renvoie les métriques compilées (durées totales, session la plus longue, projet dominant) depuis `daily_cognitive_metrics`.

### 2. Composants d'Interface (Presentation Layer)
- **`CognitiveTimeline.jsx`** : Construit une représentation temporelle textuelle et visuelle (`09:18 → 10:42`) avec le code couleur strict et iconographique de chaque état (🟢 Flow, 🔵 Session profonde, 🟡 Friction, 🟠 Fatigue). Pas de graphiques, juste les faits.
- **`DailyCognitiveInsight.jsx`** : Affiche les métriques quotidiennes sous un format simple ("🔵 Session profonde totale : 2h14"), respectant les règles d'absence de KPI stressant ou de prédictions.

### 3. Réorganisation du Dashboard
L'expérience utilisateur (UX) du Dashboard a été drastiquement simplifiée pour refléter la nouvelle philosophie "Cognitive Operating System".
La hiérarchie visuelle est désormais :
1. **L'État Actuel (V1)**
2. **La Timeline (Ce qu'il s'est passé)**
3. **L'Insight Quotidien (Résumé de la journée)**
4. **Le Timer Actif et les Projets**
5. **Les Statistiques traditionnelles (reléguées plus bas)**

Cette architecture garantit que l'information la plus vitale — "Qu'est-ce qui s'est passé dans ma tête aujourd'hui ?" — saute aux yeux immédiatement.
---

# Walkthrough: Cognitive Patterns Engine (Sprint 3)

L'objectif de ce sprint final était d'offrir une réflexion sur l'historique de travail de l'utilisateur (7, 14, ou 30 jours) sous forme de **faits avérés** purement déterministes. Aucune IA, aucune prédiction aléatoire.

## Ce qui a été accompli

### 1. Le Moteur Déterministe Backend (`cognitivePatterns.service.js`)
Nous avons développé un service mathématique traitant deux sources (l'historique brut `cognitive_state_events` et les totaux journaliers `daily_cognitive_metrics`) pour calculer 5 métriques clés :
- **Meilleure période de focus :** Analyse de la densité des événements `deep_focus` groupés par heure.
- **Période difficile :** Analyse de la densité des événements `friction` et `fatigue` groupés par heure.
- **Projet dominant :** Le projet ayant généré le plus de temps cumulé en mode `deep_focus`.
- **Temps d'entrée en focus :** La moyenne du delta de temps entre le premier événement d'une journée et l'apparition du premier état de `deep_focus`.
- **Stabilité cognitive :** Un score mathématique sur 100 qui pénalise fortement un ratio de friction élevé et un nombre important de changements de contexte.

### 2. API et Exposition des Données
- Ajout du point de terminaison `GET /api/cognitive/patterns` avec la gestion native d'une plage temporelle (query param `?range=7d|14d|30d`).

### 3. Interface Utilisateur Cognitive (`CognitivePatterns.jsx`)
- L'interface affiche le "miroir cognitif" de manière strictement descriptive. Chaque insight possède un format typographique minimal, une icône dédiée et une couleur (vert, bleu, orange) pour orienter rapidement le cerveau sans nécessiter de lecture profonde. 
- Les 5 insights se mettent à jour instantanément lorsque l'utilisateur sélectionne l'intervalle d'analyse (7, 14, ou 30 jours) via les boutons de contrôle discrets.
- L'intégration globale a été finalisée sur le Dashboard, scellant la hiérarchie visuelle complète du "MADSuite Cognitive OS".

---

# Walkthrough: Minimal Recommendations Engine (Sprint 4)

L'objectif de ce dernier sprint de l'écosystème cognitif était d'apporter une **Action Layer** intelligente mais extrêmement sobre, en se basant sur le contexte (État actuel + Patterns + Timer) pour réduire la friction décisionnelle.

## Ce qui a été accompli

### 1. Le Moteur de Décision Déterministe (`cognitiveRecommendationEngine.js`)
- Un utilitaire purement algorithmique a été mis en place pour avaler les données du contexte (durée de la session en cours, état, score de stabilité global) et statuer sur la nécessité d'intervenir.
- **Règle absolue :** Il ne renvoie qu'une action (au maximum) ou aucune (`none`). 
- Actions possibles configurées :
  - `deep_focus` très long (> 90 min) -> Suggestion de pause courte.
  - `fatigue` -> Suggestion d'arrêt immédiat pour pause récupératrice.
  - `friction` avec historique fragmenté -> Suggestion de mini-tâche de démarrage (Pomodoro de 5 min).

### 2. Le Composant Actionnable (`CognitiveRecommendationBanner.jsx`)
- La bannière a été intégrée au Dashboard de manière très organique, placée **directement sous l'affichage de l'État Actuel (V1)**.
- Elle adopte la couleur (discrète) de l'état lié et ne possède qu'un **seul bouton d'action**.
- Si l'action recommandée est de prendre une pause, un clic sur le bouton arrêtera techniquement le Timer actif (s'il y en a un) et fera disparaître le bandeau pour nettoyer l'interface de l'utilisateur.

---

# Walkthrough: Memory Model & Unification (Sprints 5 & 6)

L'aboutissement de la couche cognitive a été de doter MADSuite d'une vision à long terme de l'utilisateur (Jumeau Cognitif) et de réorganiser drastiquement l'interface pour empêcher toute surcharge mentale, conformément à la philosophie de l'application.

## Ce qui a été accompli

### 1. Le Modèle de Mémoire Cognitive (Sprint 5)
- **Le Service Backend (`cognitiveMemory.service.js`)** calcule de manière purement déterministe le comportement de l'utilisateur sur le mois (ou trimestre) écoulé. Il extrait :
  - Les meilleures périodes de focus prolongées (top 2 horaires d'affluence du flow).
  - La tendance de stabilité globale (comparatif strict des 7 derniers jours par rapport aux 7 jours précédents).
  - Les jours de la semaine systématiquement productifs ou générateurs de friction.
- **L'Interface `CognitiveMemoryPanel.jsx`** expose le "jumeau cognitif" de manière très lisible, agissant comme un rapport comportemental neutre.

### 2. L'Orchestrateur d'Expérience Unifiée (Sprint 6)
- Plutôt que d'empiler indéfiniment les composants sur le Dashboard (ce qui contredirait le but de MADSuite), le `CognitiveExperienceOrchestrator.jsx` a été implémenté.
- **Règle absolue (2 modules visibles max) :** 
  - L'affichage de l'État Actuel reste au Niveau 1.
  - Le Niveau 2 s'adapte contextuellement à l'utilisateur : s'il requiert une action (`fatigue`, `friction`, long `deep_focus`), seule la Bannière de Recommandation s'affiche. Si tout va bien (`flow`), la Timeline de sa journée prend le relais.
  - Tous les composants analytiques (Daily Insight, Patterns Historiques, Profil Mémoire) sont repliés dans un panneau collapsable de **Niveau 3**, accessible par un unique bouton "Ouvrir le miroir cognitif".
- **Impact UX :** Le Dashboard principal respire. La friction visuelle est éliminée. La priorisation est absolue.
