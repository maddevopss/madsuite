# BLOC 16 — P0 Revenue Core MADSuite
## Plan d'implémentation détaillé

**Date** : 3 juillet 2026  
**Statut** : Plan d'implémentation  
**Objectif** : Implémenter les 5 P0 pour guider l'utilisateur vers première facture → paiement

---

## RÉSUMÉ DES P0

| P0 | Objectif | Effort | Impact |
|----|----------|--------|--------|
| P0-1 | Dashboard guidé après onboarding | 2-3h | Critique |
| P0-2 | CTA "Créer votre premier client" | 1h | Critique |
| P0-3 | Modal après première facture | 2h | Critique |
| P0-4 | Événements funnel manquants | 1-2h | Moyen |
| P0-5 | Onboarding simplifié | 1-2h | Moyen |
| **TOTAL** | | **7-10h** | |

---

## P0-1 : DASHBOARD GUIDÉ APRÈS ONBOARDING

### Objectif
Le dashboard vide ne doit jamais être une impasse. Afficher un guide clair quand le compte est vide.

### États à gérer
1. **Aucun client** → Afficher "Créer votre premier client"
2. **Client existant, aucun projet** → Afficher "Créer un projet"
3. **Projet existant, aucun temps** → Afficher "Ajouter du temps"
4. **Temps existant, aucune facture** → Afficher "Créer une facture"
5. **Facture créée** → Afficher le dashboard normal

### Fichiers à modifier
- `frontend/src/pages/Dashboard/index.jsx`
- `frontend/src/hooks/useBillingDashboard.js` (ajouter counts)

### Implémentation

#### 1. Modifier `useBillingDashboard.js`
Ajouter des counts pour les clients, projets, temps, factures.

```js
// Ajouter à la réponse API
const clientsCount = await api.get('/clients/count');
const projectsCount = await api.get('/projets/count');
const timeEntriesCount = await api.get('/timesheet/count');
const invoicesCount = await api.get('/invoices/count');

return {
  ...existing,
  clientsCount: clientsCount.data.count || 0,
  projectsCount: projectsCount.data.count || 0,
  timeEntriesCount: timeEntriesCount.data.count || 0,
  invoicesCount: invoicesCount.data.count || 0,
};
```

#### 2. Modifier `Dashboard/index.jsx`
Ajouter une section "Commencez en 3 étapes" avant les métriques si le compte est vide.

```jsx
// Après les imports, ajouter :
const [onboardingState, setOnboardingState] = useState(null);

useEffect(() => {
  // Déterminer l'état d'onboarding
  if (clientsCount === 0) {
    setOnboardingState('no_client');
  } else if (projectsCount === 0) {
    setOnboardingState('no_project');
  } else if (timeEntriesCount === 0) {
    setOnboardingState('no_time');
  } else if (invoicesCount === 0) {
    setOnboardingState('no_invoice');
  } else {
    setOnboardingState('complete');
  }
}, [clientsCount, projectsCount, timeEntriesCount, invoicesCount]);

// Afficher le guide si onboardingState !== 'complete'
{onboardingState && onboardingState !== 'complete' && (
  <Card className="dashboard-onboarding-guide">
    <h3>Commencez en 3 étapes</h3>
    {onboardingState === 'no_client' && (
      <>
        <p>1. Créez votre premier client</p>
        <Button onClick={() => navigate('/clients')}>
          Créer votre premier client
        </Button>
      </>
    )}
    {onboardingState === 'no_project' && (
      <>
        <p>2. Ajoutez un projet</p>
        <Button onClick={() => navigate('/projets')}>
          Créer un projet
        </Button>
      </>
    )}
    {onboardingState === 'no_time' && (
      <>
        <p>3. Ajoutez du temps</p>
        <Button onClick={() => navigate('/timesheet')}>
          Ajouter du temps
        </Button>
      </>
    )}
    {onboardingState === 'no_invoice' && (
      <>
        <p>4. Créez votre première facture</p>
        <Button onClick={() => navigate('/invoices', { state: { openCreateInvoice: true } })}>
          Créer une facture
        </Button>
      </>
    )}
  </Card>
)}
```

