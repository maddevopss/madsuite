# Database Architecture

> Schéma réel: `backend/db/schema_current.sql` | Migrations: `backend/db/migrations/`

## Multi Tenant

Chaque donnée appartient à une organisation.

Colonne standard : `organisation_id` (INTEGER, FK → `organisations`)

Isolation renforcée par **PostgreSQL Row-Level Security (RLS)** via variable de session :

```sql
SELECT set_config('app.current_organisation_id', $1, true);
```

Middleware applicatif : `requireOrganisation` + `rlsContext.middleware.js`

---

## Tables Principales (noms réels)

| Table conceptuelle | Table PostgreSQL | `organisation_id` |
|--------------------|------------------|---------------------|
| Organization | `organisations` | — (racine tenant) |
| User | `utilisateurs` | Oui (NOT NULL si actif, migration 029) |
| Client | `clients` | Oui |
| Project | `projets` | Oui |
| TimeEntry | `time_entries` | Oui |
| Invoice | `invoices` | Oui |
| InvoiceItem | `invoice_items` | Oui |
| UserSession | `user_sessions` | Oui (migration 020) |
| RefreshToken | `refresh_tokens` | Via `utilisateur_id` |
| ActivityLog | `activity_logs` | Oui |
| ActivityDailySummary | `activity_daily_summary` | Via `utilisateur_id` |
| ActivityAppRule | `activity_app_rules` | Oui (NOT NULL, migration 019a) |
| ActivityContextRule | `activity_context_rules` | Oui |
| ActivityPattern | `activity_patterns` | Oui |
| BusinessAuditLog | `business_audit_logs` | Oui |
| BillingAiSuggestion | `billing_ai_suggestions` | Oui |
| SecurityIncidentsBuffer | `security_incidents_buffer` | Oui (partitionnée, migrations 027/028) |
| ActivityProjectCache | `activity_project_cache` | Oui |

### Non implémenté

- `estimates` / soumissions — pas de table
- `payments` — pas de table

---

## Migrations

| Emplacement | Usage |
|-------------|-------|
| `schema_current.sql` | Installations neuves |
| `migrations/` | Migrations actives (ex: 029) |
| `archive/migrations/` | Historique 001–028 |
| `schema_migrations_executed` | Suivi des migrations appliquées |

Commandes :

```bash
npm run db:preflight:org --prefix backend
npm run db:migrate --prefix backend
```

---

## Comportement utilisateur orphelin

`utilisateurs.organisation_id` → `ON DELETE SET NULL` quand l'organisation est supprimée.

- L'utilisateur ne peut plus se connecter (`requireOrganisation` rejette)
- Données conservées pour audit
- Migration 029 : CHECK `organisation_id IS NOT NULL` si `deleted_at IS NULL`

---

## Règles

Toujours filtrer par organisation :

```sql
WHERE organisation_id = $current_org_id
```

Et/ou laisser RLS appliquer la politique automatiquement.

Aucune exception.
