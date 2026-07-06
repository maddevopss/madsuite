# 🔐 AUDIT RLS, JOBS ASYNC & ISOLATION MULTI-TENANT — MADSuite v2.0.0

> **Date :** 24 juin 2026  
> **Périmètre :** Jobs cron, workers, queues, services IA, reporting, facturation, agrégations, exports, métriques  
> **Méthode :** Analyse statique du code source — aucune supposition, toutes les conclusions sont reliées à du code précis.

---

## AUDIT 1 — CARTOGRAPHIE DES JOBS

| # | Fichier | Fonction | Fréquence | Déclencheur | Tables utilisées |
|---|---------|----------|-----------|-------------|-----------------|
| J1 | `jobs/aggregateActivityLogs.js` | `aggregateActivityLogs()` | Toutes les heures (5 * * * *) | Scheduler | `activity_logs`, `organisations`, `activity_daily_summary` |
| J2 | `jobs/billingAssistantJob.js` | `processReminders()` | Quotidien 08h00 | Scheduler | `invoices`, `clients`, `estimates`, `outbox_events`, `notifications`, `utilisateurs` |
| J3 | `jobs/recurringInvoiceJob.js` | `processRecurringInvoices()` | Quotidien 06h00 | Scheduler | `recurring_invoices`, `invoices`, `clients`, `invoice_items`, `outbox_events`, `notifications`, `utilisateurs` |
| J4 | `jobs/outboxWorker.js` | `processOutboxEvents()` | Chaque minute | Scheduler | `outbox_events` → email via `email.service` |
| J5 | `jobs/weeklyReport.js` | `sendWeeklyReport()` | Lundi 08h00 | Scheduler (non intégré dans scheduler.js) | `organisations`, `utilisateurs`, `business_audit_logs`, `activity_daily_summary` |
| J6 | `jobs/dataRetention.js` | `runDataPurge()` | Quotidien 03h00 | Scheduler (non intégré dans scheduler.js) | `activity_logs`, `activity_daily_summary`, `business_audit_logs`, `time_entries`, `projets`, `clients`, `utilisateurs`, `invoices`, `user_sessions`, `refresh_tokens`, `security_incidents_buffer`, `activity_project_cache` |
| J7 | `jobs/cognitiveAggregator.js` | `aggregateCognitiveMetrics()` | Quotidien 02h00 | Scheduler | `cognitive_state_events`, `daily_cognitive_metrics` |
| J8 | `jobs/metricsSnapshotJob.js` | `generateMetricsSnapshots()` | Quotidien 01h00 | Scheduler | `organisations`, `invoices`, `recurring_invoices`, `metrics_snapshot` |
| J9 | `jobs/securityBufferJob.js` | `processSecurityBuffer()` | Toutes les 10 min | Scheduler | `security_incidents_buffer`, `utilisateurs`, `business_audit_logs` |
| J10 | `jobs/systemConsistencyJob.js` | `runSystemConsistencyCheck()` | Quotidien 04h00 | Scheduler | `time_entries`, `expenses`, `invoices`, `billing_reminders`, `outbox_events`, `metrics_snapshot`, `payment_events`, `ledger_entries`, `utilisateurs` |
| J11 | `jobs/systemReconciliationJob.js` | `runSystemReconciliation()` | Quotidien 05h00 | Scheduler | `invoices`, `ledger_entries`, `payment_events`, `analytics_events`, `organisations`, `system_consistency_logs` |
| J12 | `jobs/checkLongRunningTimers.js` | `checkLongRunningTimers()` | Toutes les 15 min | Scheduler | `time_entries`, `projets`, `clients`, `utilisateurs` |
| J13 | `jobs/dbMaintenance.js` | `runDbMaintenance()` | Dimanche 04h00 | Non intégré dans scheduler.js | `activity_logs`, `activity_daily_summary` (VACUUM/ANALYZE/REINDEX) |
| J14 | `jobs/trialReminderJob.js` | `checkAndSendTrialReminders()` | Quotidien 08h00 | Non intégré dans scheduler.js | `organisations`, `utilisateurs` |

---

## AUDIT 2 — ISOLATION MULTI-TENANT PAR JOB