### Routes backend à ajouter (optionnel)
Si les counts n'existent pas, créer des routes simples :
- `GET /api/clients/count`
- `GET /api/projets/count`
- `GET /api/timesheet/count`
- `GET /api/invoices/count`

Ou utiliser les routes existantes et compter côté frontend.

---

## P0-2 : CTA "CRÉER VOTRE PREMIER CLIENT"

### Objectif
Réduire la friction après signup/onboarding. Le bouton doit mener vers la création client existante.

### Fichiers à modifier
- `frontend/src/pages/Dashboard/index.jsx` (déjà couvert par P0-1)
- `frontend/src/pages/Clients/index.jsx` (vérifier empty state)

### Implémentation

#### 1. Vérifier `Clients/index.jsx`
S'assurer que le bouton "Ajouter un client" est visible et accessible.

```jsx
// Dans ClientsGrid ou ClientsHeader
{clients.length === 0 && (
  <EmptyState
    title="Aucun client"
    message="Ajoutez un client pour commencer à suivre votre travail et préparer une facture."
    action={
      <Button variant="primary" onClick={openAddModal}>
        + Créer votre premier client
      </Button>
    }
  />
)}
```

#### 2. Ajouter microcopy
Texte du bouton : "Créer votre premier client"  
Microcopy : "Ajoutez un client pour commencer à suivre votre travail et préparer une facture."

---

## P0-3 : MODAL APRÈS PREMIÈRE FACTURE

### Objectif
Célébrer le First Value Moment et proposer l'upgrade au bon moment.

### Déclencheur
- Événement `first_invoice_created` (déjà tracké backend)
- Afficher seulement une fois par organisation
- Ne pas bloquer l'accès à la facture

### Fichiers à modifier
- `frontend/src/pages/Invoices/index.jsx`
- Créer `frontend/src/components/FirstInvoiceModal.jsx`

### Implémentation

#### 1. Créer `FirstInvoiceModal.jsx`
```jsx
import { Modal, Button } from "../../components/ui";
import { useNavigate } from "react-router-dom";

export default function FirstInvoiceModal({ show, onClose, invoiceId }) {
  const navigate = useNavigate();

  return (
    <Modal show={show} onClose={onClose} title="">
      <div className="first-invoice-modal">
        <div className="modal-icon">🎉</div>
        <h2>Bravo, votre première facture est créée !</h2>
        <p>
          Vous venez d'atteindre le cœur de MADSuite : transformer votre travail en valeur facturable.
        </p>
        
        <div className="modal-actions">
          <Button 
            variant="primary" 
            size="large"
            onClick={() => navigate('/modules-and-subscription')}
          >
            Passer au Pro
          </Button>
          <Button 
            variant="secondary" 
            size="large"
            onClick={() => {
              if (invoiceId) {
                navigate(`/invoices/${invoiceId}`);
              }
              onClose();
            }}
          >
            Voir ma facture
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
          >
            Plus tard
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

#### 2. Modifier `Invoices/index.jsx`
```jsx
import FirstInvoiceModal from './FirstInvoiceModal';

