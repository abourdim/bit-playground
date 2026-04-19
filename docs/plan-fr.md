# micro:bit Playground — Feuille de route de développement

## Vision

Un **panneau de contrôle BLE sans installation, axé vie privée et convivial pour les enfants** pour le BBC micro:bit V2. Un seul fichier HTML, appairé via Web Bluetooth, débloquant 8 onglets de capteurs, servos, graphiques en direct et modèles 3D. Pas de backend, pas de tracking, pas de compte.

Public cible : enseignants animant des ateliers STEM · familles en école à la maison · clubs de robotique · makers prototypant des projets BLE.

---

## Architecture

| Couche | Techno | Notes |
|-------|------|-------|
| UI | HTML5 + CSS3 | 3900+ lignes de styles thématisés, 30+ custom properties, 4 thèmes |
| Script | Vanilla JS ES6+ | 9 fichiers modulaires dans `js/`, sans build |
| Graphiques | Chart.js + plugin Annotation | Chargé via CDN, mis en cache hors ligne |
| 3D | Three.js r128 | 5 modèles enregistrés sur `window.board3dModels` |
| BLE | Web Bluetooth API | Service Nordic UART, MTU 20 octets, découpage auto |
| Firmware | MakeCode TypeScript | `makecode.ts` — capteurs, servos, buzzer, LED, mode simulation |
| Hors ligne | Service Worker | PWA cache-first, installable via `manifest.json` |
| Stockage | localStorage | ~10 clés couvrant thème, onglet, étalonnage, trim, préréglages |
| i18n | `js/lang.js` custom | 367+ clés · EN / FR / AR avec RTL complet |
| Tests | `tests.html` | Suite de tests unitaires inline |

---

## ✅ Livré

### V1.2.0 — 2026-04-18 *(actuelle)*
- Refonte majeure de `guide.html` — interactif, illustré, trilingue.
- SVG d'architecture · grille de compatibilité navigateurs · storyboard firmware · schéma des broches · machine d'état · carte des onglets.
- Terrain de jeu LED interactif avec lecture hex en direct.
- Échantillons de couleur de thème · clavier illustré avec mise en évidence du raccourci actif.
- Sélecteur de symptômes à 12 cartes · arbre de décision · galerie d'icônes · recette de hard-reset.
- Tout le nouveau contenu en EN / FR / AR avec reflow RTL.

### V1.0.1 — 2026-04-18
- Nouveaux paliers de `LICENSE` — personnel / mono-utilisateur · usage site multi-enseignants.
- Matériel de distribution arabe aligné avec l'UI V8.2 RTL (aucun changement de code).

### V1.0 — 2026-04-18
- Première release packagée.
- Ajout de `LICENSE` (mono-utilisateur, pas de redistribution).
- `SETUP.md` démarrage rapide 5 minutes.
- README éclaté : callout démarrage rapide + section licence.

### V8.2 — Multi-langue & Drapeaux SVG
- `js/lang.js` — 367+ clés de traduction en EN / FR / AR.
- Système `t()` + `data-i18n` pour 200+ éléments HTML.
- RTL complet pour l'arabe (direction, inversion flex, swap de marge/padding).
- Drapeaux SVG inline (Royaume-Uni · France · Algérie) — fonctionne sous Windows où les emojis drapeau échouent.
- Palette « garçon-friendly » : suppression du rose/magenta/arc-en-ciel, remplacés par bleus/cyans/ambres.
- `guide.html` autonome avec bascule de langue.

### Points forts V8.x et antérieurs
- Quatre thèmes : Stealth · Neon · Arctic · Blaze.
- Manifest PWA + service worker.
- 5 modèles Three.js avec synchro capteurs en direct.
- Graphique Chart.js avec Simuler / Enregistrer / Relecture / PNG / CSV / Annotations / Plein écran.
- Étalonnages boussole, zéro accéléromètre, base son & lumière.
- Trim servo (Expert).
- Protections de conflits de broches dans le firmware (flags servo1/servo2/buzzer).
- Superposition d'onboarding (affichée une fois).
- Raccourcis clavier : Space, 1–8, P, F, K, Esc.
- Notifications toast (succès / erreur / warning / info).

---

## 🛣 Prochains jalons

