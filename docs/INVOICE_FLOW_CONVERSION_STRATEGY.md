# INVOICE FLOW 10X — STRATÉGIE DE PRÉPARATION (Revenue Core)

**Statut actuel** : UI LOCKED — REVENUE OBSERVATION MODE  
**Objectif** : Préparer l'optimisation du flow sans contaminer les données de mesure.

---

## 1. LA SEULE MÉTRIQUE QUI COMPTE

**KPI unique** :  
**Invoice → Checkout conversion rate**

Formule :  
`checkout_started (depuis une facture) / first_invoice_created`

Tout le reste (design, UX polish, tables plus jolies) est du bruit tant que ce ratio n'est pas mesuré et optimisé.

---

## 2. LES 3 ÉTATS UTILISATEUR

L'Invoice Flow doit servir explicitement ces 3 moments :

### 🟢 1. Just created invoice
- "Je viens de créer de la valeur"
- Besoin : reconnaissance immédiate de la valeur créée
- UI doit : mettre en avant le montant, le temps facturé, le client

### 🟡 2. Reviewing invoice
- "Je comprends ce que je vais facturer"
- Besoin : clarté, détail des time entries, total
- UI doit : rendre la valeur évidente sans friction de lecture

### 🔴 3. Payment decision
- "Je clique pour être payé"
- Besoin : zéro distraction, CTA dominant, urgence psychologique
- UI doit : transformer le moment en "payment engine"

**Règle d'or** :  
L'utilisateur ne doit **jamais** se demander "où je clique pour être payé ?"

---

## 3. TRANSFORMER EN "PAYMENT MOMENT ENGINE"

Invoice Flow n'est pas une page de gestion.  
C'est le **pont entre valeur créée et argent reçu**.

Questions que le flow doit répondre instantanément :
- Pourquoi payer maintenant ?
- Qu'est-ce que je gagne à payer / à faire payer ?
- Qu'est-ce que je perds si je reporte ?

---

## 4. PRÉPARATION TECHNIQUE (INSTRUMENTATION)

### Événements critiques à avoir (backend + frontend)

```js
// À instrumenter (priorité haute)
invoice_viewed              // quand une facture est ouverte après création
invoice_ready_for_payment   // quand l'utilisateur arrive à l'état "prêt à payer"
checkout_clicked_from_invoice // clic sur le CTA de paiement depuis la vue facture

// Déjà partiellement présents (à renforcer)
first_invoice_created
checkout_started
subscription_active
```

**Emplacements à instrumenter quand débloqué :**
- `frontend/src/pages/Invoices/index.jsx` → handleView + ViewInvoiceModal
- `backend/src/services/invoice/invoice.service.js` (après création)
- `frontend/src/pages/Invoices/ViewInvoiceModal.jsx` (ou équivalent)
- Routes Stripe / module checkout si appelées depuis facture

### Friction instrumentation (phase suivante)

