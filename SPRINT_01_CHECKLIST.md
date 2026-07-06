# Sprint 01 MVP Commercial — Checklist Manuelle Première Facture

## Objectif

Valider le parcours complet : **Client → Projet → Timer → Facture → PDF → Valeur visible**

---

## Checklist de Validation

### 1. Authentification

- [X] Login fonctionne avec email/password
- [X] Dashboard charge après login
- [X] Logout fonctionne
- [ ] Refresh token rotation fonctionne

### 2. Création Premier Client

- [ ] Bouton "Ajouter un client" visible sur `/clients`
- [ ] Modal de création s'ouvre
- [ ] Formulaire accepte : nom, email, téléphone, adresse, notes
- [ ] Création réussit (toast "Client créé")
- [ ] **Redirection vers `/projets` (pas `/estimates`)**
- [X] Client apparaît dans la liste

### 3. Création Premier Projet

- [ ] Bouton "Ajouter un projet" visible sur `/projets`
- [ ] Modal de création s'ouvre
- [ ] Formulaire accepte : nom, client, budget, taux horaire, statut
- [ ] Création réussit (toast "Projet créé")
- [X] Projet apparaît dans la liste
- [X] Projet est associé au client créé

### 4. Timer Manuel

- [X] Timer visible dans le header ou sidebar
- [X] Bouton "Démarrer" fonctionne
- [X] Sélection du projet fonctionne
- [X] Sélection du client fonctionne
- [X] Chrono s'incrémente en temps réel
- [X] Champ "Description" accepte du texte
- [ ] Champ "Note rapide" accepte du texte
- [X] Bouton "Arrêter" fonctionne
- [X] Entrée de temps est créée dans la timesheet

### 5. Timesheet / Entrées de Temps

- [X] Page `/timesheet` charge
- [X] Entrée créée par le timer apparaît
- [X] Statut "non facturé" est visible
- [ ] Heures sont correctement calculées
- [ ] Entrée peut être modifiée
- [ ] Entrée peut être supprimée

### 6. Création Facture

- [X] Page `/invoices` charge (pas de paywall ModuleGate)
- [X] Bouton "Nouvelle facture" visible
- [X] Modal de création s'ouvre
- [X] Sélection du client fonctionne
- [ ] Entrées de temps non facturées apparaissent
- [ ] Sélection des entrées fonctionne
- [ ] Calcul du montant total est correct
- [ ] Création réussit (toast "Facture créée")
- [ ] Facture apparaît dans la liste avec statut "Brouillon"

### 7. PDF Facture

- [X] Bouton "Prévisualiser PDF" fonctionne
- [ ] PDF s'ouvre dans un nouvel onglet
- [X] PDF contient :
  - [X] Numéro de facture
  - [X] Date d'émission
  - [X] Nom du client
  - [X] Détail des heures facturées
  - [X] Montant total
  - [X] Informations de l'entreprise (si configurées)
- [X] Bouton "Télécharger PDF" fonctionne
- [X] Fichier PDF est téléchargé avec le bon nom

### 8. Dashboard — Valeur Visible

- [X] Dashboard charge
- [X] Métrique "Revenus (Ce mois)" affiche le montant
- [X] Métrique "Factures en attente" affiche le nombre
- [X] Métrique "Heures Facturables" affiche les heures
- [X] **Bloc "Prochaine action" visible si heures non facturées**
- [X] Bloc "Prochaine action" affiche le CTA "Créer une facture"
- [X] Clic sur CTA ouvre le modal de création de facture

### 9. Statuts Facture

- [ ] Facture en "Brouillon" peut être modifiée
- [ ] Facture peut passer à "Envoyée"
- [ ] Facture peut passer à "Payée"
- [ ] Facture peut passer à "Annulée"
- [ ] Changement de statut met à jour la liste

### 10. Conformité MADPROOF

- [ ] Aucun texte "traite le TDAH"
- [ ] Aucun texte "détecte l'attention"
- [ ] Aucun texte "mesure la fatigue"
- [ ] Aucun texte "garantit la productivité"
- [ ] Aucun texte "garantit les revenus"
- [ ] Aucun texte "conformité fiscale garantie"
- [ ] Aucun texte "sécurité garantie"
- [ ] Aucun texte "sait quand l'utilisateur décroche"

### 11. Copywriting Autorisé

- [ ] "Suivre son temps plus simplement" ✅
- [ ] "Transformer le temps travaillé en facture plus vite" ✅
- [ ] "Réduire les frictions administratives" ✅
- [ ] "Garder le fil entre clients, projets et factures" ✅

### 12. Performance & Stabilité

- [ ] Pas d'erreurs console (F12)
- [ ] Pas de crash lors de la création de client
- [ ] Pas de crash lors de la création de projet
- [ ] Pas de crash lors du timer
- [ ] Pas de crash lors de la création de facture
- [ ] Pas de crash lors du téléchargement PDF
- [ ] Temps de chargement < 3s par page

### 13. Modules & Accès

- [ ] Invoices n'est pas bloqué par ModuleGate
- [ ] Estimates n'est pas bloqué par ModuleGate (si utilisé)
- [ ] Timesheet est accessible (module "free")
- [ ] Clients est accessible (module "free")
- [ ] Projets est accessible (module "free")

---

## Résultat Final

**Parcours validé :** ✅ / ❌

**Notes :**

```
[Ajouter ici les observations, bugs, ou améliorations]
```

**Date de validation :** _______________

**Validateur :** _______________

---

## Rollback en Cas de Problème

Si un problème critique est découvert :

1. Revert P0-001 : `navigate("/estimates")` au lieu de `navigate("/projets")`
2. Revert P0-002 : Supprimer le bloc "Prochaine action"
3. Revert Capacitor : Restaurer `@capacitor/*` dans `package.json`
4. Revert .env : Restaurer `VITE_API_URL=https://api.madsuite.com/api`

```bash
git checkout frontend/src/pages/Clients/index.jsx
git checkout frontend/src/pages/Dashboard/index.jsx
git checkout frontend/package.json
git checkout .env.example
```