### J1 — `aggregateActivityLogs` — ✅ SAFE

**Code analysé :**
```sql
UPDATE activity_logs SET is_aggregated = true
WHERE is_aggregated = false AND captured_at < ...
RETURNING utilisateur_id, organisation_id, ...
```
```sql
INSERT INTO activity_daily_summary (utilisateur_id, organisation_id, ...)
SELECT utilisateur_id, organisation_id, ...
ON CONFLICT (utilisateur_id, organisation_id, app_name, window_title, activity_date)
```

**Verdict :** Le job traite TOUTES les organisations en une seule passe, mais chaque ligne porte son propre `organisation_id`. L'agrégation est groupée par `(utilisateur_id, organisation_id, ...)`. Aucune donnée d'une organisation ne peut contaminer une autre car le `ON CONFLICT` inclut `organisation_id`. **SAFE.**

---

### J2 — `billingAssistantJob` — ⚠️ PARTIALLY SAFE

**Code analysé :**
```sql
SELECT i.*, c.email as client_email, ...
FROM invoices i JOIN clients c ON i.client_id = c.id
WHERE i.status = 'sent' AND i.due_date < CURRENT_DATE
  AND i.reminders_sent < 3 AND i.deleted_at IS NULL
FOR UPDATE SKIP LOCKED
```

**Problème identifié :** La requête de sélection des factures en retard **ne filtre pas par `organisation_id`**. Elle récupère TOUTES les factures de TOUTES les organisations. Chaque facture porte son `organisation_id` et les notifications sont envoyées avec `WHERE organisation_id = $1`, mais la sélection initiale est globale.

**Risque concret :** Si une facture d'une organisation A a un `client_email` NULL mais que la logique de notification utilise `invoice.organisation_id` correctement, il n'y a pas de fuite de données. Cependant, l'absence de filtre `organisation_id` dans la requête principale est une **dette de sécurité** : si un bug introduit une mauvaise utilisation de `invoice.organisation_id`, une fuite cross-tenant devient possible.

**Verdict : PARTIALLY SAFE** — Fonctionnellement correct aujourd'hui, mais structurellement fragile.

---

### J3 — `recurringInvoiceJob` — ⚠️ PARTIALLY SAFE

**Code analysé :**
```sql
SELECT r.*, i.notes, i.subtotal, ...
FROM recurring_invoices r
JOIN invoices i ON r.template_invoice_id = i.id
JOIN clients c ON r.client_id = c.id
WHERE r.status = 'active' AND r.next_issue_date <= CURRENT_DATE
FOR UPDATE OF r SKIP LOCKED
```

**Problème identifié :** Même pattern que J2 — **pas de filtre `organisation_id`** dans la requête principale. Le job traite toutes les récurrences de toutes les organisations. Les insertions utilisent `r.organisation_id` correctement, mais la sélection est globale.

**Risque additionnel :** Le clonage des `invoice_items` :
```sql
INSERT INTO invoice_items (organisation_id, invoice_id, ...)
SELECT $1, $2, NULL, description, quantity, unit_rate, amount
FROM invoice_items WHERE invoice_id = $3
```
Le `$1` est `r.organisation_id` — correct. Mais si `r.template_invoice_id` appartient à une autre organisation (corruption de données), les items seraient copiés cross-tenant.

**Verdict : PARTIALLY SAFE**

---

### J4 — `outboxWorker` — ✅ SAFE

**Code analysé :** Le worker lit les événements de `outbox_events` et envoie des emails. Les payloads contiennent les données nécessaires (email, invoice) insérées lors de la création de l'événement dans la transaction de l'organisation concernée. Pas de requête cross-tenant. **SAFE.**

---

### J5 — `weeklyReport` — ✅ SAFE

**Code analysé :**
```sql
SELECT o.id, o.nom, u.email as admin_email 
FROM organisations o
JOIN utilisateurs u ON u.organisation_id = o.id
WHERE u.role = 'admin' AND u.deleted_at IS NULL
```
Puis pour chaque org :
```sql
WHERE organisation_id = $1 AND action = 'system.purge_executed'
```
```sql
WHERE organisation_id = $1 AND activity_date > CURRENT_DATE - 7
```

