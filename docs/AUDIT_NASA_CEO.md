# MADSuite — Audit Complet Style CEO de la NASA
**Date:** 2026-06-22  
**Version:** 2.0.0 (Branch V5.2)  
**Auditor:** Grok (embedded SaaS product engineer, following AGENTS.md)  
**Mission:** Atteindre $500 CAD MRR (≈ 25 clients payants @ 19,99 $/mois) le plus rapidement possible.

**Méthodologie:** Evidence-based, zero-tolerance sur l'isolation multi-tenant, FMEA, invariants, Go/No-Go clair. Priorités strictes AGENTS.md : 1. Sécurité multi-tenant, 2. Revenue features.

---

## 1. Executive Summary

**Score global de mission : 67/100 (AMBER)**

**Verdict : CONDITIONAL-GO pour premiers clients payants, avec 3 conditions critiques à lever sous 30 jours.**

**Top 3 signaux verts (force réelle)**
- Isolation tenant solide en runtime : preflight OK, organisationScope utilisé dans 46+ fichiers, 10 politiques RLS actives, tests d'intégration confirment 404 cross-org (pas de fuite visible).
- Chaîne de facturation fonctionnelle : CRUD invoices, numérotation org, PDF, Stripe checkout (addon + subscription), webhooks mettent à jour plan_type et status paid + ledger.
- Discipline cognitive et architecture respectée sur le core (stateEngine pur, event flow, pas de logique cognitive dans le frontend).

**Top 3 signaux rouges (risques mission)**
- Migrations commentées dans server.js (lignes ~116-118) : risque opérationnel majeur en prod.
- Duplication middleware RLS + organization.middleware + requireModule qui touche plan_type. Confusion et surface d'attaque.
- Master-admin hardcodé (user.id === 1) + absence de self-serve complet pour upgrade plan/addon (onboarding + Stripe existent mais incomplets pour scaling MRR).

**Implication directe pour le business** : Le produit peut techniquement vendre et facturer aujourd'hui. L'isolation tient dans les tests. Mais les risques ops + manque de self-serve propre empêchent un scale propre et rapide vers 25 clients payants sans intervention manuelle risquée.

---

## 2. Mission Status

**Objectif primaire** : 500 $ CAD MRR (25 organisations Pro/Business à 19,99 $/mois).

**État actuel de la surface revenue implémentée** :
- Auth multi-org + JWT httpOnly + rotation : live
- Timer + Timesheet + Clients + Projets : live (core gratuit)
- Invoices (draft/sent/paid, PDF jsPDF, lien time_entries) : live
- Estimates / Soumissions : table DB + routes + frontend (addon 5 $)
- Stripe : checkout one-time (addons), checkout subscription (pro), webhooks (plan_type + paid invoice + ledger) : partiellement live
- Gating : requireModule + modules.js (free/pro/addon) : live
- Reports + Billing dashboard : live (gated)
- Desktop agent : live (activité + punch)

**Gap vers 25 clients payants** :
- Pas de landing page marketing intégrée dans le produit principal (frontend/landing est un mini-site séparé).
- Pas d'onboarding payant fluide avec essai → upgrade self-serve visible.
- Activation manuelle probable de certains plans/modules (risque support + erreur).
- Aucun mécanisme visible de "cancel subscription → revert to free" côté client.

**Statut mission** : Core livré. Surface monétisable existe. Accélération bloquée par go-to-market incomplet et quelques risques ops critiques.

---

## 3. Revenue Readiness

**Flux critique audité** : Onboarding → Client/Projet → Timer → Invoice → Paiement → Reconnaissance revenue.

**État** :
- Flux invoice + time_entries → facture : implémenté et utilise organisationScope + idempotency.
- Stripe checkout pour addon (module_pricing table) et subscription : code présent (stripeCheckout.service + webhooks).
- Webhook "checkout.session.completed" (mode subscription) met plan_type = 'pro'.
- Webhook payment met invoice.status = 'paid' + ledger + audit.
- "customer.subscription.deleted" → plan_type = 'free'.

**Lacunes bloquantes ou à risque** :
- Le pricing et les modules sont gérés via organisation_modules + plan_type. Mais rien n'empêche un admin de mettre à jour manuellement la DB (aucun invariant fort Stripe-only).
- Landing page et marketing site non intégrés au funnel produit.
- Pas de mécanisme clair de trial → downgrade automatique visible côté client.
- PDF basique (jsPDF). Pas de branding avancé ni taxes complexes (roadmap).
- Estimates existent (migrations 030, 031, 037) et routes montées sous feature flag "estimates".