### V1.1 — Passe de polissage
- [ ] Audit d'accessibilité — rôles ARIA, navigation clavier uniquement, reduced-motion
- [ ] Audit contraste couleurs pour les thèmes Arctic et Blaze (cible AA)
- [ ] Refonte mobile-first des onglets Moteurs et Graphique (actuellement orienté bureau)
- [ ] Rafraîchissement de la superposition d'onboarding — 4 étapes illustrées en SVG
- [ ] Remplacer l'onglet Bench caché par un vrai tiroir « Developer Console »
- [ ] Corriger les tics RTL restants dans l'onglet 3D (direction des curseurs en arabe)

### V1.2 — Graphique & Données
- [ ] Superposition multi-capteurs (glisser des capteurs sur le même axe)
- [ ] Export vers Google Sheets via TSV collable
- [ ] Bibliothèque de sessions — enregistrer N sessions dans localStorage avec vignettes
- [ ] Vue FFT / domaine de fréquence pour le micro
- [ ] Statistiques sur fenêtre glissante (moyenne, écart-type, min/max)

### V1.3 — Focus robotique
- [ ] Mode chorégraphie — enregistrer/relire séquences servo + GamePad
- [ ] Support 4 servos (ajouter P8 / P12 pour épaule + coude)
- [ ] Nouveau modèle 3D : Hexapode (6 servos)
- [ ] Simulateur physique robot-buggy dans le style du Jeu d'équilibre
- [ ] Fusion capteurs : flux « orientation » dérivé d'accel + boussole

### V1.4 — Outils de classe
- [ ] Tableau de bord enseignant — 1 enseignant, plusieurs micro:bits via onglets appairés
- [ ] Relecture de session partagée (déposer un JSON, scrubber la timeline)
- [ ] Générateur de plan de leçon imprimable
- [ ] Constructeur de fiche élève (embarquer des graphiques en images)
- [ ] Système de badges / XP pour la gamification d'ateliers

### V1.5 — Écosystème
- [ ] Extension MakeCode miroir du protocole UART
- [ ] Portage firmware Python / CircuitPython-friendly
- [ ] Profil fallback optionnel BBC micro:bit V1 (son désactivé, warning affiché)
- [ ] Mode radio-groupe — une carte relais, mesh de classe

### À-ne-pas-oublier / idées ouvertes
- [ ] Commande vocale → motif LED (« montre un cœur »)
- [ ] Séquenceur buzzer style MIDI au clavier
- [ ] Superposition webcam épinglée à l'onglet 3D (pour démos photo-réalistes)
- [ ] Uploader de firmware custom via WebUSB (zapper MakeCode)
- [ ] Sync cloud local-only via File System Access API (pointer vers un dossier Dropbox)

---

## Principes techniques

1. **Single-page, single file d'abord** — un `index.html` + un petit dossier `js/`.
2. **Vanilla JS, pas de framework** — pas de build, pas de bundler, zéro dépendance sauf Chart.js et Three.js (via CDN, cachés hors ligne).
3. **Amélioration progressive** — 3D et graphiques doivent dégrader proprement si GPU / Chart.js indisponible.
4. **Vie privée d'abord** — pas d'analytics, pas de logins, pas de cloud. `localStorage` est le seul store.
5. **Hors ligne d'abord** — le service worker cache tout au premier chargement.
6. **Toujours trilingue** — toute nouvelle chaîne livrée doit avoir EN + FR + AR.
7. **Mode Débutant / Expert** — les fonctionnalités puissantes sont cachées derrière un toggle Expert pour garder l'UI conviviale pour les enfants.
8. **Le protocole BLE est le contrat** — navigateur et firmware communiquent en lignes texte UART. Documenté dans le README. Ajoutez des fonctionnalités sans casser les parseurs existants.

---

## Tests & CI

- `tests.html` — tests unitaires inline (encodage hex matrice LED, maths d'étalonnage, parseurs protocole).
- Matrice de test manuelle : Chrome Windows · Chrome macOS · Chrome Android · Edge Windows. Plus un rechargement hors ligne après install.
- Smoke test par release : flasher le firmware, appairer, parcourir 8 onglets, enregistrer + relire, exporter CSV, changer de thème, changer de langue (les 3).

---

## Distribution

- Principal : téléchargement numérique Etsy (ZIP de `index.html` + `makecode.ts` + `docs/` + `SETUP.md` + `LICENSE`).
- Mises à jour à vie via le mécanisme Etsy « annonce mise à jour » — les acheteurs retéléchargent depuis leur page Achats.
- Trois paliers de licence : Mono-utilisateur · Site école (≤30 enseignants) · District / OEM.
- Pas de mirror GitHub public — la licence mono-utilisateur interdit la redistribution.
