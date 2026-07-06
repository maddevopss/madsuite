# MADSuite — PR Auto-Fix Agent Report

### COMPLEXITY ANALYSIS

**Fichier:** `frontend\src\components\Header.jsx`
**Score de complexité:** 60
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Conditions trop complexes (1x). Simplification requise. Fichier trop long (325 lignes). Risque de god-object.

**Fichier:** `frontend\src\components\activity\ActivitySummary.jsx`
**Score de complexité:** 55
- **UI Logic Leakage:** Utilisation de .reduce() (2x) : la logique cognitive devrait être dans le State Engine.
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Conditions trop complexes (1x). Simplification requise.

**Fichier:** `frontend\src\hooks\useKioskTracker.js`
**Score de complexité:** 55
- **UI Logic Leakage:** Trop d'opérations mathématiques. L'UI doit faire du rendering only.
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (316 lignes). Risque de god-object.

**Fichier:** `frontend\src\hooks\useTimesheet.helpers.js`
**Score de complexité:** 50
- **UI Logic Leakage:** Utilisation de .reduce() (5x) : la logique cognitive devrait être dans le State Engine.

**Fichier:** `backend\src\generated\prisma\internal\prismaNamespace.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (3440 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\activity_app_rules.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1907 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\activity_context_rules.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1584 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\activity_daily_summary.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1685 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\activity_feedback.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (2138 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\activity_logs.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (2403 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\activity_patterns.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1582 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\activity_project_cache.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1712 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\billing_ai_suggestions.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1594 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\business_audit_logs.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1739 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\clients.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (2149 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\cognitive_state_events.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1877 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\daily_cognitive_metrics.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (2054 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\daily_summaries.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1695 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\estimates.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (2571 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\estimate_items.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1689 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\expenses.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (2296 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\invoices.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (3253 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\invoice_items.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1890 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\organisations.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (7262 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\projets.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (4197 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\refresh_tokens.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (2058 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\schema_migrations.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1135 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\schema_migrations_executed.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1194 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\schema_migration_lock.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1170 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\security_incidents_buffer.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1605 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\security_incidents_buffer_old.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1592 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\time_entries.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (3220 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\user_sessions.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (1860 lignes). Risque de god-object.

**Fichier:** `backend\src\generated\prisma\models\utilisateurs.ts`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (4682 lignes). Risque de god-object.

**Fichier:** `backend\src\migrate\runMigrations.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (362 lignes). Risque de god-object.

**Fichier:** `backend\src\routes\activity.write.routes.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (312 lignes). Risque de god-object.

**Fichier:** `backend\src\routes\reports.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (358 lignes). Risque de god-object.

**Fichier:** `backend\src\services\activity.service.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (393 lignes). Risque de god-object.

**Fichier:** `backend\src\services\ai.service.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (403 lignes). Risque de god-object.

**Fichier:** `backend\src\services\auth.service.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (427 lignes). Risque de god-object.

**Fichier:** `backend\src\services\estimate.service.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (373 lignes). Risque de god-object.

**Fichier:** `backend\src\services\invoice-creation.service.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (316 lignes). Risque de god-object.

**Fichier:** `backend\src\services\invoice-workflow.service.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (310 lignes). Risque de god-object.

**Fichier:** `backend\src\services\timer.service.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (352 lignes). Risque de god-object.

**Fichier:** `backend\src\test\activityIntelligence.test.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (366 lignes). Risque de god-object.

**Fichier:** `backend\src\test\migrations.integration.test.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (498 lignes). Risque de god-object.

**Fichier:** `desktop-agent\src\main\tracking.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (356 lignes). Risque de god-object.

**Fichier:** `desktop-agent\__tests__\main.auth.test.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (702 lignes). Risque de god-object.

**Fichier:** `frontend\src\components\CognitiveMirrorModal.jsx`
**Score de complexité:** 45
- **UI Logic Leakage:** Mots-clés de calcul (calculate/compute) détectés dans le frontend. Trop d'opérations mathématiques. L'UI doit faire du rendering only.
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom).

**Fichier:** `frontend\src\pages\Innovation\useInnovationPage.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (386 lignes). Risque de god-object.

**Fichier:** `frontend\src\__tests__\useTimesheet.test.js`
**Score de complexité:** 45
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom). Fichier trop long (416 lignes). Risque de god-object.

**Fichier:** `frontend\src\pages\Dashboard\RealitySplitBar.jsx`
**Score de complexité:** 40
- **UI Logic Leakage:** Utilisation de .reduce() (1x) : la logique cognitive devrait être dans le State Engine. Trop d'opérations mathématiques. L'UI doit faire du rendering only.
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom).

**Fichier:** `frontend\src\pages\Invoices\CreateInvoiceModal.jsx`
**Score de complexité:** 40
- **UI Logic Leakage:** Utilisation de .reduce() (2x) : la logique cognitive devrait être dans le State Engine.
- **Over-Engineering:** Nesting excessif détecté (Pyramid of Doom).

**Fichier:** `frontend\src\__tests__\useUsers.test.js`
**Score de complexité:** 40
- **UI Logic Leakage:** Mots-clés de calcul (calculate/compute) détectés dans le frontend.
- **Over-Engineering:** Fichier trop long (343 lignes). Risque de god-object.

### DUPLICATION DETECTED
_Des patterns répétitifs ont été trouvés dans les fichiers ci-dessus._

### AUTO FIX PATCH
_Veuillez demander à l'agent d'exécuter l'auto-fix sur le fichier cible pour générer le patch._

### FINAL DECISION
**NEEDS REVIEW**

_Complexity is a bug._