**Verdict :** Itération par organisation avec filtre `organisation_id = $1` sur toutes les requêtes de données. **SAFE.**

---

### J6 — `dataRetention` — ⚠️ PARTIALLY SAFE

**Code analysé :**

Les purges de logs d'activité, résumés et audits utilisent un JOIN sur `organisations` pour respecter les rétentions par organisation :
```sql
DELETE FROM activity_logs WHERE id IN (
  SELECT al.id FROM activity_logs al
  JOIN organisations o ON al.organisation_id = o.id
  WHERE al.captured_at < NOW() - (o.retention_activity_logs_days * INTERVAL '1 day')
  ...
)
```
✅ Correct — chaque organisation a sa propre rétention.

**Problème identifié :** La purge des soft-deletes :
```sql
DELETE FROM time_entries
WHERE id IN (SELECT id FROM time_entries WHERE deleted_at < NOW() - INTERVAL '90 days' LIMIT 5000)
```
**Pas de filtre `organisation_id`** — supprime les données de TOUTES les organisations indistinctement. Acceptable pour une purge de maintenance, mais si une organisation a une politique de rétention différente pour les soft-deletes, ce n'est pas respecté.

**Problème identifié 2 :** La purge des sessions et tokens :
```sql
DELETE FROM user_sessions WHERE login_time < NOW() - INTERVAL '90 days' LIMIT 5000
DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked_at IS NOT NULL LIMIT 5000
```
Pas de filtre organisation — global. Acceptable car ces tables sont liées à des utilisateurs, pas à des données métier.

**Problème identifié 3 :** L'audit log de purge :
```sql
INSERT INTO business_audit_logs (organisation_id, action, ...)
SELECT id, 'system.purge_executed', 'system', 0, $1::jsonb, NOW()
FROM organisations
```
Insère le **même message de purge globale** dans les logs de TOUTES les organisations. Chaque organisation voit dans ses audit logs les statistiques de purge globale (incluant les données des autres organisations). **Fuite d'information indirecte.**

**Verdict : PARTIALLY SAFE**

---

### J7 — `cognitiveAggregator` — ⚠️ UNSAFE

**Code analysé :**
```sql
SELECT utilisateur_id, organisation_id, state, duration_minutes, projet_id
FROM cognitive_state_events
WHERE started_at::date = $1
```

**Problème critique :** **Aucun filtre `organisation_id`** dans la requête principale. Le job récupère les événements cognitifs de TOUTES les organisations pour la journée. L'agrégation est ensuite faite en mémoire Node.js par `utilisateur_id`, et l'`organisation_id` est pris depuis le premier événement de l'utilisateur.

**Risque concret :** Si un utilisateur appartient à plusieurs organisations (cas edge), ou si un `utilisateur_id` est réutilisé après suppression, les métriques cognitives pourraient être agrégées incorrectement.

**Problème additionnel :** L'`ON CONFLICT` dans l'INSERT :
```sql
ON CONFLICT (utilisateur_id, date) DO UPDATE SET ...
```
Le conflit est sur `(utilisateur_id, date)` **sans `organisation_id`**. Si deux utilisateurs de deux organisations différentes ont le même `utilisateur_id` (impossible en théorie avec auto-increment, mais...), il y aurait collision.

**Verdict : UNSAFE** — Requête globale sans filtre organisation, agrégation en mémoire sans isolation.

---

### J8 — `metricsSnapshotJob` — ✅ SAFE

**Code analysé :**
```javascript
const { rows: organisations } = await db.query("SELECT id FROM organisations WHERE deleted_at IS NULL");
for (const org of organisations) {
  const metrics = await metricsEngine.computeMetrics(org.id, ...);
  await db.query(`INSERT INTO metrics_snapshot ... WHERE organisation_id = $1`, [org.id]);
}
```

`computeMetrics` filtre toutes ses requêtes par `organisation_id = $1`. **SAFE.**

---

### J9 — `securityBufferJob` — ✅ SAFE

**Code analysé :**
```sql
SELECT sib.utilisateur_id, u.email, u.nom, json_agg(...) as incidents
FROM security_incidents_buffer sib
JOIN utilisateurs u ON u.id = sib.utilisateur_id
WHERE sib.notified_at IS NULL
GROUP BY sib.utilisateur_id, u.email, u.nom
FOR UPDATE SKIP LOCKED
```

