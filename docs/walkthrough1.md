# Mode TDAH (ChronoMAD) - Fonctionnalités Implémentées

Dans le cadre du recentrage de l'outil vers l'expérience **ChronoMAD**, j'ai implémenté plusieurs fonctionnalités clés visant à réduire la friction cognitive pour les utilisateurs neurodivergents, tout en gardant notre objectif MVP et MRR :

## 1. Démarrage "Start Now, Sort Later" (Sans Friction)
Le plus grand défi pour le TDAH est souvent l'initiation de la tâche et la charge cognitive associée à la sélection du "bon projet" et du "bon client" avant même de commencer à travailler.
- **Ce qui a été fait** : Le bouton `Play` du Timer principal a été débloqué. Il est désormais possible de démarrer le chronomètre même si aucun projet n'est sélectionné.
- **En arrière-plan** : Le backend va automatiquement trouver (ou créer s'il n'existe pas) le client `Interne` et le projet `À classer`, et lier l'entrée de temps à ce projet par défaut.

> [!TIP]
> **Résultat** : Démarrage du temps en 1 clic. L'utilisateur peut se mettre à la tâche immédiatement, et la catégoriser plus tard lors de l'édition de sa feuille de temps.

## 2. Timer Visuel (Lutte contre la cécité temporelle)
Pour aider à concrétiser le temps qui passe ("Time Blindness"), une repère visuel est essentiel.
- **Ce qui a été fait** : J'ai intégré une **barre de progression rouge (style Time Timer)** qui se remplit à la base de la barre de chronomètre globale.
- **Comportement** : Cette barre représente la progression d'une heure (0% à 0 minute, 100% à 60 minutes). Elle permet de "voir" le temps écoulé de façon plus intuitive que des chiffres défilants.

## 3. Le "Mode Zen" sur le Dashboard
Les tableaux de bord remplis de chiffres, de revenus facturables et de statistiques peuvent créer de la paralysie ou de l'anxiété.
- **Ce qui a été fait** : Ajout d'un bouton de bascule **"🧘‍♂️ Mode Zen"** tout en haut du tableau de bord principal.
- **Comportement** : Lorsqu'activé (et sauvegardé dans les préférences locales), le mode Zen cache toutes les métriques financières complexes, les graphiques et l'assistant de facturation. Le tableau de bord devient propre et épuré, mettant uniquement en focus le **chronomètre actif** et l'**activité en cours**.

> [!NOTE]
> La détection d'inactivité (Idle Detection) était déjà partiellement implémentée de manière robuste dans l'application via `useIdleAndLongTimerMonitor` (qui met en pause ou avertit l'utilisateur après un long moment d'inactivité).

Ces fonctionnalités forment un excellent MVP pour vendre l'outil spécifiquement aux travailleurs autonomes et PME avec une prédominance TDAH. La version est stable, rapide, et s'intègre parfaitement dans l'architecture existante.

---

# Phase 2 : Maintien de la Motivation & Filet de Sécurité

Suite à notre première itération, nous avons ajouté des éléments essentiels pour boucler l'expérience TDAH.

## 4. Gamification (Dopamine Hits)
Les cerveaux atypiques ont besoin de renforcement positif immédiat pour maintenir une habitude (comme celle de "tracker" son temps).
- **Ce qui a été fait** : Intégration d'une animation de **célébration (confettis dynamiques)** qui se déclenche sur tout l'écran lorsque le chronomètre est arrêté.
- **Résultat** : Un petit "hit" de dopamine positif qui récompense l'utilisateur pour avoir accompli une session de travail, le motivant à recommencer.

## 5. L'IA comme "Assistant Mémoire" et "Review My Day"
Le plus grand stress lié aux feuilles de temps est d'oublier ce qu'on a fait de notre journée.
- **Ce qui a été fait** : Le module d'Intelligence d'Activité sur le Dashboard a été renommé et repensé visuellement comme le **"🧠 Assistant Mémoire (IA)"**.
- **Review My Day** : J'ai ajouté un bouton *"✨ Créer ma feuille de temps"* directement sur ce panneau. Il ouvre la modale de l'IA (AutoTimesheet) qui génère la journée automatiquement. L'utilisateur n'a qu'à valider.
- **Message clair** : Le texte d'accompagnement déculpabilise l'utilisateur : *"Oublié de démarrer le chronomètre ? Voici ce que l'IA a détecté."* Cela transforme une fonction technique en une fonction profondément rassurante pour le TDAH.