export default function Invoices() {
  const [showFirstInvoiceModal, setShowFirstInvoiceModal] = useState(false);
  const [firstInvoiceId, setFirstInvoiceId] = useState(null);

  const handleCreate = useCallback(
    async (payload) => {
      const success = await addInvoice(payload);
      if (success) {
        createModal.closeModal();
        
        // Vérifier si c'est la première facture
        const allInvoices = await loadInvoices();
        if (allInvoices.length === 1) {
          // C'est la première facture
          setFirstInvoiceId(payload.id || allInvoices[0].id);
          setShowFirstInvoiceModal(true);
        }
        
        reloadInvoices();
      }
    },
    [addInvoice, createModal, reloadInvoices],
  );

  return (
    <>
      {/* ... existing code ... */}
      
      <FirstInvoiceModal 
        show={showFirstInvoiceModal}
        onClose={() => setShowFirstInvoiceModal(false)}
        invoiceId={firstInvoiceId}
      />
    </>
  );
}
```

### Règles
- ✅ La modal ne doit pas bloquer l'accès à la facture
- ✅ Elle doit être dismissible
- ✅ Elle doit respecter le trial existant
- ✅ Elle doit envoyer vers `/modules-and-subscription` (upgrade existant)

---

## P0-4 : ÉVÉNEMENTS FUNNEL MANQUANTS

### Événements à ajouter
1. `invoice_viewed` — Quand une facture est ouverte
2. `checkout_clicked_from_invoice` — Quand l'utilisateur clique "Payer"
3. `first_project_created` — Quand le premier projet est créé
4. `first_time_entry_created` — Quand la première entrée de temps est créée

### Fichiers à modifier
- `frontend/src/pages/Invoices/index.jsx` (invoice_viewed, checkout_clicked_from_invoice)
- `backend/src/services/projets.service.js` (first_project_created)
- `backend/src/services/timer.service.js` (first_time_entry_created)

### Implémentation

#### 1. `invoice_viewed` (frontend)
```jsx
// Dans Invoices/index.jsx, handleView
const handleView = useCallback(
  async (id) => {
    const inv = await fetchInvoice(id);
    if (inv) {
      // Track event
      try {
        await api.post('/analytics/track', {
          event_name: 'invoice_viewed',
          metadata: { invoiceId: id, status: inv.status }
        });
      } catch (e) {
        // non-blocking
      }
      
      setViewInvoice(inv);
      viewModal.openModal(inv);
    }
  },
  [fetchInvoice, viewModal],
);
```

#### 2. `checkout_clicked_from_invoice` (frontend)
```jsx
// Dans Invoices/index.jsx, handlePay
const handlePay = useCallback(
  async (id) => {
    // Track event
    try {
      await api.post('/analytics/track', {
        event_name: 'checkout_clicked_from_invoice',
        metadata: { invoiceId: id }
      });
    } catch (e) {
      // non-blocking
    }
    
    const data = await checkoutInvoice(id);
    if (data?.url) {
      window.location.href = data.url;
    }
  },
  [checkoutInvoice]
);
```

#### 3. `first_project_created` (backend)
```js
// Dans projets.service.js, après création
try {
  const countRes = await db.query(
    "SELECT COUNT(*) FROM projets WHERE organisation_id = $1",
    [organisationId]
  );
  if (parseInt(countRes.rows[0].count, 10) === 1) {
    await analyticsService.trackEvent("first_project_created", {
      organisationId,
      metadata: { projectId: project.id }
    });
  }
} catch (e) {
  // non-blocking
}
```

#### 4. `first_time_entry_created` (backend)
```js
// Dans timer.service.js, après création
try {
  const countRes = await db.query(
    "SELECT COUNT(*) FROM time_entries WHERE organisation_id = $1",
    [organisationId]
  );
  if (parseInt(countRes.rows[0].count, 10) === 1) {
    await analyticsService.trackEvent("first_time_entry_created", {
      organisationId,
      metadata: { timeEntryId: entry.id }
    });
  }
} catch (e) {
  // non-blocking
}
```

### Règles privacy
- ❌ Pas de nom du client
- ❌ Pas de courriel
- ❌ Pas de contenu de facture
- ✅ organisation_id (déjà standard)
- ✅ user_id (déjà standard)
- ✅ invoice_id / project_id / entry_id (nécessaire)
- ✅ status, timestamp, source

---

## P0-5 : ONBOARDING SIMPLIFIÉ

### Objectif
Après onboarding, l'utilisateur doit savoir quoi faire immédiatement.

### Redirection recommandée
Après `POST /onboarding/setup`, rediriger vers :
1. Dashboard guidé (P0-1) si aucun client
2. Ou directement vers création client

### Fichiers à modifier
- `frontend/src/pages/Onboarding/index.jsx`
- `backend/src/routes/onboarding.routes.js` (optionnel)

### Implémentation

#### 1. Modifier `Onboarding/index.jsx`
```jsx
const handleComplete = async () => {
  setLoading(true);
  try {
    await api.post("/onboarding/setup", formData);
    showToast("Votre espace est prêt à facturer !", "success");
    
    // Rediriger vers dashboard guidé (qui affichera le guide)
    navigate("/dashboard", { replace: true });
  } catch (err) {
    showToast(err.message || "Erreur lors de la configuration.", "error");
  } finally {
    setLoading(false);
  }
};
```

#### 2. Simplifier les étapes
Retirer la décision "Créer facture démo OU Passer au Pro" de l'étape 3.

Garder juste :
- Étape 1 : Infos entreprise
- Étape 2 : Taxes (optionnel)
- Étape 3 : "Créer ma première facture maintenant" (sample-data)

L'upgrade viendra après via la modal P0-3.

---

## VALIDATION

### Tests à exécuter
```bash
# Lint
npm run lint