Chaque utilisateur reçoit uniquement ses propres incidents. L'audit log utilise `SELECT organisation_id FROM utilisateurs WHERE id = $1`. **SAFE.**

---

### J10 — `systemConsistencyJob` — ⚠️ PARTIALLY SAFE

**Code analysé :** Toutes les requêtes de vérification sont **globales** (sans filtre `organisation_id`) :
```sql
SELECT t.id FROM time_entries t WHERE t.invoice_id IS NOT NULL AND t.is_billed = false
SELECT idempotency_key, count(*) FROM invoices WHERE idempotency_key IS NOT NULL GROUP BY idempotency_key HAVING count(*) > 1
```

**Verdict :** Ce job est un **audit oracle en lecture seule**. Il ne modifie pas de données. Les violations détectées sont loggées dans `system_consistency_logs` sans `organisation_id`. Pas de fuite de données entre organisations, mais les résultats agrègent des informations de toutes les organisations dans un seul log système. **PARTIALLY SAFE** (lecture seule, mais pas d'isolation dans les résultats).

---

### J11 — `systemReconciliationJob` — ⚠️ PARTIALLY SAFE

**Code analysé :** Même pattern que J10 — requêtes globales en lecture seule. Les anomalies détectées (ex: `LEDGER_IMBALANCE`) contiennent des `invoice_id` sans `organisation_id`. Un admin système peut voir des IDs de factures de toutes les organisations dans les logs. **PARTIALLY SAFE** (lecture seule).

---

### J12 — `checkLongRunningTimers` — ✅ SAFE

**Code analysé :**
```sql
WHERE te.end_time IS NULL AND te.organisation_id IS NOT NULL
  AND te.start_time <= NOW() - ($1::numeric * INTERVAL '1 hour')
```
Les JOINs vérifient `p.organisation_id = te.organisation_id` et `c.organisation_id = te.organisation_id`. Le job retourne des données mais ne les expose pas — il log uniquement. **SAFE.**

---

### J13 — `dbMaintenance` — ✅ SAFE

VACUUM/ANALYZE/REINDEX sont des opérations de maintenance DB globales sans accès aux données applicatives. **SAFE.**

---

### J14 — `trialReminderJob` — ✅ SAFE

Itère sur toutes les organisations mais envoie uniquement à l'admin de chaque organisation. Pas de fuite cross-tenant. **SAFE.**

---

## AUDIT 3 — REQUÊTES PRISMA DANGEREUSES

**Résultat :** `grep prisma.findMany|findFirst|...` → **0 résultat.**

Le backend n'utilise **aucun appel Prisma en runtime**. Prisma est utilisé uniquement pour la génération de types (`prisma generate`). Toutes les requêtes sont en raw SQL via `pg`. Le schéma Prisma (`schema.prisma`) est utilisé comme source de vérité pour les types TypeScript uniquement.

**Verdict :** Pas de risque Prisma en production. ✅

---

## AUDIT 4 — BYPASS RLS

### Prisma `$queryRaw` / `$executeRaw`
**Résultat :** 0 occurrence trouvée. ✅

### SQL natif sans `organisation_id`

**Trouvé dans `cognitiveAggregator.js` :**
```sql
SELECT utilisateur_id, organisation_id, state, duration_minutes, projet_id
FROM cognitive_state_events
WHERE started_at::date = $1
-- ❌ Pas de filtre organisation_id
```

**Trouvé dans `billingAssistantJob.js` :**
```sql
SELECT i.*, c.email as client_email, ...
FROM invoices i JOIN clients c ON i.client_id = c.id
WHERE i.status = 'sent' AND i.due_date < CURRENT_DATE
-- ❌ Pas de filtre organisation_id
```

**Trouvé dans `recurringInvoiceJob.js` :**
```sql
SELECT r.*, i.notes, ...
FROM recurring_invoices r JOIN invoices i ON r.template_invoice_id = i.id
WHERE r.status = 'active' AND r.next_issue_date <= CURRENT_DATE
-- ❌ Pas de filtre organisation_id
```

**Trouvé dans `dataRetention.js` :**
```sql
DELETE FROM time_entries WHERE deleted_at < NOW() - INTERVAL '90 days' LIMIT 5000
-- ❌ Pas de filtre organisation_id (soft-delete purge)
```

**Trouvé dans `dataRetention.js` (audit log) :**
```sql
INSERT INTO business_audit_logs (organisation_id, ...)
SELECT id, 'system.purge_executed', ... FROM organisations
-- ⚠️ Insère les stats globales dans les logs de TOUTES les organisations
```

### RLS PostgreSQL
Le schéma Prisma indique `row level security` sur de nombreuses tables (`activity_logs`, `invoices`, `clients`, `projets`, `utilisateurs`, etc.). Cependant, les jobs cron s'exécutent avec une connexion DB directe (`pool.connect()`) **sans appeler `set_config('app.current_organisation_id', ...)`**. Le RLS PostgreSQL n'est donc **pas activé pour les jobs cron** — ils opèrent en mode superuser/bypass RLS.

**Verdict :** Le RLS est une protection pour les requêtes API (via `rlsContextMiddleware`), mais les jobs cron le contournent structurellement. C'est un choix architectural délibéré (les jobs ont besoin d'accès global), mais cela signifie que **toute requête sans filtre `organisation_id` dans un job est une fuite potentielle**.