## 6. Les "Nudges" du Desktop Agent
Un cerveau TDAH en hyperfocus peut facilement travailler des heures sans s'en rendre compte.
- **Ce qui a été fait** : Le Desktop Agent interroge désormais le serveur pour savoir si un timer est actif. 
- **Comportement** : Si l'utilisateur est actif sur son ordinateur (souris/clavier) et qu'**aucun timer n'est lancé**, une notification système douce apparaît (max 1 fois aux 15 min) : *"🧠 ChronoMAD - Timer Oublié ? Tu as l'air concentré ! N'oublie pas de lancer ton timer."*

---

# Phase 3 : Le Smart Focus Shield (Anti-Distraction)

Pour parfaire l'expérience TDAH, nous avons remplacé la notion de "flicage de productivité" par un véritable "exosquelette cognitif" axé sur l'intention et le non-jugement.

## 7. L'Ancrage de l'Intention (Memory Anchor)
Pour lutter contre l'amnésie de travail et bloquer les tâches floues.
- **Ce qui a été fait** : Dans la barre du timer, le champ texte a été repensé. Au lieu du classique "Sur quoi travaillez-vous ?", le champ indique clairement : *"Mon objectif (ex: 'Écrire 1 phrase', 'Ouvrir Figma') :"*. 
- **Impact** : Force l'utilisateur à définir une **micro-action** claire avant de démarrer, réduisant la friction au démarrage.

## 8. Distraction Awareness Layer
Le Desktop Agent surveille les applications mais respecte le libre-arbitre.
- **Ce qui a été fait** : Si le timer roule et que l'utilisateur passe plus de 60 secondes sur un site ou une application "hautement dopaminergique" (YouTube, Reddit, Facebook, TikTok...), le Desktop Agent déclenche un léger nudge OS.
- **Le message** : *"🛡️ Smart Focus Shield : Distraction détectée. Pause assumée ou retour au focus ?"*. Cela interrompt le "scroll infini" sans être infantilisant.

## 9. Le "Rescue Button" (Bouton Panique)
Pour les moments de surcharge cognitive totale.
- **Ce qui a été fait** : Un bouton rouge bien visible **"🛟 Je suis éparpillé"** a été ajouté en haut du Dashboard.
- **Le fonctionnement** : Au clic, une modale épurée s'ouvre, coupant tout bruit visuel. Le message est simple : *"Respire. Tout va bien."* suivi d'un champ demandant la *toute première petite action physique* à faire pour s'y remettre. Cela permet de briser la paralysie de l'action.

## 10. L'Analytique "Shame-Free"
Remplacer le sentiment de culpabilité par un sentiment d'accomplissement.
- **Ce qui a été fait** : Modification du vocabulaire dans les rapports et le tableau de bord.
- **Impact** : "Temps non facturable" devient "Temps interne". "Top Distractions" devient "Exploration Libre". "Heures enregistrées" devient "Sessions de Focus". L'outil célèbre le temps investi plutôt que de pointer du doigt le "temps perdu".

---

# Phase 4 : L'Exosquelette Intégral (External Brain & Tunnel)

La dernière phase de la version MVP transforme l'outil en un véritable assistant cognitif qui prend en charge la fonction exécutive de l'utilisateur.

## 11. "External Brain Mode" (Brain Dump AI)
- **Ce qui a été fait** : Ajout d'un nouveau panneau "🧠 Bruit Mental" sur le tableau de bord, connecté à l'API d'Intelligence Artificielle.
- **Le concept** : L'utilisateur vide son cerveau en vrac dans un champ texte (*"faut que je fasse la facture, envoyer un email à X..."*). Un clic sur "Organise pour moi" et l'IA découpe ce texte chaotique en une **checklist ordonnée de micro-actions** avec des temps estimés. 
- **Bénéfice TDAH** : Sous-traite la fonction exécutive et le découpage de tâches à la machine. L'utilisateur n'a plus qu'à cliquer sur "Commencer" pour la tâche #1.

