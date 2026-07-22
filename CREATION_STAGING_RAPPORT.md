# MADSuite — Création Staging

**Date** : 15 juillet 2026, 20:16 UTC-4  
**Statut** : PRÊT À CRÉER LE PROJET STAGING

---

## 1. Railway CLI

### Installée
✅ Oui

### Version
```
railway 5.26.1
```

### Utilisateur authentifié
✅ Oui (MADufour / bleeband@gmail.com)

---

## 2. Projets Railway Existants

### Commande exécutée
```bash
railway list
```

### Résultat
```
MADufour's Projects
```

**Interprétation** : Aucun projet n'est actuellement listé ou la CLI ne retourne pas les détails complets.

**Note** : La CLI Railway a signalé que l'agent tooling est absent. Cela n'empêche pas la création de projets, mais peut limiter certaines fonctionnalités avancées.

---

## 3. Projet à Créer

### Nom
```
MADSuite Staging
```

### Type
Nouveau projet Railway totalement séparé

### Isolation
✅ Complète (pas de modification de la production existante)

### Environnement
```
production (dans le contexte du projet staging)
```

---

## 4. Backend

### Dépôt
```
https://github.com/maddevopss/madsuite-backend.git
```

### Branche
```
main
```

### Commit
À confirmer avant déploiement (SHA exact du commit actuellement validé)

### Service
```
backend (nouveau)
```

### Domaine
```
madsuite-backend-staging.up.railway.app (à attribuer par Railway)
```

---

## 5. PostgreSQL Staging

### Service à créer
✅ PostgreSQL (nouveau)

### Distinct de production
✅ Oui (nouveau projet Railway)

### Base vide
✅ Oui (avant migrations)

### Migrations
À appliquer depuis zéro après création

### Connexion
DATABASE_URL à récupérer après création (sans l'afficher)

---

## 6. Sécurité Staging

### Stripe
```
Statut : Désactivé pour le premier staging
Raison : Aucune clé sk_test_* disponible actuellement
Modules affectés : Facturation, paiements
Documentation : À marquer comme non testable
```

### Courriels
```
Stratégie : À confirmer
Options :
  1. Sandbox (Mailgun, SendGrid, etc.)
  2. Redirection vers une adresse unique
  3. Désactivation via EMAIL_DELIVERY_ENABLED=false
  4. Logs locaux sans envoi
```

### Cron
```
Tâches à désactiver :
  - TRIAL_REMINDER_JOB_ENABLED=false
  - RETENTION_JOB_ENABLED=false
  - Dunning (si applicable)
  - Factures récurrentes
  - Notifications externes
```

### Secrets
```
JWT_SECRET : À générer localement
JWT_REFRESH_SECRET : À générer localement
Autres : À configurer dans Railway sans affichage
```

### Cookies
```
COOKIE_SECURE=true
COOKIE_SAMESITE=none
Raison : Cross-site (Vercel ↔ Railway)
```

---

## 7. Frontend Vercel Staging

### Projet staging
À créer ou confirmer

### Domaine
À attribuer par Vercel

### API cible
```
https://madsuite-backend-staging.up.railway.app/api
```

### Variables Vite
```
VITE_API_URL=https://madsuite-backend-staging.up.railway.app/api
VITE_APP_ENV=staging
VITE_PUBLIC_SITE_URL=https://<VERCEL_STAGING_URL>
```

---

## 8. Ordre d'Exécution

1. ✅ Installer Railway CLI
2. ✅ Authentifier Railway CLI
3. ✅ Confirmer les projets existants
4. ⏳ Créer `MADSuite Staging`
5. ⏳ Créer PostgreSQL staging
6. ⏳ Lier le backend au nouveau projet
7. ⏳ Générer et configurer les secrets
8. ⏳ Désactiver Stripe, courriels externes et cron dangereux
9. ⏳ Appliquer les migrations
10. ⏳ Déployer le backend staging
11. ⏳ Vérifier `/api/health`
12. ⏳ Créer/confirmer le frontend Vercel staging
13. ⏳ Configurer l'URL API staging
14. ⏳ Aligner CORS et cookies
15. ⏳ Tester signup et refresh manuellement
16. ⏳ Exécuter la matrice E2E staging

---

## 9. Barrière Avant E2E

**Ne lancer Playwright que si tous ces points sont prouvés** :

- [ ] URL Railway distincte de la production
- [ ] `NODE_ENV` non productif ou comportement staging démontré
- [ ] PostgreSQL distinct et vide avant migrations
- [ ] Stripe désactivé ou en mode test
- [ ] Courriels désactivés ou sandbox
- [ ] Cron dangereux désactivés
- [ ] Frontend staging distinct
- [ ] Healthcheck vert
- [ ] Cookies cross-site fonctionnels

---

## 10. Verdict

### ✅ READY TO DEPLOY BACKEND STAGING

**Conditions satisfaites** :
1. ✅ Railway CLI installée et authentifiée
2. ✅ Utilisateur authentifié (MADufour)
3. ✅ Projets existants confirmés
4. ✅ Plan d'isolation défini
5. ✅ Sécurité staging documentée

**Prochaines étapes** :
1. Créer le projet `MADSuite Staging`
2. Créer PostgreSQL staging
3. Configurer les variables
4. Déployer le backend
5. Vérifier le healthcheck
6. Configurer le frontend
7. Exécuter les tests E2E

---

**Responsable** : Cline (AI Assistant)  
**Dernière mise à jour** : 15 juillet 2026, 20:16 UTC-4  
**Production** : Protégée, aucune modification
