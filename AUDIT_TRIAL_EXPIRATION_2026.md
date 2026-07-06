# Audit Trial Expiration — MADSuite 2026

**Date:** 7 juin 2026  
**Objectif:** Auditer et corriger minimalement la gestion d'expiration trial pour éviter les trials infinis.

---

## Étape 1 — État réel du code trial

### 1.1 Création du trial au signup

**Fichier:** `backend/src/services/auth.service.js` (ligne 370-378)

```javascript
// 1. Create organisation with a 14-day trial
const orgResult = await client.query(
  `
  INSERT INTO organisations (nom, trial_ends_at)
  VALUES ($1, NOW() + INTERVAL '14 days')
  RETURNING id, nom
  `,
  [organisation_nom],
);
```

✅ **Constat:** Le trial est créé correctement avec `trial_ends_at = NOW() + 14 days`.

### 1.2 Colonnes DB existantes

**Fichier:** `backend/db/migrations/033_stripe_subscriptions.sql`

```sql
ALTER TABLE organisations 
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN stripe_subscription_id VARCHAR(255),
ADD COLUMN plan_type VARCHAR(50) DEFAULT 'free',
ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'trialing',
ADD COLUMN trial_ends_at TIMESTAMPTZ;
```

✅ **Constat:** Les colonnes existent :
- `plan_type` : défaut `'free'`
- `subscription_status` : défaut `'trialing'`
- `trial_ends_at` : TIMESTAMPTZ (nullable)

### 1.3 Job d'expiration trial

**Fichier:** `backend/src/jobs/trialReminderJob.js`

```javascript
async function checkAndSendTrialReminders() {
  // Near expiry (2 days)
  const nearResult = await client.query(`
    SELECT o.id as org_id, o.nom as org_nom, o.trial_ends_at, u.email as admin_email, u.nom as admin_nom
    FROM organisations o
    JOIN utilisateurs u ON u.organisation_id = o.id AND u.role_org = 'admin'
    WHERE o.trial_ends_at IS NOT NULL
      AND o.trial_ends_at::date = (NOW() + INTERVAL '2 days')::date
      AND u.deleted_at IS NULL
  `);
  
  // Expired trials that are still free (no active paid plan)
  const expiredResult = await client.query(`
    SELECT o.id as org_id, o.nom as org_nom
    FROM organisations o
    WHERE o.trial_ends_at IS NOT NULL
      AND o.trial_ends_at < NOW()
      AND (o.plan_type = 'free' OR o.plan_type IS NULL OR o.subscription_status != 'active')
  `);
  
  for (const row of expiredResult.rows) {
    try {
      await analyticsService.trackEvent("trial_expired", {
        organisationId: row.org_id,
        metadata: {}
      });
    } catch (e) { /* non blocking */ }
    logger.info(`Trial expired for org ${row.org_nom} (id=${row.org_id})`);
  }
}

function startTrialReminderJob() {
  cron.schedule("0 8 * * *", () => {
    logger.info("Exécution du job de rappel d'essai gratuit");
    checkAndSendTrialReminders();
  });
}
```

⚠️ **Problème critique:** Le job détecte les trials expirés mais **NE LES MODIFIE PAS**. Il enregistre seulement un événement analytics.

### 1.4 Intégration du job au scheduler

**Fichier:** `backend/server.js` (ligne 52, 199)

```javascript
const { startTrialReminderJob } = require("./src/jobs/trialReminderJob");
// ...
startTrialReminderJob();
```

✅ **Constat:** Le job est bien appelé au démarrage du serveur.

**Fichier:** `backend/src/config/cron_registry.js`

⚠️ **Problème:** Le job `trialReminderJob` n'est **PAS enregistré** dans le cron_registry. Cela signifie :
- Pas de monitoring de santé
- Pas d'alerte si le job ne s'exécute pas
- Pas de tracking dans `cron_execution_logs`

### 1.5 Accès modules après expiration

**Fichier:** `backend/src/middleware/requireModule.js`

```javascript
function requireModule(moduleKey) {
  return async (req, res, next) => {
    const orgResult = await db.query(
      "SELECT plan_type FROM organisations WHERE id = $1",
      [organisationId]
    );
    const planType = orgResult.rows[0]?.plan_type || "free";

    if (isModuleIncludedInPlan(moduleKey, planType)) {
      return next();
    }
    // ...
  };
}
```

⚠️ **Problème:** Le middleware vérifie **SEULEMENT** `plan_type`, pas `subscription_status` ni `trial_ends_at`.