---

## AUDIT 5 — IA ET ASSISTANTS

### `ai.service.js` — `askCopilot`

**Isolation :** `organisationId` est passé à `executeToolCall`. Toutes les requêtes SQL dans `aiTools.service.js` filtrent par `organisation_id = $1`. ✅

**Mémoire partagée :** L'instance OpenAI (`openaiInstance`) est un singleton global. Les conversations ne sont pas persistées entre appels — chaque appel reçoit son propre historique `messages`. **Pas de mémoire partagée entre organisations.** ✅

**Cache partagé :** `NodeCache` dans `cache.service.js` est in-process. Les clés incluent les paramètres (dont `organisationId`). Pas de fuite si les clés sont correctement construites. ✅

**Embeddings :** Pas d'embeddings vectoriels détectés. ✅

**Fuite potentielle :** `generateTimesheetSuggestions` appelle `projectDetectionService.suggestProject` qui utilise `activity_project_cache` filtré par `organisation_id`. ✅

**Verdict IA : SAFE** — L'isolation est correctement propagée dans tous les outils IA.

---

## AUDIT 6 — REPORTING

### `reports.service.js` — `generateReport`

**Code analysé :**
```javascript
const projectOrgFilter = organisationScope("p", params, organisationId);
const clientOrgFilter = organisationScope("c", params, organisationId);
const userOrgFilter = organisationScope("u", params, organisationId);
const timeEntriesOrgFilter = organisationScope("te", params, organisationId);
```

`organisationScope()` lève une erreur si `organisationId` est null et ajoute `AND alias.organisation_id = $N`. Tous les JOINs sont filtrés. ✅

### `dashboard.service.js`

```sql
WHERE c.organisation_id = $1 AND c.deleted_at IS NULL
```
```sql
WHERE ads.utilisateur_id = $1 AND u.organisation_id = $2
```
✅ Filtres corrects.

### `weeklyReport.js`

Itère par organisation avec `WHERE organisation_id = $1`. ✅

**Verdict Reporting : SAFE**

---

## AUDIT 7 — FACTURATION

### `invoice.service.js` — `createInvoiceFromEntries`

Toutes les requêtes utilisent `organisationValue(organisationId)` :
```sql
WHERE idempotency_key = $1 AND organisation_id = $2
UPDATE time_entries SET is_billed = TRUE WHERE id = ANY($2) AND organisation_id = $3
```
✅

### `billingAssistantJob.js` — Relances automatiques

**Problème :** Requête sans filtre `organisation_id` (voir Audit 2 J2). Les emails sont envoyés au bon destinataire, mais la sélection est globale.

### `recurringInvoiceJob.js` — Factures récurrentes

**Problème :** Requête sans filtre `organisation_id` (voir Audit 2 J3).

