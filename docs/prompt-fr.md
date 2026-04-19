# micro:bit Playground — Prompt pour assistant IA

Collez ceci dans Claude, ChatGPT ou un autre assistant pour lui donner le bon contexte lorsqu'il vous aide à étendre, déboguer ou documenter cette appli.

---

## Ce qu'est l'appli

**micro:bit Playground** est un panneau de contrôle Bluetooth Low Energy (BLE) basé navigateur pour le BBC micro:bit V2. Il tourne à 100 % dans le navigateur — pas de backend, pas de compte, pas d'étape de build. Les utilisateurs flashent un firmware MakeCode d'un seul fichier (`makecode.ts`) une fois, puis ouvrent `index.html` dans Chrome ou Edge pour s'appairer via Web Bluetooth et obtenir 8 onglets d'outils interactifs.

**Public cible :** enfants (8–16 ans), enseignants animant des ateliers STEM, familles en école à la maison, clubs de robotique, makers prototypant des projets BLE.

**Version actuelle :** v1.2.0 (avril 2026).

---

## Principes de design

- Convivial pour enfants mais sérieux et éducatif.
- Vie privée d'abord — pas de cloud, pas de comptes, pas de tracking. `localStorage` uniquement.
- PWA capable hors ligne via `sw.js` + `manifest.json`.
- Zéro dépendance sauf Chart.js et Three.js (via CDN, cachées hors ligne).
- Vanilla JS, pas de framework, pas de build, pas de bundler.
- Trilingue : toute nouvelle chaîne doit avoir EN + FR + AR (avec RTL pour l'arabe).
- Quatre thèmes : Stealth (sombre par défaut), Neon (cyberpunk), Arctic (clair), Blaze (clair chaud).
- Mode Débutant vs mode Expert — les fonctionnalités puissantes (JSON brut, onglet Bench, widgets Expert) se cachent derrière un toggle.

---

## Architecture

```
micro:bit V2  ◄──── UART BLE MTU 20 octets ────►  Appli navigateur
  makecode.ts                                      index.html + js/*.js + styles.css
  (capteurs, LEDs, servos, buzzer, simulate)      (Chart.js + Three.js, 4 thèmes, 3 langues)
```

**Scripts, chargés dans l'ordre (tous deferred) :**

1. `js/core.js` — refs DOM, bus d'événements, toasts, raccourcis clavier, logs.
2. `js/ble.js` — connect / disconnect / reconnexion auto 3 tentatives, découpage UART.
3. `js/sensors.js` — parse la télémétrie, met à jour l'UI capteurs, pousse les données au graphique + 3D.
4. `js/controls.js` — matrice LED, buzzer, onglets, Bench, sélecteur de thème, init.
5. `js/servos.js` — curseurs servos, jauges, trim.
6. `js/others.js` — Onglet Plus : contrôles ludiques, joystick, minuteur, préréglages, debug, capture données.
7. `js/graph.js` — Chart.js, enregistrement, plein écran, annotations, export.
8. `js/models/*.js` — 5 modèles Three.js s'enregistrent sur `window.board3dModels`.
9. `js/board3d.js` — moteur, chargeur de modèles, boucle d'animation.

**Plus** `js/lang.js` pour i18n (367+ clés, EN/FR/AR, `t()` + `data-i18n`).

---

## Protocole BLE

### Navigateur → micro:bit (commandes)
```
TEXT:<string>               Faire défiler du texte sur les LEDs
LM:<hex10>                  Matrice LED 5×5 en hexa
CMD:<icon>                  HEART, SMILE, SAD, CLEAR, FIRE, UP, DOWN, LEFT, RIGHT
SERVO1:<0-180> | SERVO1:OFF
SERVO2:<0-180> | SERVO2:OFF
BUZZ:<freq>,<ms> | BUZZ:OFF
CAL:COMPASS                 Déclencher le jeu d'étalonnage boussole
SIMULATE:ON | SIMULATE:OFF  Le firmware génère des données démo
TAB:<name>                  Notifier le firmware de l'onglet actif
BENCH:<cmd>                 Commandes bench brutes (Expert)
JSON:{...}                  Charge utile JSON brute (Expert)
OTHER:*                     Widgets de l'onglet Plus (voir README pour la liste)
```

### micro:bit → navigateur (télémétrie)
```
TEMP:<°C>
LIGHT:<0-255>
SOUND:<0-255>               V2 uniquement
ACC:<x>,<y>,<z>             mg
COMPASS:<0-360>
BTN:A:<0|1>                 Aussi B, P0, P1, P2, LOGO
LEDS:<r0>,<r1>,<r2>,<r3>,<r4>
GRAPH:<label>:<value>       Donnée graphique personnalisée — crée une ligne colorée auto
SIMULATE:ACK:ON
CAL:COMPASS:DONE
HELLO                       Envoyé une fois à la connexion
```

### Détails de connexion
- UUID de service : `6e400001-b5a3-f393-e0a9-e50e24dcca9e` (Nordic UART).
- Caractéristique RX write : `…002…`. TX notify : `…003…`.
- Charge MTU : 20 octets, découpage auto pour messages plus longs.
- Filtre d'appareil : nom commençant par `BBC micro:bit`.
- Reconnexion auto : 3 tentatives, espacées de 2 s. Une déconnexion initiée par l'utilisateur n'entraîne PAS de retry.

### Protections de conflits de broches (firmware)
- `servo1Active` saute le polling tactile P1 tant que le servo 1 est actif.
- `servo2Active` saute P2.
- `buzzerActive` saute P0.
- Envoyer `SERVO1:OFF` remet le flag à zéro et réactive le tactile.

---

## Clés localStorage

```
mb_theme              stealth | neon | arctic | blaze
mb_active_tab         nom du dernier onglet actif
mb_graph_sensors      JSON : états des cases capteurs du graphique
mb_onboarded          "1" après fermeture de l'onboarding
mb_calibration        JSON : offset accel, bases son/lumière, statut boussole
mb_servo1_trim        -15 à +15 (Expert)
mb_servo2_trim        -15 à +15
mb_board3d_model      microbit | buggy | arm | balance | weather
mb_other_presets      JSON : états de widgets sauvegardés de l'onglet Plus
```

---

## Guide de style

```css
:root {
  --bg: #020617;         /* Stealth navy */
  --accent: #22c55e;     /* vert primaire */
  --accent2: #22d3ee;    /* cyan Neon */
  --text: #e2e8f0;
  --muted: #94a3b8;
  --card: #0b1226;
  --border: #1e293b;
}

/* Les thèmes alternatifs s'appliquent via [data-theme="neon" | "arctic" | "blaze"] */
```

- Polices (Google Fonts) : **Orbitron** pour titres / tech, **Inter** pour le corps, **JetBrains Mono** pour le code.
- Boutons pilule 3D avec hover-lift, press-shrink, ripple-flash.
- Les boutons primaires pulsent d'une douce lueur.
- Boutons d'onglet : l'onglet actif a un soulignement animé.
- Les toasts entrent en glissant depuis le haut-droit, auto-fermeture après 3 s.

---

## Tâches courantes

**Ajouter un nouveau capteur**
1. Parser la ligne UART dans `js/sensors.js`.
2. Ajouter une carte d'affichage + mini-courbe dans le HTML de l'onglet Capteurs.
3. Émettre un événement sur le bus pour que `graph.js` s'en saisisse.
4. Brancher une clé `data-i18n` + ajouter les traductions EN/FR/AR dans `js/lang.js`.

**Ajouter une nouvelle étiquette de graphique**
Rien à faire côté navigateur — toute ligne `GRAPH:<label>:<value>` crée automatiquement une ligne colorée. Envoyez-la simplement depuis `makecode.ts`.

**Ajouter un nouveau modèle 3D**
1. Créer `js/models/<name>.js` enregistré sur `window.board3dModels`.
2. Exporter `create()`, `update(ctx)`, `destroy()`.
3. L'ajouter au menu déroulant dans le HTML de l'onglet 3D.
4. Stocker la sélection dans `mb_board3d_model`.

**Ajouter un nouveau thème**
1. Ajouter un bloc `[data-theme="yourtheme"]` surchargent les 30+ custom properties CSS.
2. Ajouter le thème au menu d'en-tête.
3. Mettre à jour les valeurs autorisées pour `mb_theme`.

**Ajouter une nouvelle langue**
1. Ajouter un bloc de langue à `js/lang.js` avec les 367+ clés.
2. Ajouter le drapeau SVG au menu d'en-tête.
3. Pour les langues RTL, basculer `dir="rtl"` sur `<html>` et vérifier l'inversion flex.

---

## Tests

- `tests.html` contient des tests unitaires inline (encodage hex LED, maths d'étalonnage, parseurs).
- Matrice manuelle : Chrome Win · Chrome macOS · Chrome Android · Edge Win. Recharge hors ligne une fois.
- Smoke par release : flasher firmware → appairer → 8 onglets → enregistrer/relire → export CSV → les 4 thèmes → les 3 langues.

---

## Ce qu'il NE FAUT PAS ajouter

- ❌ Frameworks (React, Vue, Svelte, etc.). Restez vanilla.
- ❌ Une étape de build (Webpack, Vite, esbuild). Gardez le copier-coller-ouvrir.
- ❌ Analytics, télémétrie ou tout appel réseau au-delà de Chart.js + Three.js mis en cache CDN.
- ❌ Logins ou comptes. Tout l'état est dans `localStorage`.
- ❌ Backends. C'est une SPA statique pour toujours.
- ❌ Emojis dans le code source sauf demande explicite — l'UI en contient déjà plein.
- ❌ Fonctionnalités qui cassent le contrat du protocole BLE documenté dans le README. Étendre, pas remplacer.

---

## Si vous construisez quelque chose de nouveau

Commencez par lire `README.md` (la référence technique complète) et `CHANGELOG.md` (ce qui a été fait). Choisissez ensuite un prochain jalon dans `docs/plan.md`. Gardez les changements minimaux, auto-contenus et trilingues. Écrivez au protocole BLE en ajoutant de nouveaux verbes, pas en réutilisant d'anciens.

Bon hacking. 🎮🤖