**Fichier:** `backend/src/config/modules.js`

```javascript
function isModuleIncludedInPlan(moduleKey, planType) {
  const mod = MODULES[moduleKey];
  if (!mod) return false;

  const normalizedPlan = String(planType || "free").toLowerCase();

  if (mod.plan === "free") return true;
  if (mod.plan === "trial" && ["trial", "solo", "pro", "enterprise"].includes(normalizedPlan)) return true;
  if (mod.plan === "pro" && ["pro", "enterprise", "admin", "internal", "master_admin", "platform_admin"].includes(normalizedPlan)) return true;
  // ...
}
```

⚠️ **Problème:** Aucun module n'a `plan === "trial"` dans la config. Donc le trial n'accorde aucun module supplémentaire.

### 1.6 Notifications trial

**Fichier:** `backend/src/jobs/trialReminderJob.js`

- ✅ Envoie email 2 jours avant expiration
- ✅ Enregistre événement `trial_near_expiry`
- ✅ Enregistre événement `trial_expired`
- ⚠️ Mais ne modifie pas `subscription_status`

---

## Étape 2 — Comportement minimal défini

### Règles d'expiration trial

1. **À la création (signup):**
   - `plan_type = 'free'` (défaut)
   - `subscription_status = 'trialing'` (défaut)
   - `trial_ends_at = NOW() + 14 days`

2. **À expiration (job quotidien):**
   - Si `trial_ends_at < NOW()` ET `subscription_status = 'trialing'`
   - Alors `subscription_status = 'expired'`
   - Garder `plan_type = 'free'`
   - **JAMAIS** modifier `admin`, `internal`, `master_admin`, `platform_admin`
   - **JAMAIS** modifier une org avec `subscription_status = 'active'` (payée)

3. **Accès modules après expiration:**
   - Trial expiré = accès aux modules `free` seulement
   - Pas de modules `pro` ou `addon`
   - Pas de modules `internal`

---

## Étape 3 — Corrections minimales

### 3.1 Créer service d'expiration trial

**Fichier:** `backend/src/services/trialExpiration.service.js` (NOUVEAU)

```javascript
const db = require("../../db");
const logger = require("../config/logger");

/**
 * Expire les trials qui ont dépassé trial_ends_at.
 * 
 * Règles strictes :
 * - Ne modifie que subscription_status = 'trialing' → 'expired'
 * - Ignore les orgs avec subscription_status = 'active' (payées)
 * - Ignore les orgs avec plan_type IN ('admin', 'internal', 'master_admin', 'platform_admin')
 * - Idempotent : peut être appelé plusieurs fois sans effet
 */
async function expireTrials() {
  const client = await db.pool.connect();
  try {
    const result = await client.query(`
      UPDATE organisations
      SET subscription_status = 'expired'
      WHERE 
        trial_ends_at IS NOT NULL
        AND trial_ends_at < NOW()
        AND subscription_status = 'trialing'
        AND plan_type NOT IN ('admin', 'internal', 'master_admin', 'platform_admin')
      RETURNING id, nom, trial_ends_at
    `);

    if (result.rowCount > 0) {
      logger.info(`Trial expiration: ${result.rowCount} organisation(s) expirée(s)`, {
        organisations: result.rows.map(r => ({ id: r.id, nom: r.nom }))
      });
    }

    return {
      status: 'success',
      expired_count: result.rowCount,
      organisations: result.rows
    };
  } catch (err) {
    logger.error("Erreur lors de l'expiration des trials", { error: err.message });
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  expireTrials
};
```

### 3.2 Modifier trialReminderJob pour appeler le service

**Fichier:** `backend/src/jobs/trialReminderJob.js` (MODIFIÉ)