**Risque concret :** Si une organisation A a une facture récurrente dont le `template_invoice_id` pointe vers une facture d'une organisation B (corruption de données), les items seraient copiés cross-tenant. Ce scénario nécessite une corruption préalable de la DB, mais l'absence de vérification `WHERE r.organisation_id = i.organisation_id` est une faiblesse.

### `stripe.service.js` — Webhooks

```sql
SELECT id FROM organisations WHERE stripe_customer_id = $1
UPDATE invoices SET status = 'paid' WHERE id = $1 AND status IN ('sent', 'draft') AND organisation_id = $2
```
✅ Le webhook vérifie `organisation_id` avant de mettre à jour.

**Verdict Facturation : PARTIALLY SAFE** — Les jobs de relance et récurrence manquent de filtres `organisation_id`.

---

## AUDIT 8 — TESTS DE SÉCURITÉ EXISTANTS

### Tests multi-org
- `e2e/multi-org.spec.js` : 1 test — vérifie qu'un client d'une autre organisation n'est pas visible via API et UI. ✅ Couvre le cas basique.

### Tests RLS
- `e2e/permissions.spec.js` : présent (non lu — fichier identifié dans la liste)
- `backend/src/test/auth.organisation.test.js` : présent

### Couverture réelle
- **Jobs cron** : **0 test de sécurité multi-tenant** sur les jobs cron. Les jobs `billingAssistantJob`, `recurringInvoiceJob`, `cognitiveAggregator` ne sont pas testés pour l'isolation.
- **IA** : `activityIntelligence.test.js` présent mais ne teste pas l'isolation cross-tenant.
- **Facturation** : Tests d'intégration présents mais focalisés sur la logique métier, pas sur l'isolation.

**Verdict Tests : INSUFFISANT** — La couverture multi-tenant est limitée aux routes API. Les jobs cron ne sont pas couverts.

---

## AUDIT 9 — SIMULATION D'ATTAQUE

### Scénario A — Fuite via `cognitiveAggregator` (P1)

**Scénario :** Un attaquant crée un compte dans l'organisation A. Il génère des événements cognitifs. Le job `cognitiveAggregator` s'exécute à 02h00 et récupère TOUS les événements de TOUTES les organisations sans filtre. Si un bug dans la logique de groupement en mémoire associe des événements d'un utilisateur de l'organisation B à l'organisation A, les métriques cognitives de B seraient visibles dans A.

**Impact :** Fuite de données comportementales (temps de focus, états cognitifs) entre organisations.

**Criticité : P1** — Risque réel mais nécessite un bug secondaire pour se matérialiser.

---

### Scénario B — Injection via `billingAssistantJob` (P2)

**Scénario :** Le job récupère toutes les factures en retard sans filtre organisation. Si une organisation A a 1000 factures en retard et que le job est lent, les factures de l'organisation B pourraient être traitées dans le même batch. Les emails sont envoyés au bon destinataire (via `invoice.client_email`), mais les notifications internes utilisent `invoice.organisation_id` — correct. Pas de fuite directe, mais la surface d'attaque est large.

**Impact :** Faible — les emails vont au bon destinataire. Risque de performance (une organisation peut monopoliser le job).

**Criticité : P2**

---

### Scénario C — Audit log pollué (P2)

**Scénario :** `dataRetention.js` insère dans `business_audit_logs` les statistiques de purge globale pour TOUTES les organisations :
```sql
INSERT INTO business_audit_logs (organisation_id, ...)
SELECT id, 'system.purge_executed', ..., $1::jsonb FROM organisations
```
Le `$1` contient `{ logsCount: X, summaryCount: Y, ... }` — ces chiffres sont les totaux GLOBAUX de toutes les organisations. Un admin de l'organisation A peut voir dans ses audit logs que "X logs ont été supprimés" — mais ce X inclut les logs de toutes les autres organisations.

**Impact :** Fuite d'information indirecte — un admin peut inférer le volume de données des autres organisations.

**Criticité : P2**

---

### Scénario D — Cross-tenant via `recurringInvoiceJob` (P2)

**Scénario :** Si la table `recurring_invoices` contient une entrée corrompue où `template_invoice_id` pointe vers une facture d'une autre organisation, le job clonerait les `invoice_items` de cette facture dans la nouvelle facture de l'organisation courante.