## 12. "One Task Universe Mode" (Focus Tunnel)
- **Ce qui a été fait** : Ajout d'un mode plein écran extrême accessible via le bouton **"🌑 Tunnel"** dans la barre de chronomètre.
- **Le concept** : Une fois activé, l'interface entière (menus, métriques, boutons) disparaît sous un overlay noir. Il ne reste que la description de la micro-action, le chronomètre géant et un bouton "J'ai terminé". 
- **Bénéfice TDAH** : C'est l'arme absolue contre la surcharge d'interface et les distractions visuelles. Un tunnel cognitif pur.

## 13. "Distraction Recovery Protocol"
- **Ce qui a été fait** : Ajout d'une modale déculpabilisante "Je reviens" (Recovery Protocol).
- **Le concept** : Lorsqu'un utilisateur dérive ou clique sur le bouton de récupération, on le salue avec bienveillance (*"Content de te revoir. Tu étais sur [Objectif]."*).
- **Bénéfice TDAH** : La modale force deux choix clairs : **Reprendre** ou **Abandonner/Changer de tâche**. Elle élimine la confusion mentale qui suit une distraction en forçant une décision de reconnexion à la tâche.

---

# Phase 5 : L'Exosquelette Proactif (Suite)

La Phase 5 introduit des systèmes qui agissent activement pour réduire la paralysie d'analyse et récompenser l'effort cognitif.

## 14. "Anchor Ritual" (Le Contrat Mental)
- **Ce qui a été fait** : Interception du bouton "Play" du chronomètre.
- **Le concept** : Si l'utilisateur clique sur "Démarrer" sans avoir défini d'objectif clair, l'application bloque le démarrage et affiche une modale *"Avant de commencer... Faisons un contrat mental"*. Elle exige une micro-action claire et propose de définir une durée temporelle (15m, 25m, 45m).
- **Bénéfice TDAH** : Empêche le travail "dans le vide" et la procrastination active. Force un sas de transition et une intention précise avant l'effort.

## 15. "Executive Function Emulator" (Bouton "Décide pour moi")
- **Ce qui a été fait** : Ajout d'un bouton **"🎲 Décide pour moi"** dans le panneau *External Brain / Bruit Mental*.
- **Le concept** : Au lieu de laisser l'utilisateur choisir parmi la liste des micro-actions générées par l'IA (ce qui peut créer de la fatigue décisionnelle), l'application sélectionne aléatoirement la "Next best action" et l'affiche en plein centre avec un gros bouton "Accepter & Démarrer".
- **Bénéfice TDAH** : Éradique la paralysie de l'analyse. L'outil prend le rôle du cortex préfrontal pour initier l'action.

## 16. "Loop Closure System" (Victoires du Jour)
- **Ce qui a été fait** : Création d'un panneau latéral **"🏆 Victoires du Jour"** (Dopamine Log).
- **Le concept** : Un flux d'événements en direct qui enregistre et célèbre les petites victoires non-liées à la finalisation d'un gros projet. Exemples : *Session démarrée (🚀)*, *Brain Dump organisé (🧠)*, *Distraction évitée (🛡️)*.
- **Bénéfice TDAH** : Compense le manque naturel de dopamine dans le cerveau TDAH en récompensant *la progression* et le *processus*, plutôt que la finalité lointaine.

---

# Phase 6 : Adaptation Cognitive & Gamification Réelle

La Phase 6 transforme l'outil en un système dynamique qui s'adapte à l'état mental de l'utilisateur (énergie, fatigue) et remplace les métriques de productivité toxiques par des métriques de santé cognitive.