**Score Revenue Readiness** : 62/100 (fonctionnel pour early adopters, insuffisant pour scaling self-serve propre).

---

## 4. Tenant Isolation Review

**Résultat préflight (2026-06-22)** :
```
Preflight organisation_id OK
success: true
checkedTables: ['utilisateurs', 'clients', 'projets', 'time_entries', 'invoices', 'activity_logs', 'activity_daily_summary']
```

**Politiques RLS** : 10 politiques détectées dans schema_current.sql (activity_logs, activity_project_cache, security_incidents_buffer + génération dynamique dans migration 038).

Exemple politique (activity_logs) :
```sql
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY organisation_isolation_policy ON activity_logs
    USING (organisation_id = current_setting('app.current_organisation_id')::integer);
```

**Couverture scope** : 74 occurrences de `organisationScope` / scoped filters dans 46 fichiers (services, routes, jobs, tests). Les services critiques (clients, invoice/*, timesheet/*, projets, activity, expenses, reports, estimates) utilisent le helper ou des filtres explicites `organisation_id = $X`.

**Tests d'isolation** :
- rls-security.spec.js : création org A/B, token JWT avec organisation_id, attentes 404 sur cross-org read/update (RLS masque la ligne). Test d'injection = 404 attendu. Bon.
- e2e/multi-org.spec.js : même philosophie.

**Points faibles** :
- Double implémentation RLS (rlsContext.middleware.js + organization.middleware.js). Risque de divergence et confusion.
- Le rapport ancien tenant_safety_report.md (score 30/100) est presque entièrement du bruit des modèles Prisma générés. Non représentatif du runtime (pg + scope utils).
- Certaines routes (punch, modules, billingAssistant) avaient des requêtes globales par le passé ; les versions actuelles semblent corrigées mais méritent surveillance.
- Aucun test RLS exhaustif sur absolument toutes les tables (analytics_events, etc.).

**Score Tenant Isolation** : 81/100 (solide pour un SaaS early, mais duplication et historique "audit bruyant" abaissent la note).

---

## 5. Billing & Monetization

**Gating** :
- modules.js définit clairement free / pro / addon.
- requireModule interroge `plan_type` puis `organisation_modules.is_active`.
- Routes critiques (invoices, reports, estimates, expenses, billing, activity-intelligence) protégées.

**Stripe** :
- Support subscription (pro) et payment (addons + factures).
- Webhooks mettent à jour plan_type et status.
- Reconciliation service existe.
- Checkout pour addon utilise module_pricing.

**Points critiques** :
- Mise à jour plan_type possible hors Stripe (via DB directe ou master admin). Pas d'invariant fort "source of truth = Stripe".
- Pas de preuve d'un flux complet "upgrade self-serve depuis UI → Stripe → webhook → feature débloquée" testé end-to-end dans les specs e2e visibles.
- Paiement de facture via Stripe Connect (account de l'org) existe pour certains cas.

**Score Billing & Monetization** : 68/100.

---

## 6. Operational Reliability

**Points positifs** :
- Scheduler bien structuré avec distributedLock, cronMonitor, record success/failure.
- ~13-15 tâches actives (outbox, reconciliation, retention, metrics, security buffer, recurring invoices, etc.).
- Graceful shutdown implémenté (SIGTERM, SIGINT, uncaught).
- Sentry + requestId + logging structuré.
- Data retention par organisation.

**Points critiques** :
- **Migrations commentées dans server.js:116-118** :
  ```js
  // await runMigrations({ backup: ... });
  ```
  C'est un risque opérationnel majeur. Les déploiements manuels de migration deviennent obligatoires et source d'erreur humaine.
- Duplication de logique cron registry vs scheduler (warning émis mais continue).
- Email en mode sync si pas de Redis/Bull (dégradation gracieuse mais pas idéale).
- Pas de preuve de monitoring production (alertes sur job failures) au-delà des logs.

**Score Operational Reliability** : 58/100 (la plus grosse faiblesse actuelle).

---

## 7. Cognitive Engine Compliance

**État** :
- CognitiveStateEngine est pure (aucun appel DB, deterministic computeState).
- Flow documenté et respecté : event → eventProcessor → stateEngine → persistence (cognitive_state_events, daily metrics) → read models → UI.
- Modules (history, patterns, memory, recommendations) isolés, n'importent pas entre eux.
- Frontend components/cognitive : useState/useEffect pour fetch + affichage (labels flow/deep_focus etc.). Pas de calcul de score ni décision. Conforme à "Frontend = rendering only".

**Violations détectées** : Aucune sur le core.

**Score Cognitive Engine Compliance** : 92/100 (exemplaire).

---

## 8. Desktop Agent Security

**Points forts** :
- Token encryption obligatoire : `AGENT_TOKEN_ENC_KEY` requis (sha256 hash → 32 bytes), sinon throw.
- electron-store + safeStorage (quand dispo).
- IPC via handleSecure + Zod validation.
- trackingFilter, activityQueue avec retry/backoff.
- Tests anti-loop (backendDown.antiLoop), auth, windowScanner.

**Points faibles** :
- Dépendance native `active-win` (rebuild requis sur certaines plateformes).
- Fallback mémoire dans tokenManager pour les tests (acceptable).
- Pas de preuve de rotation refresh côté agent aussi robuste que le backend httpOnly.

**Score Desktop Agent Security** : 78/100.

---

## 9. Architecture Integrity

**Conformité AGENTS.md** (règles absolues) :
- Pas de cross-module imports cognitifs détectés.
- Dossiers core/ + modules/ respectés.
- Pas de "smart utilities" globaux cognitifs.
- Services backend portent la logique (bon).
- Single flow global respecté sur le cognitif.

**Déviations / dette** :
- WIP auth.controller.js + auth.routes.js non montés + références cassées (connu dans KNOWN_ISSUES).
- Duplication middleware RLS.
- Contrôleurs legacy encore présents (clientController etc.) alors que services dominent.
- Prisma installé et généré (postinstall) alors que runtime = pg pur. Bruit dans le repo + ancien rapport d'audit.

**Score Architecture Integrity** : 71/100.

---

## 10. Risk Register (FMEA)

| Failure Mode                          | Effect                              | Severity | Likelihood | Detection | RPN  | Current Controls                     | Action Recommandée (30j)                  |
|---------------------------------------|-------------------------------------|----------|------------|-----------|------|--------------------------------------|-------------------------------------------|
| Migrations non exécutées auto        | Schema drift, features cassées     | 9        | 7          | 4         | 252  | Manuel + preflight                   | Décommenter + test + backup auto          |
| Middleware RLS dupliqué              | Divergence, bypass possible        | 8        | 5          | 5         | 200  | Tests e2e                            | Unifier sur une seule implémentation      |
| Master-admin (id=1) compromis        | Création org illimitée + élévation | 10       | 3          | 6         | 180  | Hardcode + auth                        | Remplacer par secret + audit log          |
| plan_type modifié manuellement       | Accès features sans paiement       | 8        | 6          | 3         | 144  | requireModule                        | Forcer via Stripe uniquement + invariant  |
| RLS policy drop sur nouvelle table   | Cross-tenant leak                  | 10       | 4          | 4         | 160  | Migration 038 + preflight            | Ajouter test automatisé + CI preflight    |
| Agent desktop sans clé enc           | Refus de démarrage ou fallback faible | 7     | 5          | 7         | 245  | Throw + tests                        | Documentation + enforcement prod          |

RPN > 150 = prioritaire.

---

## 11. Black Swan Analysis

1. **Compromission Master Admin (user.id=1)**  
   Impact : création illimitée d'orgs, élévation, facturation gratuite massive.  
   Probabilité faible (hardcode + JWT). Détection : audit logs + anomalies. Mitigation : secret rotatif + 2ème facteur pour ce compte + alerte sur création org anormale.

2. **Bypass RLS via connexion directe ou migration mal appliquée**  
   Impact : fuite totale de données entre clients (catastrophique pour la marque SaaS).  
   Contrôle actuel : preflight + tests + policies. Manque : exécution systématique des migrations + validation post-déploiement.

3. **Fuite de STRIPE_SECRET_KEY + webhook manipulé**  
   Impact : fausses factures payées, downgrade/upgrades frauduleux.  
   Contrôle : webhook signature (à vérifier), rate limiting. Recommandation : signature verification explicite + reconciliation jobs.

4. **Agent desktop exfil massivement avant rotation**  
   Impact : données d'activité ultra-sensibles d'une org fuitent.  
   Contrôle : encryption, queue, filter. Faible détection côté serveur.

5. **Perte totale des jobs (outbox, reconciliation, retention)**  
   Impact : factures non générées, données qui gonflent, billing corrompu.

6. **Suppression ou corruption des politiques RLS en prod par DBA**  
   Impact : violation multi-tenant silencieuse.

---

## 12. Go / No-Go Decision

**Critères Go explicites (tous doivent être vrais)** :
- Preflight + RLS tests passent à 100 % sur les 7 tables critiques.
- Migrations auto-réactivées et testées en pipeline.
- Flux invoice payée via Stripe + mise à jour plan_type 100 % automatisé et testable.
- Middleware RLS unifié (plus de duplication).
- Master-admin remplacé par mécanisme auditable.
- Au moins 1 client réel peut créer, timer, facturer et payer sans intervention manuelle.

**Verdict actuel** : **CONDITIONAL-GO**

Conditions pour passer en GO dans les 30 jours :
1. Migrations décommentées + script de déploiement documenté + testé.
2. Unification middleware RLS + test de non-régression.
3. Documentation + tests du flux "client paie addon/pro → feature débloquée" end-to-end.

Sans ces 3 points, Go-to-market reste artisanal et risqué.

---

## 13. 30 Day Action Plan

**[P0] Décommenter + sécuriser les migrations dans server.js + ajouter backup + test de préflight en CI** — Eng — Succès = migration auto en dev/test/prod simulé. Impact : stabilité ops critique.

**[P0] Unifier les middlewares RLS (garder une seule source de vérité)** — Eng — Succès = un seul middleware monté, tests toujours verts.

**[P0] Durcir la source de vérité des plans** : n'autoriser la mise à jour de plan_type / organisation_modules que via Stripe webhooks ou master-admin audité. Ajouter invariant + test. — Eng — Succès = impossible de setter manuellement sans trace.

**[P1] Remplacer le hardcode id===1 du master-admin par un secret rotatif + logs complets** — Eng + Founder — Succès = plus de dépendance sur un user id magique.

**[P1] Ajouter test e2e complet "create estimate → invoice → Stripe checkout addon → webhook → module activé"** — Eng — Succès = test passe en CI.

**[P1] Finaliser le funnel self-serve** (landing + pricing visible + upgrade depuis UI sans support) — Founder + Eng — Succès = un utilisateur peut passer de free à pro seul.

**[P2] Nettoyer les WIP auth.controller/routes + supprimer le bruit Prisma si non utilisé en runtime** — Eng.

**[P2] Ajouter signature verification explicite + tests sur les webhooks Stripe critiques** — Eng.

**[P2] Monitoring + alerte sur échecs jobs critiques + anomalies création org** — Eng.

**[P2] Améliorer PDF factures (branding, taxes) pour clients payants** — Eng (si temps après P0/P1).

Max 12 items. Focus impitoyable P0 = sécurité + fiabilité du revenu.

---

## 14. Final Scorecard

| Area                        | Score (/100) | RAG   | Key Blocker                          | Evidence principale                          |
|-----------------------------|--------------|-------|--------------------------------------|----------------------------------------------|
| Tenant Isolation            | 81           | GREEN | Duplication middleware               | Preflight OK, 46+ scope usages, RLS tests   |
| Revenue Engine (core)       | 62           | AMBER | Landing + self-serve upgrade         | Stripe webhooks + requireModule live        |
| Billing & Monetization      | 68           | AMBER | Pas d'invariant Stripe-only          | Webhooks + modules.js + checkout            |
| Operational Reliability     | 58           | RED   | Migrations commentées                | server.js:116-118                           |
| Cognitive Engine            | 92           | GREEN | Aucun                                | StateEngine pur + flow respecté             |
| Desktop Agent Security      | 78           | AMBER | Native dep + encryption key          | tokenManager + tests                        |
| Architecture Integrity      | 71           | AMBER | WIP + Prisma noise + dupe            | AGENTS.md checks + known issues             |
| **Overall Mission Readiness** | **67**     | AMBER | Ops + go-to-market                   | Agrégation des critères ci-dessus           |

**Bottom line** : Le système tient la route sur les fondamentaux techniques (surtout l'isolation). Les faiblesses sont opérationnelles et go-to-market. Avec les 3-4 actions P0, le produit peut viser sérieusement les premiers 10-15 clients payants dans les 60-90 jours suivants.

---

**Fin de l'audit.**  
Preuves collectées via preflight réel, lectures de code (server.js, services, middlewares, tests), greps (74 scope, 10 policies), et revue des docs AGENTS/ROADMAP/BUSINESS.

Prochaines étapes : exécuter le 30-day plan, re-auditer dans 30 jours.