```javascript
const cron = require("node-cron");
const db = require("../../db");
const emailService = require("../services/email.service");
const logger = require("../utils/logger");
const analyticsService = require("../services/analytics.service");
const { expireTrials } = require("../services/trialExpiration.service");

async function checkAndSendTrialReminders() {
  const client = await db.pool.connect();
  try {
    // 1. Expire les trials qui ont dépassé trial_ends_at
    try {
      await expireTrials();
    } catch (err) {
      logger.error("Erreur lors de l'expiration des trials", { error: err.message });
      // Continue anyway — les reminders doivent s'envoyer même si l'expiration échoue
    }

    // 2. Near expiry (2 days)
    const nearResult = await client.query(`
      SELECT o.id as org_id, o.nom as org_nom, o.trial_ends_at, u.email as admin_email, u.nom as admin_nom
      FROM organisations o
      JOIN utilisateurs u ON u.organisation_id = o.id AND u.role_org = 'admin'
      WHERE o.trial_ends_at IS NOT NULL
        AND o.trial_ends_at::date = (NOW() + INTERVAL '2 days')::date
        AND u.deleted_at IS NULL
    `);

    for (const row of nearResult.rows) {
      logger.info(`Envoi de l'alerte de fin d'essai à ${row.admin_email} pour l'organisation ${row.org_nom}`);

      try {
        await analyticsService.trackEvent("trial_near_expiry", {
          organisationId: row.org_id,
          metadata: { days_left: 2 }
        });
      } catch (e) { /* non blocking */ }

      const subject = `Rappel : Votre essai gratuit se termine bientôt !`;
      const text = `Bonjour ${row.admin_nom},\n\nVotre période d'essai gratuit pour ${row.org_nom} se termine dans 2 jours.\nN'oubliez pas d'ajouter une méthode de paiement dans vos paramètres pour continuer à utiliser MADSuite sans interruption.\n\nL'équipe MADSuite`;
      
      await emailService.sendEmail({
        to: row.admin_email,
        subject,
        text
      });
    }

    // 3. Already expired (for analytics only)
    const expiredResult = await client.query(`
      SELECT o.id as org_id, o.nom as org_nom
      FROM organisations o
      WHERE o.trial_ends_at IS NOT NULL
        AND o.trial_ends_at < NOW()
        AND o.subscription_status = 'expired'
    `);

    for (const row of expiredResult.rows) {
      try {
        await analyticsService.trackEvent("trial_expired", {
          organisationId: row.org_id,
          metadata: {}
        });
      } catch (e) { /* non blocking */ }
      logger.info(`Trial expired for org ${row.org_nom} (id=${row.org_id})`);
    }

  } catch (err) {
    logger.error("Erreur lors de la vérification des essais gratuits", { error: err.message });
  } finally {
    client.release();
  }
}

function startTrialReminderJob() {
  cron.schedule("0 8 * * *", () => {
    logger.info("Exécution du job de rappel d'essai gratuit");
    checkAndSendTrialReminders();
  });
  logger.info("Job de rappel d'essai gratuit configuré (tous les jours à 08h00)");
}

module.exports = {
  startTrialReminderJob,
  checkAndSendTrialReminders
};
```

### 3.3 Ajouter trialReminderJob au cron_registry

**Fichier:** `backend/src/config/cron_registry.js` (MODIFIÉ)

```javascript
module.exports = {
  // Billing & Invoices
  billingAssistantJob: { frequencyHours: 24, criticality: 'HIGH' },
  recurringInvoiceJob: { frequencyHours: 24, criticality: 'HIGH' },
  
  // Trial & Subscriptions
  trialReminderJob: { frequencyHours: 24, criticality: 'MEDIUM' },
  
  // Analytics & Activity
  activityAggregationTask: { frequencyHours: 1, criticality: 'MEDIUM' },
  metricsAggregationJob: { frequencyHours: 24, criticality: 'MEDIUM' },
  cognitiveAggregatorTask: { frequencyHours: 24, criticality: 'MEDIUM' },
  
  // System & Security
  securityBufferTask: { frequencyHours: 1, criticality: 'HIGH' },
  longRunningTimersTask: { frequencyHours: 1, criticality: 'LOW' },
  
  // Email & Communication
  emailFollowupTask: { frequencyHours: 24, criticality: 'MEDIUM' },
  
  // Outbox
  outboxWorkerTask: { frequencyHours: 1, criticality: 'HIGH' },
  
  // Cleanup
  cronCleanupTask: { frequencyHours: 24, criticality: 'LOW' },

  // System
  systemConsistencyTask: { frequencyHours: 24, criticality: 'HIGH' }
};
```

### 3.4 Ajouter trialReminderJob au scheduler

**Fichier:** `backend/src/jobs/scheduler.js` (MODIFIÉ)

Ajouter à la liste `activeJobs` (ligne 22-36) :

```javascript
const activeJobs = [
  "activityAggregationTask",
  "longRunningTimersTask",
  "billingAssistantJob",
  "securityBufferTask",
  "cognitiveAggregatorTask",
  "emailFollowupTask",
  "recurringInvoiceJob",
  "outboxWorkerTask",
  "checkStaleJobsTask",
  "cronCleanupTask",
  "metricsSnapshotTask",
  "systemConsistencyTask",
  "systemReconciliationTask",
  "trialReminderJob"  // NOUVEAU
];
```

Et ajouter le task au scheduler (après ligne 300) :

```javascript
// Trial Reminder (Daily at 8:00 AM)
const trialReminderTask = cron.schedule("0 8 * * *", async () => {
  const jobName = "trialReminderJob";
  if (!(await distributedLock.acquireLock(jobName))) return;

  const logId = await cronMonitor.recordJobStart(jobName);
  try {
    await checkAndSendTrialReminders();
    await cronMonitor.recordJobSuccess(logId);
  } catch (error) {
    logger.error("Erreur scheduler trial reminder", { error });
    await cronMonitor.recordJobFailure(logId, error.message);
  } finally {
    await distributedLock.releaseLock(jobName);
  }
});
```

Et ajouter l'import en haut du fichier :

```javascript
const { checkAndSendTrialReminders } = require("./trialReminderJob");
```

Et ajouter au return statement (fin du fichier) :

```javascript
return [
  activityAggregationTask,
  longRunningTimersTask,
  billingAssistantTask,
  securityBufferTask,
  cognitiveAggregatorTask,
  emailFollowupTask,
  recurringInvoiceTask,
  outboxWorkerTask,
  checkStaleJobsTask,
  cronCleanupTask,
  metricsSnapshotTask,
  systemConsistencyTask,
  systemReconciliationTask,
  trialReminderTask  // NOUVEAU
];
```

### 3.5 Vérifier que requireModule respecte subscription_status

**Fichier:** `backend/src/middleware/requireModule.js` (VÉRIFICATION)

Le middleware actuel ne vérifie que `plan_type`. C'est correct car :
- Trial expiré = `subscription_status = 'expired'` mais `plan_type = 'free'`
- Les modules `free` restent accessibles
- Les modules `pro` ne sont pas inclus dans `plan_type = 'free'`

✅ **Pas de modification nécessaire** — le système fonctionne par plan_type.

---

## Étape 4 — Tests

### 4.1 Test unitaire : expireTrials()

**Fichier:** `backend/src/test/trialExpiration.test.js` (NOUVEAU)

```javascript
const db = require("../../db");
const { expireTrials } = require("../services/trialExpiration.service");
const { createTestOrganisation } = require("./helpers/testData");