**Impact :** Fuite de données de facturation (descriptions, montants) entre organisations.

**Criticité : P2** — Nécessite une corruption préalable de la DB.

---

### Scénario E — Déni de service via IA (P3)

**Scénario :** Sans rate limit (corrigé dans cette session), une organisation pouvait envoyer des milliers de requêtes à `/api/ai-assistant` et épuiser le quota OpenAI global, rendant l'IA indisponible pour toutes les organisations.

**Impact :** Indisponibilité du service IA pour tous les tenants.

**Criticité : P3** — Corrigé (rate limit ajouté).

---

## RAPPORT FINAL

### Résumé exécutif

**Verdict global : SAFE WITH RISKS**

Le cœur de l'application (routes API, services métier, facturation manuelle) est correctement isolé par `organisation_id`. Les middlewares `requireOrganisation` et `organisationScope()` protègent efficacement les routes API. Le RLS PostgreSQL est configuré sur les tables critiques.

Les risques identifiés sont **concentrés dans les jobs cron** qui opèrent en mode global (bypass RLS) et manquent de filtres `organisation_id` dans leurs requêtes principales.

---

### Tableau final

| Composant | Verdict | Criticité |
|-----------|---------|-----------|
| Routes API (clients, projets, invoices, reports) | SAFE | — |
| Auth & Sessions | SAFE | — |
| Service IA (Copilot, aiTools) | SAFE | — |
| Reporting (reports.service, dashboard.service) | SAFE | — |
| Facturation manuelle (invoice.service) | SAFE | — |
| Stripe webhooks | SAFE | — |
| `aggregateActivityLogs` (J1) | SAFE | — |
| `outboxWorker` (J4) | SAFE | — |
| `weeklyReport` (J5) | SAFE | — |
| `metricsSnapshotJob` (J8) | SAFE | — |
| `securityBufferJob` (J9) | SAFE | — |
| `checkLongRunningTimers` (J12) | SAFE | — |
| `dbMaintenance` (J13) | SAFE | — |
| `trialReminderJob` (J14) | SAFE | — |
| `billingAssistantJob` (J2) | PARTIALLY SAFE | P2 |
| `recurringInvoiceJob` (J3) | PARTIALLY SAFE | P2 |
| `dataRetention` (J6) — soft-delete purge | PARTIALLY SAFE | P2 |
| `dataRetention` (J6) — audit log global | PARTIALLY SAFE | P2 |
| `systemConsistencyJob` (J10) | PARTIALLY SAFE | P3 |
| `systemReconciliationJob` (J11) | PARTIALLY SAFE | P3 |
| `cognitiveAggregator` (J7) | UNSAFE | P1 |

---

### Failles trouvées

#### P1 — `cognitiveAggregator.js`
- **Fichier :** `backend/src/jobs/cognitiveAggregator.js`
- **Fonction :** `aggregateCognitiveMetrics()`
- **Ligne :** 13-17
- **Problème :** Requête sans filtre `organisation_id` + agrégation en mémoire sans isolation + `ON CONFLICT` sans `organisation_id`

#### P2 — `billingAssistantJob.js`
- **Fichier :** `backend/src/jobs/billingAssistantJob.js`
- **Fonction :** `processReminders()`
- **Ligne :** 16-26
- **Problème :** Requête de sélection des factures sans filtre `organisation_id`

#### P2 — `recurringInvoiceJob.js`
- **Fichier :** `backend/src/jobs/recurringInvoiceJob.js`
- **Fonction :** `processRecurringInvoices()`
- **Ligne :** 17-25
- **Problème :** Requête de sélection des récurrences sans filtre `organisation_id`

#### P2 — `dataRetention.js` — audit log global
- **Fichier :** `backend/src/jobs/dataRetention.js`
- **Fonction :** `runDataPurge()`
- **Ligne :** 232-251
- **Problème :** Statistiques de purge globales insérées dans les audit logs de TOUTES les organisations

#### P3 — `systemConsistencyJob.js` / `systemReconciliationJob.js`
- Requêtes globales en lecture seule — pas de fuite de données mais les résultats agrègent des informations de toutes les organisations dans des logs système sans isolation.