- `time_on_invoice_page`
- `scroll_depth_invoice`
- `exit_without_checkout` (quand l'utilisateur ferme sans avoir cliqué sur checkout)

### Définition "Invoice Moment Start"

```js
const invoiceMomentStart = first time the invoice is opened after creation
// (pas le moment de création, mais le premier view post-création)
```

C'est le point de référence pour mesurer le temps jusqu'au checkout.

---

## 5. HYPOTHÈSES À TESTER (quand on débloquera)

**Hypothèse A**  
Les utilisateurs ne comprennent pas la valeur facturable (temps total, montant, etc.).

**Hypothèse B**  
Ils voient la facture mais le CTA de paiement n'est pas perçu comme l'action principale.

**Hypothèse C**  
Friction mentale : "je vais être payé plus tard" ou "ce n'est pas urgent".

**Le vrai 10X lever** (pas le design) :  
**Réduction du temps mental** entre "je viens de créer de la valeur" et "je clique pour être payé".

---

## 6. CHECKLIST DE DÉBOGAGE FUTUR (à utiliser le jour J)

Avant toute modification sur le flow, répondre en < 5 minutes :

- [ ] Où est le CTA principal de paiement ?
- [ ] Est-ce que quelqu'un peut rater le paiement (navigation secondaire forte) ?
- [ ] La valeur facturable est-elle évidente sans scroll excessif ?
- [ ] Le passage vers checkout est-il friction zéro (0 distraction) ?
- [ ] L'état de l'utilisateur est-il clair (just created / reviewing / payment decision) ?

---

## 7. STRUCTURE DU FUTUR SPRINT (quand les seuils seront atteints)

**Phase 1** — Simplification + clarté de la valeur (Invoice Review Layer)  
**Phase 2** — CTA payment dominant + zéro distraction  
**Phase 3** — Suppression de friction secondaire + micro-copy orienté paiement  
**Phase 4** — Instrumentation fine + mesure A/B des hypothèses

**Règle d'or** :  
Invoice Flow ne doit **jamais** être "amélioré".  
Il doit être **optimisé pour déclencher un paiement immédiat**.

---

## 8. ÉTAT ACTUEL (Observation Mode)

- `first_invoice_created` : instrumenté
- `checkout_started` : instrumenté (mais pas encore distingué "from invoice")
- `invoice_viewed` / `checkout_clicked_from_invoice` : **pas encore**
- Funnel dashboard : `/funnel` + `/api/analytics/funnel`

**Action immédiate recommandée (sans toucher UI)** :  
Documenter les emplacements exacts où ajouter les 3 nouveaux événements dès que le lock sera levé.

---

## 9. AUDIT ACTUEL DE L'INSTRUMENTATION (juin 2026)

### Événements déjà présents (backend)
- `invoice_created`
- `first_invoice_created` (détecté via count === 1)
- `invoice_paid`
- `invoice_sent`
- `recurring_enabled`

### Événements manquants pour ce flow
- `invoice_viewed`
- `invoice_ready_for_payment`
- `checkout_clicked_from_invoice` (distinct de checkout_started général)

### Emplacements frontend critiques (à instrumenter plus tard)
- `frontend/src/pages/Invoices/index.jsx`
  - `handleView` → après fetch + ouverture du ViewInvoiceModal
- `frontend/src/pages/Invoices/ViewInvoiceModal.jsx`
  - Bouton "Payer" (onPay / handlePay)
- `frontend/src/hooks/useInvoices.js` (ou invoices.api.js)
  - `checkoutInvoice`

### Emplacements backend (déjà bien instrumentés)
- `backend/src/services/invoice/invoice.service.js` (création + first detection)
- `backend/src/services/invoice/invoice-payment.service.js` (paid / sent)

**Recommandation** : Une fois débloqué, ajouter les 3 événements manquants **en premier**, avant tout changement visuel.

---

## 10. CHECKLIST DE PRÉPARATION IMMÉDIATE (observation mode)

- [x] KPI unique défini (Invoice → Checkout)
- [x] 3 états utilisateur documentés
- [x] "Payment Moment Engine" mindset adopté
- [ ] Ajouter `invoice_viewed` (priorité 1 quand unlock)
- [ ] Ajouter `checkout_clicked_from_invoice`
- [ ] Définir précisément "Invoice Moment Start" dans le code analytics
- [ ] Préparer le dashboard pour filtrer "invoices créées → checkout dans les X minutes"
- [ ] Documenter les hypothèses A/B/C dans ce fichier

Ce document sera la référence unique quand le lock sera levé.

---

**Prochain jalon** :  
Attendre ≥ 50 signups **OU** ≥ 10 invoices created + review du snapshot funnel avant tout changement sur ce flow.

Ce document est la préparation.  
Aucune modification de code UI ou de tracking critique ne sera faite tant que les conditions d'unlock ne sont pas validées.