## 17. "Momentum Engine" (Anti-procrastination dynamique)
- **Ce qui a été fait** : L'interface réagit à l'inactivité et aux échecs récents.
- **Le concept** : 
  1. Si l'utilisateur reste inactif sur le Dashboard plus de 2 minutes, le bouton Play commence à **pulser** pour capter son attention.
  2. Si l'utilisateur abandonne souvent ses tâches en cours (baisse de momentum), la modale de démarrage *Anchor Ritual* s'adapte automatiquement et suggère des **durées très courtes** (5m, 10m) au lieu des 25m habituelles.
- **Bénéfice TDAH** : Abaisse dynamiquement la barrière à l'entrée quand le cerveau est fatigué ou bloqué, facilitant le démarrage.

## 18. "Memory Replay" (Restauration de l'état mental)
- **Ce qui a été fait** : Amélioration du *Distraction Recovery Protocol*.
- **Le concept** : Lorsqu'on revient d'une distraction, au lieu d'un simple texte, l'application affiche un encart visuel stylisé "💾 Contexte Mental Restauré". Elle remet sous les yeux les mots exacts que l'utilisateur avait tapés avant de commencer.
- **Bénéfice TDAH** : Agit comme une "sauvegarde de jeu vidéo" pour le cerveau. Contrecarre l'amnésie de la mémoire de travail typique après une distraction, permettant de se replonger immédiatement dans l'état mental précédent.

## 19. "Reality Gamification" (Santé Cognitive)
- **Ce qui a été fait** : Ajout d'une nouvelle ligne de métriques sur le Dashboard dédiée à la neurodiversité.
- **Le concept** : Au lieu d'afficher "Heures facturables" (qui crée de la honte si on n'a rien fait), on affiche des métriques d'effort cognitif :
  - **Stabilité du Focus** : Pourcentage de temps passé dans un état actif.
  - **Résilience** : Nombre de fois où l'utilisateur a évité une distraction avec succès.
  - **Hyperfocus** : Nombre de sessions ininterrompues de plus de 45 minutes.
- **Bénéfice TDAH** : Récompense les *bons comportements* de gestion de l'attention plutôt que les résultats financiers purs, créant une boucle de gamification beaucoup plus saine et motivante.

---

# Phase 7 : L'Intent Memory Layer (Miroir Cognitif)

Cette phase s'attaque à la "dérive intentionnelle" (quand on commence avec une intention précise mais qu'on dérive vers une autre tâche sans s'en rendre compte).

## 20. "Cognitive Mirror" (Le miroir déculpabilisant)
- **Ce qui a été fait** : Interception de la fin du chronomètre pour afficher une modale de synthèse comportementale.
- **Le concept** : Lorsqu'on arrête le timer manuellement, l'application ne s'arrête plus silencieusement. Elle affiche un Miroir Cognitif :
  1. Elle te rappelle ton **Intention Initiale** (ex: *"Je voulais écrire la facture"*).
  2. Elle te montre ta **Répartition Réelle** basée sur l'activité en arrière-plan (ex: *12 min sur Chrome, 9 min sur Outlook*).
  3. Elle t'encourage avec bienveillance : *"La dérive est le processus naturel d'un cerveau explorateur."*
- **Bénéfice TDAH** : Ce n'est plus du "Time Tracking" (punition), c'est de l'"Attention Tracking" éducatif. Cela permet de prendre conscience de ses véritables patterns de travail (ex: la préparation invisible qui précède souvent l'action) et de refermer la boucle d'attention consciemment.

---

# Phase 8 : Reality Split Mode (Le Miroir du Temps)

Cette phase adresse l'anxiété liée au temps subjectif, en séparant visuellement le temps qu'on "pense" avoir travaillé du temps "réellement" concentré.

## 21. "Reality Split Bar" (Widget de vérité temporelle)
- **Ce qui a été fait** : Ajout d'une double jauge au sommet du Dashboard principal.
- **Le concept** :
  - 🟢 **Temps Déclaré (Subjectif)** : Affiche le nombre d'heures enregistrées via le Timer. C'est l'illusion temporelle.
  - 🔴 **Focus Profond (Réel)** : Affiche le temps filtré par le Desktop Agent (sans les moments "inactifs", sans les distractions).
  - **Ratio de Focus** : Un pourcentage bien en évidence qui montre l'efficacité réelle de la journée.
