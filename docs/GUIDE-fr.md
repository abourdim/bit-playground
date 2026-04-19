# micro:bit Playground — Guide utilisateur

> **micro:bit Playground** — Un panneau de contrôle BLE basé navigateur pour le BBC micro:bit V2.
> Zéro installation, zéro compte, zéro backend. Tout fonctionne localement dans Chrome ou Edge.

---

## Démarrage rapide (5 minutes)

1. Flashez `makecode.ts` sur votre **BBC micro:bit V2** depuis [makecode.microbit.org](https://makecode.microbit.org/) (coller en mode JavaScript → Télécharger → glisser le `.hex` sur le lecteur MICROBIT).
2. Quand la carte affiche une icône **X**, elle diffuse en BLE.
3. Ouvrez `index.html` dans **Chrome** ou **Edge** (bureau ou Chrome Android).
4. Cliquez **🔗 Connecter au micro:bit**, choisissez votre carte dans le sélecteur.
5. La pastille d'état passe au **vert** → vous êtes en ligne. Essayez les 8 onglets.

Guide détaillé : [start-fr.html](start-fr.html). FAQ acheteur : [faq-fr.html](faq-fr.html).

---

## Prérequis

- **BBC micro:bit V2** (V1 marche mais n'a pas de capteur sonore).
- Câble USB pour flasher, piles ou USB pour l'alimentation.
- **Chrome** ou **Edge** bureau · **Chrome** Android.
- Bluetooth 4.0+ (BLE) activé sur votre ordinateur.
- HTTPS ou `file://` — un double-clic sur le HTML fonctionne parfaitement.

### Compatibilité navigateurs

| Navigateur | État |
|---|---|
| Chrome bureau | ✅ Recommandé |
| Edge bureau | ✅ Pris en charge complet |
| Chrome Android | ✅ Fonctionne bien |
| Safari macOS | ⚠️ Drapeau expérimental requis |
| Firefox | ❌ Pas de Web Bluetooth |
| Safari iOS / iPadOS | ❌ Non pris en charge par Apple |

---

## Les 8 onglets

### 1 · 🎛 Contrôles
- **Défilement de texte** — tapez un message, il défile sur les LEDs.
- **Matrice LED** — cliquez/glissez pour peindre un motif 5×5, envoi en hexa (`LM:1F0E040000`).
- **Préréglages** — Cœur ❤, Sourire 😊, Coche ✔ (un clic).
- **Commandes** — HEART / SMILE / SAD / CLEAR / FIRE / flèches.
- **Buzzer** — curseur de fréquence (20–20 000 Hz), durée, 4 préréglages.
- **JSON personnalisé** (Expert uniquement) — envoi brut `JSON:{…}`.

### 2 · 👀 Capteurs
Valeurs en direct + mini-courbes, rafraîchies toutes les 100–200 ms :
- 🌡 Température (°C)
- 💡 Lumière (0–255)
- 🔊 Son (V2 uniquement, 0–255)
- 🏃 Accéléromètre X / Y / Z (mg)
- 🧭 Cap boussole (0–360°)
- 🔘 Boutons A & B
- ✋ Touches P0 / P1 / P2 + Logo

**Panneau d'étalonnage** (tous déclenchés par l'utilisateur, persistés dans localStorage) :

| Étalonnage | Comment |
|---|---|
| 🧭 Boussole | Cliquez Étalonner → inclinez la carte pour remplir l'écran |
| ⚖️ Zéro accélération | Posez à plat → Définir niveau |
| 🔊 Base sonore | Pièce calme → Définir ambiance |
| 💡 Base lumineuse | Éclairage normal → Définir ambiance |
| 🔧 Trim servo (Expert) | Onglet Moteurs — curseur −15° à +15° par servo |

### 3 · ⚙️ Moteurs
- **Servo 1** sur P1 · **Servo 2** sur P2.
- Curseur 0°–180° + saisie numérique + jauge visuelle.
- Le bouton **OFF** libère le PWM et réactive le tactile sur cette broche.
- L'envoi d'un angle servo désactive automatiquement le polling tactile sur sa broche par sécurité.

### 4 · 🎮 GamePad
- Croix ⬆⬇⬅➡ + bouton 🔥 FIRE.
- Envoie `CMD:UP / DOWN / LEFT / RIGHT / FIRE` sur UART.
- Parfait pour piloter des robots ou jouer à des jeux LED.

### 5 · 📈 Graphique
- **5 types de graphiques** — Ligne · Barres · Nuage · Aire · Temps réel (oscilloscope).
- **Cases à cocher capteurs** — Accel X/Y/Z, Boussole, Son, Lumière, Temp, Touche P0/P1/P2.
- **Étiquettes personnalisées** — tout `GRAPH:<label>:<value>` envoyé par le firmware crée automatiquement une ligne colorée.
- **10 couleurs adaptées au daltonisme**.
- **Contrôles** — taille de fenêtre · axe Y · épaisseur de ligne · grille.
- **Actions** — Simuler · Pause · Effacer · Plein écran · Enregistrer · Relecture · Sauvegarder · Note · PNG · CSV.

### 6 · 🎲 Carte 3D
Modèles Three.js animés par les données de capteurs en direct. Glissez pour pivoter, molette pour zoomer :

| Modèle | Animation via |
|---|---|
| 🎲 micro:bit V2 | LEDs, inclinaison, boutons, broches, logo, teinte température |
| 🚗 Robot Buggy | Servo 1 (direction), Accel, LEDs, Lumière, Bouton A |
| 🦾 Bras robotisé | Servo 1 (base), Servo 2 (élévation), Boutons A/B (pince) |
| 🎯 Jeu d'équilibre | Accel X/Y (simulation physique, balle sur plateforme) |
| 🌦 Station météo | Temp, Lumière, Son, Boussole |

Contrôles : sélecteur de modèle · Réinitialiser la vue · Rotation Auto · Live Sync.

### 7 · 🔧 Bench (Expert)
- Envoyez des commandes brutes `BENCH:PING / STATUS / RESET`.
- Réponses du firmware visibles en ligne.
- Espace de prototypage et débogage.

### 8 · ✨ Plus
**Contrôles ludiques** (toujours visibles) : Bouton · Interrupteur · Curseur · Clavier · Joystick.
**Expert uniquement** : Indicateur LED · Barre de niveau · Graphique live · Multi-Graphique · Console Debug · Capture de données · Buzzer · Minuteur · Action retardée · Aléatoire · Sélecteur de mode · Saisie numérique · Double plage · Sélecteur de couleur · Préréglages · Réinitialisation globale · Thème · Pad XY · Matrice LED · Simulateurs de capteurs · Contrôle broche · Servo · Ruban RGB · E/S fichier.

---

## Raccourcis clavier

| Touche | Action |
|---|---|
| `Space` | Pause / Reprise du graphique |
| `1`–`8` | Changer d'onglet (Contrôles · Capteurs · Moteurs · GamePad · Graphique · 3D · Bench · Plus) |
| `P` | Superposition des préréglages |
| `F` | Graphique plein écran |
| `K` | Effacer le graphique |
| `Esc` | Fermer la superposition / quitter le plein écran |

Référence complète : [cheatsheet-fr.html](cheatsheet-fr.html).

---

## Thèmes

| Thème | Apparence |
|---|---|
| 🌙 **Stealth** (par défaut) | Bleu nuit foncé `#020617` avec accents verts |
| ⚡ **Neon** | Lueur cyan cyberpunk, bordures animées |
| ☁️ **Arctic** | Thème clair net — idéal projecteur |
| 🔥 **Blaze** | Thème clair ambre chaleureux |

Basculez depuis l'en-tête ou l'onglet Plus. Sélection enregistrée dans localStorage.

## Langues

EN 🇬🇧 · FR 🇫🇷 · AR 🇩🇿 (mise en page RTL complète). 367+ clés, sauvegardées par appareil.

---

## Aide-mémoire protocole BLE

### Entrant (micro:bit → navigateur)
```
TEMP:23
LIGHT:142
SOUND:87
ACC:120,-45,-980
COMPASS:274
BTN:A:1
BTN:LOGO:0
LEDS:10,31,31,14,4
GRAPH:Distance:42
```

### Sortant (navigateur → micro:bit)
```
TEXT:Hello!
LM:1F0E040000
CMD:HEART
SERVO1:90
SERVO1:OFF
BUZZ:440,200
CAL:COMPASS
SIMULATE:ON
```

Référence complète dans le `README.md` du projet.

### Détails de connexion
- UUID de service : `6e400001-b5a3-f393-e0a9-e50e24dcca9e` (Nordic UART)
- Charge MTU : 20 octets (découpage automatique)
- Reconnexion auto : 3 tentatives, espacées de 2 s
- Filtre d'appareil : nom commençant par `BBC micro:bit`

---

## Dépannage

### Le bouton "Connecter" ne fait rien
Vous êtes sur Safari, Firefox ou un iPhone. Passez à Chrome ou Edge (bureau ou Chrome sur Android).

### Le micro:bit n'apparaît pas dans la fenêtre d'appairage
1. La carte affiche-t-elle un **X** ? Sinon, reflashez `makecode.ts`.
2. Bluetooth activé dans l'OS (pas seulement le navigateur) ?
3. Votre dongle Bluetooth est-il 4.0+ (BLE) ? Les anciens ne parlent que le Classic.
4. Fermez `chrome://bluetooth-internals` s'il est ouvert — il peut bloquer le scan.

### "Inclinez pour remplir l'écran" au boot
Ancien firmware. Reflashez le `makecode.ts` courant de votre téléchargement. Le firmware actuel ne déclenche l'étalonnage boussole que lorsque vous cliquez **Étalonner** dans l'onglet Capteurs.

### Le capteur sonore lit 0
Vous avez un V1. Passez au V2 ou acceptez l'absence de son (tout le reste fonctionne).

### Déconnexions après quelques secondes
Rapprochez-vous, changez les piles ou reflashez. L'appli se reconnecte automatiquement 3 fois.

### Le servo rend les lectures tactiles folles
Attendu — le PWM sur une broche rend le tactile inutilisable. Cliquez **OFF** à côté du servo pour libérer la broche.

### Le modèle 3D est lent
Fermez d'autres onglets. Désactivez Rotation Auto. Essayez le modèle léger micro:bit V2. Coupez Live Sync un instant.

### Le plein écran graphique ne se ferme pas
Appuyez **Esc**, ou recliquez l'icône ⛶.

---

## Notes pour enseignants

### Déroulé d'atelier (45 minutes)
1. **0–10 min** — Tout le monde flashe le firmware depuis MakeCode. Montrer un X sur l'écran LED.
2. **10–20 min** — Appairer en BLE. Essayer l'Onglet 1 (Contrôles) et l'Onglet 2 (Capteurs).
3. **20–35 min** — Choisir un thème de projet (buggy, station météo, jeu d'équilibre). Utiliser l'Onglet 6 (3D) pour visualiser.
4. **35–45 min** — Enregistrer une session graphique d'1 minute (Onglet 5). Exporter CSV pour une leçon de suivi.

### Conseils de classe
- Utilisez le thème **Arctic** ou **Blaze** pour la clarté au projecteur.
- Un micro:bit + un ordinateur portable par binôme. Le BLE est appairé par onglet de navigateur.
- Désactivez Rotation Auto dans l'Onglet 6 pour que les élèves ne soient pas distraits.
- Le bouton **Simuler** de l'Onglet 5 génère des données démo sans capteurs — utile quand le matériel est partagé.
- Activez le mode **Expert** seulement pour les élèves plus grands — masque les pièges du JSON brut pour les débutants.

### Idées de leçons
- 🚗 **Robot buggy** — GamePad + Servos pour piloter un bot, regarder le Buggy 3D le reproduire.
- 🦾 **Bras robotisé** — contrôler 2 servos, voir le Bras 3D répondre en temps réel.
- 🌡️ **Station météo** — tracer la température et la lumière, animer la Station météo 3D.
- 🎯 **Jeu d'équilibre** — incliner la carte pour rouler une balle à travers des cibles.
- 🎵 **Sonomètre** — surveiller le bruit avec annotations.
- 📊 **Journalisme de données** — enregistrer une session, exporter PNG + CSV.

### Sécurité
- Considérez les servos micro:bit comme 5V — alimentation externe recommandée pour les charges à fort couple.
- Le buzzer est fort — démarrez à 50 % de volume.
- Portée BLE ~10 m en ligne directe ; murs et micro-ondes réduisent drastiquement.

---

## Clés localStorage

| Clé | Rôle |
|---|---|
| `mb_theme` | Thème sélectionné |
| `mb_active_tab` | Dernier onglet actif |
| `mb_graph_sensors` | État des cases de capteurs du graphique |
| `mb_onboarded` | Onboarding fermé |
| `mb_calibration` | Offset accel, bases son/lumière |
| `mb_servo1_trim` / `mb_servo2_trim` | Offsets de trim servo |
| `mb_board3d_model` | Dernier modèle 3D utilisé |
| `mb_other_presets` | États de widgets sauvegardés de l'onglet Plus |

---

## Pour aller plus loin

- [cheatsheet-fr.html](cheatsheet-fr.html) — raccourcis clavier, états BLE, thèmes
- [faq-fr.html](faq-fr.html) — FAQ acheteur
- [start-fr.html](start-fr.html) — première prise en main
- [../README.md](../README.md) — référence technique complète
- [../CHANGELOG.md](../CHANGELOG.md) — historique des versions
- [../SETUP.md](../SETUP.md) — configuration en 5 minutes

---

*micro:bit Playground v1.2.0 — Connecter · Explorer · Créer · Jouer.*
