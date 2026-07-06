# Périmètre métier de base

Ce document fige le socle fonctionnel de MADSuite.  
Tout nouveau travail doit rester à l'intérieur de ce cadre, sauf décision explicite de la direction produit.

## Inclus dans le socle

- `utilisateurs`
- `clients`
- `projets`
- `rapports`
- `settings entreprise`
- `rétention`
- `permissions`
- `multi-organisation`
- `isolement des données`

## Règles non négociables

- Chaque requête métier doit être portée par une organisation.
- Aucune donnée métier ne doit être lisible ou modifiable hors du périmètre de l'organisation courante.
- Les paramètres de rétention sont configurables par organisation.
- Les permissions doivent être évaluées côté serveur, pas seulement dans l'interface.
- Toute nouvelle table ou relation métier doit être pensée avec `organisation_id` dès le départ.

## Hors périmètre de base

- Facturation avancée
- Intelligence d'activité avancée
- Automatisations desktop non essentielles au socle
- Fonctionnalités IA expérimentales
- Intégrations externes non nécessaires au suivi du temps, des clients, des projets et des rapports

## Critère de validation

Une fonctionnalité est considérée dans le périmètre de base seulement si elle répond à au moins un de ces besoins :

- gérer un utilisateur
- gérer un client
- gérer un projet
- consulter ou exporter un rapport
- administrer une organisation
- appliquer une règle d'isolement inter-organisation

Si une demande n'entre pas là-dedans, elle doit être traitée comme une extension de produit, pas comme du socle.
