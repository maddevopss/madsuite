# MADSuite - Contexte Projet

## Vision

MADSuite est une plateforme SaaS de gestion destinée aux PME, travailleurs autonomes, consultants et entrepreneurs.

Le produit couvre l'ensemble du cycle :

Devis → Projet → Temps → Facture → Paiement

L'objectif est de centraliser les opérations d'une petite entreprise dans une seule plateforme moderne.

---

# Historique

Le projet provient initialement d'une application de suivi du temps nommée :

- TimeMonitoring
- MADSuite

La décision stratégique a été prise d'évoluer vers une plateforme plus complète nommée :

**MADSuite**

Le nom officiel du produit est désormais MADSuite.

---

# Objectifs Business

## Court terme

Atteindre :

- 500 $ CAD / mois de revenus récurrents

Objectif :

- 25 clients
- 20 $ / mois

## Moyen terme

Atteindre :

- 2 000 $ CAD / mois

Objectif :

- 100 clients
- 20 $ / mois

---

# Positionnement

MADSuite n'est PAS un logiciel de suivi du temps.

MADSuite est une plateforme de gestion d'entreprise.

---

# Modules

## Existant

- Authentification (JWT cookies, refresh rotation, sessions)
- Dashboard (métriques, timer actif, billing cockpit)
- Gestion des clients (CRUD, soft delete)
- Gestion des projets (budget, taux horaire, statuts)
- Gestion du temps (timer, timesheet, entrées)
- Facturation (invoices CRUD, numérotation, PDF basique jsPDF)
- Rapports (mensuel/trimestriel, export CSV/PDF)
- Multi-organisation (RLS PostgreSQL, settings rétention)
- Desktop agent Electron (tracking activité, logs)
- Activity intelligence + Billing assistant (feature-flagged)
- Email service + alertes sécurité (`security_incidents_buffer`)
- Tests: Jest (backend/frontend/desktop) + 18 specs Playwright E2E
- CI GitHub Actions + Docker Compose dev

## À développer

- Soumissions / Estimates (pas de table DB)
- Paiements Stripe (décision prise, code absent)
- PDF professionnels avancés (basique existe)
- IA (suggestions facturation partielles, pas OpenAI intégré)
- Landing page / marketing
- Mobile punch, calcul km (placeholders UI)

---

# Priorités Produit

Toujours prioriser :

1. Fonctionnalités qui génèrent du revenu
2. Fonctionnalités qui facilitent la vente
3. Fonctionnalités demandées par les clients

Éviter :

- Sur-engineering
- Refactoring inutile
- Réécritures complètes sans justification

---

# Stack Technique

> État réel du dépôt V5.2. La stack cible (Next.js/Prisma) est documentée dans `ARCHITECTURE.md` section "Stack cible".

## Frontend

- React 19 + Vite
- React Router 7
- Axios, React Hook Form, Zod
- CSS personnalisé

## Backend

- Node.js + Express 5 (CommonJS)
- Services + validators Zod
- JWT auth (cookies httpOnly)

## Desktop

- Electron 33 (`desktop-agent/`)
- Tracking fenêtres actives (`active-win`)

## Base de données

- PostgreSQL
- Migrations SQL brutes (`backend/db/`)
- Row-Level Security (RLS) multi-tenant

## Services externes

| Service | Statut |
|---------|--------|
| SMTP (nodemailer) | Actif |
| BullMQ + Redis | Optionnel |
| Stripe | Planifié |
| OpenAI | Planifié |

---

# Architecture SaaS

Le système doit être conçu pour être multi-tenant.

Chaque organisation doit être isolée.

Toutes les requêtes doivent respecter les règles de sécurité entre organisations.

Aucune fuite de données inter-organisations n'est acceptable.

---

# Règles de Développement

## Refactoring

Toujours :

- analyser avant de modifier
- conserver les commentaires existants
- privilégier la réutilisation du code

Éviter :

- réécrire un module complet si une amélioration ciblée est possible

---

# Règles d'Analyse

Lorsqu'un fichier est analysé :

Toujours fournir :

## Points positifs

- ce qui est bien conçu

## Problèmes

- bugs potentiels
- dette technique
- performance

## Sécurité

- validation
- permissions
- multi-tenant

## Recommandations

- priorité haute
- priorité moyenne
- priorité basse

---

# Vision Long Terme

MADSuite doit devenir une suite complète de gestion d'entreprise.

Modules envisagés :

- CRM
- Soumissions
- Facturation
- Paiements
- Temps
- IA
- Gestion de projets
- Rapports
- Inventaire
- RH

---

# Philosophie

Un client payant vaut plus qu'une fonctionnalité parfaite.

Toujours favoriser :

- vitesse de livraison
- valeur pour le client
- simplicité

avant :

- complexité technique
- optimisation prématurée
- perfectionnisme