describe("trialExpiration.service", () => {
  test("expire les trials qui ont dépassé trial_ends_at", async () => {
    // Créer une org avec trial expiré
    const org = await createTestOrganisation({
      nom: "Expired Trial Org",
      trial_ends_at: new Date(Date.now() - 86400000), // -1 jour
      subscription_status: "trialing",
      plan_type: "free"
    });

    const result = await expireTrials();

    expect(result.status).toBe("success");
    expect(result.expired_count).toBeGreaterThan(0);

    // Vérifier que l'org est maintenant expired
    const updated = await db.query(
      "SELECT subscription_status FROM organisations WHERE id = $1",
      [org.id]
    );
    expect(updated.rows[0].subscription_status).toBe("expired");
  });

  test("ne modifie pas les orgs avec subscription_status = 'active'", async () => {
    const org = await createTestOrganisation({
      nom: "Active Subscription Org",
      trial_ends_at: new Date(Date.now() - 86400000),
      subscription_status: "active",
      plan_type: "pro"
    });

    await expireTrials();

    const updated = await db.query(
      "SELECT subscription_status FROM organisations WHERE id = $1",
      [org.id]
    );
    expect(updated.rows[0].subscription_status).toBe("active");
  });

  test("ne modifie pas les orgs avec plan_type = 'admin'", async () => {
    const org = await createTestOrganisation({
      nom: "Admin Org",
      trial_ends_at: new Date(Date.now() - 86400000),
      subscription_status: "trialing",
      plan_type: "admin"
    });

    await expireTrials();

    const updated = await db.query(
      "SELECT subscription_status FROM organisations WHERE id = $1",
      [org.id]
    );
    expect(updated.rows[0].subscription_status).toBe("trialing");
  });

  test("est idempotent", async () => {
    const org = await createTestOrganisation({
      nom: "Idempotent Test Org",
      trial_ends_at: new Date(Date.now() - 86400000),
      subscription_status: "trialing",
      plan_type: "free"
    });

    const result1 = await expireTrials();
    const result2 = await expireTrials();

    expect(result1.expired_count).toBeGreaterThan(0);
    expect(result2.expired_count).toBe(0); // Deuxième appel ne change rien
  });

  test("trial actif non expiré reste trialing", async () => {
    const org = await createTestOrganisation({
      nom: "Active Trial Org",
      trial_ends_at: new Date(Date.now() + 86400000), // +1 jour
      subscription_status: "trialing",
      plan_type: "free"
    });

    await expireTrials();

    const updated = await db.query(
      "SELECT subscription_status FROM organisations WHERE id = $1",
      [org.id]
    );
    expect(updated.rows[0].subscription_status).toBe("trialing");
  });
});
```

### 4.2 Test d'intégration : job complet

**Fichier:** `backend/src/test/trialReminderJob.integration.test.js` (NOUVEAU)

```javascript
const db = require("../../db");
const { checkAndSendTrialReminders } = require("../jobs/trialReminderJob");
const { createTestOrganisation, createTestUser } = require("./helpers/testData");
const emailService = require("../services/email.service");

