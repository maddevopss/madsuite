# P1-A : Self-Serve Revenue Funnel Audit – MADSuite

**Objectif** : Atteindre 25 clients payants ($500 CAD MRR) en minimisant le temps entre création de compte et première facture payée.

**Cible** : < 5 minutes entre "Créer compte" et "Première facture envoyée".

**Date** : 2026-06-22

---

## Funnel Audit – Tableau

| Étape                          | Existe | Nb clics approximatifs (nouvel utilisateur) | Blocages / Friction principaux | Status     | Impact MRR |
|--------------------------------|--------|---------------------------------------------|--------------------------------|------------|------------|
| **Landing (public)**           | Oui (séparé + in-app) | 1-2 (depuis hero)                          | CTA principal = "Demander une démo" (lien externe contact). Pas de "Essai gratuit" direct et visible. PricingTeaser existe dans landing in-app mais pas mis en avant sur hero public. | **RED** | Très élevé |
| **Signup**                     | Oui    | ~5-6 champs + 1 submit                     | Bon : création org + user + 14 jours trial en une transaction. Redirige vers onboarding. | **GREEN** | Élevé |
| **Onboarding / Trial**         | Oui    | 2-3 étapes + choix subscribe               | Mélange setup entreprise + subscribe. Pas de "Skip and create first invoice" clair. Trial de 14j existe mais pas très visible. | **AMBER** | Élevé |
| **Premier client / projet**    | Oui    | 4-6 clics (Dashboard → Clients → + → Projets) | Pas de wizard guidé après onboarding. L'utilisateur est lâché sur le Dashboard vide. | **AMBER** | Moyen |
| **Premier timer / time entry** | Oui    | 3-5 clics                                  | Timer existe. Mais aucune incitation forte à logger du temps rapidement. | **GREEN** | Moyen |
| **Première facture**           | Oui    | 7-10+ clics (Timesheet → sélection → Invoice creation) | Long chemin. Pas de "Send your first invoice in 1 click" après avoir du temps. jsPDF basique. | **RED** | **Critique** |
| **Upgrade (Pro / modules)**    | Oui    | 3-5 clics depuis ModulesAndSubscription    | Disponible, appelable depuis onboarding. Mais pas de prompt contextuel ("Tu as créé ta première facture – passe en Pro pour facturer plus"). | **AMBER** | Très élevé |

**Synthèse** :
- Backend création org/user/trial : solide
- Découverte et guidage vers "première valeur facturable" : faible
- Conversion vers paiement : dépend presque entièrement de la curiosité de l'utilisateur

---

## Analyse du Funnel Actuel

### Points forts
- Signup + création organisation en une seule opération (trial inclus)
- Stripe checkout fonctionne (subscription + addons)
- Onboarding existe et tente de collecter des infos + pousser subscribe
- Modules gating + requireModule en place

### Points faibles (goulots)
1. **Landing publique ne vend pas le self-serve**
   - Hero pousse vers "démo" au lieu de "commencer gratuitement maintenant".
   
2. **Pas de chemin guidé "vers la première facture"**
   - Après onboarding → Dashboard nu.
   - L'utilisateur doit découvrir lui-même Clients → Projets → Timer → Invoice.

3. **Upgrade arrive trop tôt ou trop tard**
   - On peut être invité à subscribe avant d'avoir vu de la valeur.
   - Ou au contraire, aucune incitation après avoir créé une vraie facture.

4. **Temps estimé réel** (utilisateur motivé) : **12-25 minutes** pour arriver à une facture envoyée + potentiellement upgrader.

---

## Top 10 Améliorations MRR (priorité funnel)

| # | Amélioration | Gain revenu estimé | Effort | Catégorie | Recommandation |
|---|--------------|--------------------|--------|-----------|----------------|
| 1 | Remplacer le CTA Hero landing par **"Commencer l'essai gratuit"** → signup direct | Très élevé | Faible | Landing | Changer le lien + texte du bouton principal |
| 2 | Ajouter un **wizard "Envoyer ma première facture en < 3 min"** après onboarding | Très élevé | Moyen | Onboarding | Étapes guidées : 1 client → 1 projet → 1 timer → 1 facture |
| 3 | Ajouter un **prompt contextuel d'upgrade** juste après création de la première facture | Élevé | Faible | Facturation | "Bravo ! Tu viens d'envoyer ta première facture. Passe en Pro pour facturer sans limite." |
| 4 | Exposer clairement le pricing **dans l'app** dès le Dashboard (banner ou menu) | Élevé | Faible | UX | Lien direct vers /modules ou pricing |
| 5 | Améliorer le **PricingTeaser** de la landing publique (visibilité + CTA "Essai 14 jours") | Élevé | Faible | Landing | Rendre le pricing plus agressif et self-serve |
| 6 | Pendant l'onboarding, proposer **"Créer des données démo + envoyer une facture test"** en un clic | Moyen-Élevé | Faible | Onboarding | Utiliser la route /onboarding/sample-data existante |
| 7 | Ajouter **"Temps jusqu'à première facture"** dans le Dashboard pour les nouveaux comptes | Moyen | Faible | UX | Gamification légère |
| 8 | Simplifier la création de première facture (bouton "Facture rapide" depuis Timer) | Moyen | Moyen | Facturation | Raccourci direct |
| 9 | Email de bienvenue + séquence "Comment facturer en 5 min" (jour 1, 3, 7) | Moyen | Moyen | Activation | Utiliser email service existant |
| 10 | Tracking d'activation (funnel events : signup → onboarding_completed → first_invoice_created) | Moyen (mesure) | Faible | Analytics | Ajouter events simples pour mesurer le vrai funnel |

---

## Recommandations prioritaires immédiates (prochaines 2-3 semaines)

**Quick wins (faible effort, impact direct)**
- Modifier le Hero landing (CTA + lien vers `/signup`)
- Ajouter un bouton "Envoyer ma première facture" visible dans le Dashboard pour les nouveaux utilisateurs (avec < 3 étapes)
- Ajouter un toast / modal après création de la première facture avec lien vers upgrade

**Moyens**
- Wizard onboarding amélioré qui guide jusqu'à la première facture
- Pricing visible dans l'app

**Mesure**
- Ajouter des événements (ou au minimum des logs) pour :
  - signup_completed
  - onboarding_completed
  - first_invoice_created
  - upgrade_clicked / checkout_started

---

## Conclusion

Le backend (création, trial, Stripe, facturation) est suffisamment mature.

Le goulet est **la conversion de l'intention en valeur facturable + upgrade**.

Prioriser la réduction de friction entre "compte créé" et "première facture envoyée" aura un impact beaucoup plus direct sur le MRR que des améliorations techniques internes.

Prochain pas suggéré : implémenter les 3-4 premiers items du Top 10 (surtout #1, #2, #3).

Veux-tu que je commence par l'implémentation de certains de ces quick wins (ex: CTA landing + prompt post-première-facture) ?