---

### Plan de correction

#### Faille P1 — `cognitiveAggregator.js`

**Fichier :** `backend/src/jobs/cognitiveAggregator.js`  
**Fonction :** `aggregateCognitiveMetrics()`  
**Patch minimal :**

```javascript
// AVANT (ligne 13-17) :
const eventsRes = await pool.query(`
    SELECT utilisateur_id, organisation_id, state, duration_minutes, projet_id
    FROM cognitive_state_events
    WHERE started_at::date = $1
`, [targetDateStr]);

// APRÈS :
// 1. Récupérer les organisations actives
const orgsRes = await pool.query(`SELECT id FROM organisations WHERE deleted_at IS NULL`);
for (const org of orgsRes.rows) {
    const eventsRes = await pool.query(`
        SELECT utilisateur_id, organisation_id, state, duration_minutes, projet_id
        FROM cognitive_state_events
        WHERE started_at::date = $1 AND organisation_id = $2
    `, [targetDateStr, org.id]);
    // ... traitement par organisation
}
```

---

#### Faille P2 — `billingAssistantJob.js`

**Fichier :** `backend/src/jobs/billingAssistantJob.js`  
**Patch minimal :**

```sql
-- AVANT :
WHERE i.status = 'sent' AND i.due_date < CURRENT_DATE
  AND i.reminders_sent < 3 AND i.deleted_at IS NULL

-- APRÈS :
WHERE i.status = 'sent' AND i.due_date < CURRENT_DATE
  AND i.reminders_sent < 3 AND i.deleted_at IS NULL
  AND i.organisation_id IS NOT NULL
-- Note: le filtre organisation_id n'est pas nécessaire pour la sécurité
-- car chaque facture porte son organisation_id et les actions sont correctes.
-- Mais ajouter une vérification explicite dans la boucle :
```

```javascript
// Dans la boucle, ajouter une assertion :
if (!invoice.organisation_id) {
  logger.warn(`Invoice ${invoice.id} has no organisation_id — skipping`);
  continue;
}
```

---

#### Faille P2 — `recurringInvoiceJob.js`

**Fichier :** `backend/src/jobs/recurringInvoiceJob.js`  
**Patch minimal :**

```sql
-- AVANT :
WHERE r.status = 'active' AND r.next_issue_date <= CURRENT_DATE

-- APRÈS :
WHERE r.status = 'active' AND r.next_issue_date <= CURRENT_DATE
  AND r.organisation_id IS NOT NULL
  AND r.organisation_id = i.organisation_id  -- Vérification cross-org
```

---

#### Faille P2 — `dataRetention.js` — audit log global

**Fichier :** `backend/src/jobs/dataRetention.js`  
**Patch minimal :**

```sql
-- AVANT :
INSERT INTO business_audit_logs (organisation_id, action, entity_type, entity_id, details, created_at)
SELECT id, 'system.purge_executed', 'system', 0, $1::jsonb, NOW()
FROM organisations

-- APRÈS : Insérer uniquement les stats propres à chaque organisation
-- (nécessite de tracker les stats par organisation dans la boucle)
-- Solution minimale : supprimer l'insertion dans business_audit_logs
-- et logger uniquement dans les logs système (Winston) :
logger.info("Purge globale terminée", { stats: { logsCount, summaryCount, ... } });
-- Supprimer l'INSERT INTO business_audit_logs global.
```

---

### Score final

| Dimension | Score | Justification |
|-----------|-------|---------------|
| **Sécurité** | **6.5/10** | Auth excellente, RLS configuré, routes API sécurisées. Pénalisé par 1 faille P1 (cognitiveAggregator) et 3 failles P2 dans les jobs cron. |
| **Multi-tenant** | **7/10** | Isolation correcte sur toutes les routes API via `organisationScope()`. Jobs cron partiellement non isolés. |
| **Backend** | **7.5/10** | Architecture solide, transactions correctes, outbox pattern, distributed locks. |
| **Production Readiness** | **6/10** | Pas de CI/CD (corrigé), jobs cron sans tests de sécurité, failles P1/P2 non corrigées. |

---

*Rapport généré le 24 juin 2026 — MADSuite v2.0.0*
