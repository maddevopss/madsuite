Chaque fois qu'on prend une décision importante (nom, Stripe, structure multi-tenant, choix Prisma, etc.), on l'inscrit dedans.


## 2026-06-18

### DEC-001

Décision :
Abandon de MADSuite comme marque principale.

Choix :
MADSuite.

Raison :
Permettre l'évolution vers une suite complète de gestion.

### DEC-002

Décision :
Conserver la stack React/Vite + Express + PostgreSQL (pas de migration Next.js/Prisma à court terme).

Choix :
Évolution incrémentale du monorepo existant TimeMonitoring.

Raison :
MVP fonctionnel en prod, tests existants, vitesse de livraison > réécriture.

### DEC-003

Décision :
Multi-tenant via `organisation_id` + PostgreSQL RLS.

Choix :
`set_config('app.current_organisation_id', ...)` par requête + middleware `requireOrganisation`.

Raison :
Défense en profondeur — isolation au niveau DB, pas seulement applicatif.

### DEC-004

Décision :
Auth JWT en cookies httpOnly (pas Bearer en web).

Choix :
`access_token` + `refresh_token` cookies, rotation refresh, détection réutilisation.

Raison :
Réduit risque XSS volant le token. Desktop-agent conserve Bearer en fallback.

### DEC-005

Décision :
Stripe pour paiements futurs.

Choix :
Stripe (planifié).

Raison :
Standard SaaS, décision business — **code non implémenté** au 2026-06-18.

### DEC-006

Décision :
Utilisateurs orphelins ON DELETE SET NULL.

Choix :
`utilisateurs.organisation_id` nullable si org supprimée; utilisateur bloqué par middleware.

Raison :
Préserver audit trail sans accès post-suppression (migration 029 documente le CHECK).