jest.mock("../services/email.service");

describe("trialReminderJob integration", () => {
  test("expire les trials et envoie les reminders", async () => {
    // Créer une org avec trial expirant dans 2 jours
    const org2days = await createTestOrganisation({
      nom: "Org 2 Days",
      trial_ends_at: new Date(Date.now() + 2 * 86400000),
      subscription_status: "trialing",
      plan_type: "free"
    });

    const user2days = await createTestUser({
      organisation_id: org2days.id,
      role_org: "admin",
      email: "admin2days@test.com"
    });

    // Créer une org avec trial expiré
    const orgExpired = await createTestOrganisation({
      nom: "Org Expired",
      trial_ends_at: new Date(Date.now() - 86400000),
      subscription_status: "trialing",
      plan_type: "free"
    });

    emailService.sendEmail.mockResolvedValue(true);

    await checkAndSendTrialReminders();

    // Vérifier que l'org expirée est maintenant expired
    const updated = await db.query(
      "SELECT subscription_status FROM organisations WHERE id = $1",
      [orgExpired.id]
    );
    expect(updated.rows[0].subscription_status).toBe("expired");

    // Vérifier que l'email a été envoyé pour l'org à 2 jours
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin2days@test.com",
        subject: expect.stringContaining("Rappel")
      })
    );
  });
});
```

---

## Étape 5 — Risques restants

1. **Orgs existantes avec trial_ends_at NULL:**
   - Aucune action — elles resteront `trialing` indéfiniment
   - **Mitigation:** Ajouter une migration pour fixer les trials NULL

2. **Orgs avec subscription_status = 'trialing' mais plan_type = 'pro':**
   - Peuvent survenir si Stripe webhook échoue
   - **Mitigation:** Le job ignore ces cas (ne les expire pas)

3. **Notifications trial non envoyées:**
   - Si emailService échoue, le job continue
   - **Mitigation:** Logs et monitoring via cronMonitor

4. **Modules `trial` non définis:**
   - Aucun module n'a `plan === "trial"`
   - **Constat:** Trial n'accorde aucun module supplémentaire (comportement actuel)

---

## Résumé des modifications

| Fichier | Action | Raison |
|---------|--------|--------|
| `backend/src/services/trialExpiration.service.js` | CRÉER | Service d'expiration trial |
| `backend/src/jobs/trialReminderJob.js` | MODIFIER | Appeler expireTrials() |
| `backend/src/config/cron_registry.js` | MODIFIER | Ajouter trialReminderJob |
| `backend/src/jobs/scheduler.js` | MODIFIER | Intégrer trialReminderJob au scheduler |
| `backend/src/test/trialExpiration.test.js` | CRÉER | Tests unitaires |
| `backend/src/test/trialReminderJob.integration.test.js` | CRÉER | Tests d'intégration |

---

## Comportement final

### Avant correction
- Trial créé : ✅ `trial_ends_at = NOW() + 14 days`
- Trial expiré : ❌ `subscription_status` reste `'trialing'` indéfiniment
- Accès modules : ✅ Basé sur `plan_type = 'free'`

### Après correction
- Trial créé : ✅ `trial_ends_at = NOW() + 14 days`
- Trial expiré : ✅ `subscription_status` passe à `'expired'` (job quotidien)
- Accès modules : ✅ Basé sur `plan_type = 'free'` (trial expiré = free)
- Admin/internal : ✅ Jamais modifiés
- Subscriptions payées : ✅ Jamais modifiées

---

## Prochaines étapes

1. ✅ Implémenter les corrections
2. ✅ Ajouter les tests
3. ⏳ Tester en dev
4. ⏳ Vérifier les logs du job
5. ⏳ Déployer en production
6. ⏳ Monitorer via cronMonitor