- **Bénéfice TDAH** : En voyant noir sur blanc que sur 4 heures "travaillées", il n'y a eu qu'1h30 de focus réel profond, l'utilisateur arrête de se juger sur la *durée* ("Je suis nul, je ne fais rien en 4h") et commence à optimiser la *qualité* cognitive. C'est un puissant déculpabilisant temporel.

---

# Phase 9 : Behavioral Replay Mode (Timeline Visuelle)

Cette fonctionnalité permet une relecture vidéo mentale de l'attention de l'utilisateur.

## 22. "Mental Timeline" (La relecture simplifiée)
- **Ce qui a été fait** : Intégration d'une timeline comportementale horizontale dans la modale du Miroir Cognitif.
- **Le concept** : Lors de l'arrêt du chrono, on affiche le rythme de la session :
  - 🟢 **Segment Vert** : Blocs de pur focus productif.
  - 🔴 **Segment Rouge** : Moments de dérive (réseaux, sites non liés).
  - ⚪ **Segment Gris** : Interruptions ou inactivité du système.
  - *Interactivité* : Survoler les blocs affiche exactement l'application et la durée.
- **Bénéfice TDAH** : Le TDAH catastrophise souvent une distraction ("J'ai passé 1h sur Facebook !"). La timeline lui prouve visuellement que sa dérive n'a duré que 4 minutes, entourée de 20 minutes de focus vert. Il apprend que l'attention fluctue et qu'il est capable de revenir à sa tâche.

---

# Phase 10 : Invisible Assistant Mode (L'aboutissement)

Cette ultime phase déplace l'application du navigateur vers le système d'exploitation, pour une expérience sans aucune friction. L'utilisateur "oublie que l'app existe".

## 23. Le "Spotlight TDAH" (Global Hotkey Brain Dump)
- **Ce qui a été fait** : Programmation de l'Agent Desktop Electron pour capturer mondialement le raccourci `Ctrl+Shift+Espace`.
- **Le concept** : Que l'utilisateur soit dans Word, sur un site web, ou dans un jeu vidéo, s'il a une idée parasite, il appuie sur `Ctrl+Shift+Espace`.
  - Une barre de recherche flottante minimaliste apparaît au milieu de l'écran.
  - Il tape son idée, fait `Entrée`.
  - La barre disparaît instantanément. L'idée est envoyée silencieusement à l'intelligence en arrière-plan.
- **Bénéfice TDAH** : **0 friction. 0 risque de dérive.** S'il devait ouvrir le Dashboard web pour écrire son idée, il verrait ses anciens projets, cliquerait sur un rapport, et perdrait 40 minutes. Ici, il décharge son cerveau en 3 secondes sans quitter son flux de travail visuel. L'outil est devenu son véritable exosquelette cognitif.

---

# Phase 11 : Post-Hoc Truth System (Le Miroir de Réalité)

Le TDAH souffre de cécité temporelle ("Time Blindness") et surestime constamment la qualité de son temps de travail. Ce système corrige sa perception *après coup*.

## 24. "Reality Check" de fin de session
- **Ce qui a été fait** : La modale de fin de session a été scindée en deux étapes obligatoires.
- **Le concept** :
  - **Étape 1 : L'Estimation.** L'application demande "À quel point as-tu l'impression d'avoir avancé ?" via un slider de 0 à 100%. L'utilisateur est forcé de quantifier son impression *avant* de voir les données.
  - **Étape 2 : La Confrontation.** L'application affiche le contraste : "Tu pensais être à 60%, la réalité est que tu n'as été en focus profond que 18% du temps". 
- **Bénéfice TDAH** : C'est brutal mais salvateur. L'utilisateur TDAH arrête de se flageller en pensant : "Je suis nul, j'ai travaillé 3h et je n'ai rien fini !". Il lit plutôt : "Ton cerveau n'a réellement produit que pendant 25 minutes sur ces 3 heures, c'est normal que ce ne soit pas fini". Il apprend ainsi à calibrer son effort et à optimiser sa densité de focus plutôt que sa durée.