# Build
npm run build

# Tests unitaires
npm run test

# Tests E2E (si disponible)
npm run test:e2e
```

### Tests ciblés
- [ ] Dashboard affiche le guide si aucun client
- [ ] Clic "Créer votre premier client" mène à la page Clients
- [ ] Modal s'affiche après création de la première facture
- [ ] Modal ne s'affiche qu'une fois
- [ ] Clic "Passer au Pro" mène à `/modules-and-subscription`
- [ ] Événements `invoice_viewed` et `checkout_clicked_from_invoice` sont trackés
- [ ] Événements `first_project_created` et `first_time_entry_created` sont trackés
- [ ] Onboarding redirige vers dashboard après setup

---

## RISQUES ET HYPOTHÈSES

### Risques
1. **Counts côté frontend** : Si les counts ne sont pas disponibles, utiliser les listes existantes
2. **Modal affichée plusieurs fois** : Ajouter un flag `first_invoice_modal_shown` en localStorage
3. **Redirection après onboarding** : Vérifier que le dashboard guidé s'affiche correctement

### Hypothèses
- Les routes `/clients`, `/projets`, `/timesheet`, `/invoices` existent
- L'API `/analytics/track` accepte les événements frontend
- Le système de trial de 14 jours est déjà en place
- Stripe checkout est déjà intégré

---

## PROCHAINES ÉTAPES

1. **Implémenter P0-1** : Dashboard guidé (2-3h)
2. **Implémenter P0-2** : CTA client (1h)
3. **Implémenter P0-3** : Modal première facture (2h)
4. **Implémenter P0-4** : Événements funnel (1-2h)
5. **Implémenter P0-5** : Onboarding simplifié (1-2h)
6. **Valider** : Lint, build, tests (1h)
7. **Documenter** : Rapport final (30 min)

**Total estimé** : 8-11 heures

---

## LIVRABLES ATTENDUS

À la fin de l'implémentation, fournir :

1. **Fichiers frontend modifiés**
   - `frontend/src/pages/Dashboard/index.jsx`
   - `frontend/src/pages/Invoices/index.jsx`
   - `frontend/src/pages/Onboarding/index.jsx`
   - `frontend/src/components/FirstInvoiceModal.jsx` (nouveau)
   - `frontend/src/hooks/useBillingDashboard.js` (optionnel)

2. **Fichiers backend modifiés**
   - `backend/src/services/projets.service.js`
   - `backend/src/services/timer.service.js`
   - `backend/src/routes/onboarding.routes.js` (optionnel)

3. **Routes/API touchées**
   - `GET /api/clients/count` (optionnel)
   - `GET /api/projets/count` (optionnel)
   - `GET /api/timesheet/count` (optionnel)
   - `GET /api/invoices/count` (optionnel)
   - `POST /api/analytics/track` (existant, utilisé)

4. **Événements funnel ajoutés**
   - `invoice_viewed`
   - `checkout_clicked_from_invoice`
   - `first_project_created`
   - `first_time_entry_created`

5. **Déclencheur modal première facture**
   - Événement `first_invoice_created` (backend)
   - Affichage dans `Invoices/index.jsx`

6. **Destination CTA Passer au Pro**
   - `/modules-and-subscription`

7. **Validation**
   - Résultats lint
   - Résultats build
   - Résultats tests

8. **Risques restants**
   - Documenter les hypothèses non validées
   - Proposer les prochaines étapes

---

**Document généré** : 3 juillet 2026  
**Prochaine étape** : Commencer l'implémentation P0-1
