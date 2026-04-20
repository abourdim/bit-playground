# Assets marketing — version française

Ensemble complet des visuels et textes marketing pour un client ou une
inscription Etsy en français. Tout a été généré à partir de l'app
exécutée en français (via `#lang=fr`), avec narration TTS française
(voix Hortense), et textes rédigés en français natif.

## Contenu

### 📸 Captures d'écran — `screenshots/` (58 fichiers)

L'application entièrement en français, dans toutes les modes du
capturer : onglets standards + synthétiques, paires avant/après,
thèmes (stealth/neon/arctic/blaze), modèles 3D, personas (enseignant
arctic / enfant neon / maker blaze), preuve hors ligne, callouts SVG,
et 4 ratios d'aspect (9:16 / 1:1 / 2:3 / 16:9) pour chaque onglet hero.

Chaque PNG a son fichier `.alt.txt` d'accompagnement avec le texte alt
Etsy optimisé pour le SEO français.

### 🎯 Images héros Etsy — `heroes/` (3 fichiers, 1500×1500)

- `hero-fr-teacher.png` — angle enseignant, thème arctic, accent rouge
- `hero-fr-kid.png` — angle enfant, thème neon, accent vert
- `hero-fr-maker.png` — angle maker, thème blaze, accent orange

À uploader dans les slots 1, 9 et l'image rotative bannière Etsy.

### 🎬 Vidéo courte — `theme-morph.mp4` + `.gif`

6 secondes en 1:1 carré, fondu croisé entre les 4 thèmes en UI
française. Pour les épingles Pinterest et les carrousels Instagram.

### 📱 GIFs de démo — `gifs/`

- `ledmatrix-heart.gif` — dessin progressif d'un cœur sur la matrice
- `graph-record.gif` — graphique de capteurs en simulation
- `3d-tilt-sweep.gif` — balayage d'inclinaison 3D
- `theme-swap.gif` — rotation des 4 thèmes

Chaque fichier est fourni en MP4 + GIF.

### ⚡ Preuve de rapidité — `speed-test/`

- `speed-test.mp4` (608 Ko) + `.gif` — démo "3,2 secondes jusqu'aux
  données" avec incrustations françaises (DÉMARRAGE → CONNEXION → ✓
  DONNÉES EN DIRECT). L'argument qui lève le doute des enseignants.

### ✍️ Banque de légendes A/B — `captions/captions.md`

5 titres hero × 5 sous-titres × 5 légendes sociales × 5 légendes
Pinterest × 5 objets de mail, pour chacun des 3 personas. À piocher
selon les tests Etsy hebdomadaires.

### ♿ Pack accessibilité — `accessibility/`

- `audio-descriptions/*.wav` — 6 descriptions audio de 30 secondes
  (voix Hortense fr-FR) pour les élèves malvoyants
- `audio-descriptions/*.txt` — transcriptions pour lecteurs DAISY
- `braille/*.brl` — 9 fichiers Braille Unicode Grade 1 français
- `braille/printable.html` — feuille combinée prête pour embosseur

Conforme aux exigences procurement des académies françaises
(RGAA 4, référentiel général d'amélioration de l'accessibilité).

### 🖨️ Affiche + flyer — `print/`

- `poster-a3.pdf` / `.png` — affiche A3 portrait (297×420mm) prête à
  l'impression. À afficher dans les salles STEM et fablabs.
- `flyer-a4.pdf` / `.png` — flyer A4 portrait (210×297mm) à distribuer
  aux enseignants. Pitch + démarrage 60 secondes + QR code.

QR code étiqueté `utm_medium=print` pour attribuer le trafic via Etsy
Stats.

### 💬 Chatbot d'avant-vente — `chatbot/`

- `embed.js` (~6 Ko) — widget à intégrer dans la page de démo live
- `faq-rules.json` — 12 règles en français (iPad/Safari, Chrome/Edge,
  installation, micro:bit V2, hors ligne, licence école, firmware,
  langues, mises à jour, confidentialité, CSV, servos)
- `embed.html` — extrait de code d'intégration
- `api-stub-worker.js` — backend Cloudflare Worker pour le mode LLM

## Assets partagés

Ces fichiers sont dans `output/` (racine) mais s'appliquent aussi au
listing français :

- `narrated/etsy-video-v1-fr.mp4` — vidéo narrée de 60 secondes avec
  voix Hortense + sous-titres français incrustés (5,6 Mo)
- `../etsy-video-v1-fr-silent.mp4` — version silencieuse à uploader
  dans le slot vidéo Etsy (muet par défaut, avec sous-titres)

## Régénération

Relancer toute la chaîne française en une commande :

```bash
node etsy-package/tools/build-localized.mjs fr
```

Ou un outil individuel :

```bash
node etsy-package/tools/capture-screenshots.mjs --lang fr
node etsy-package/tools/theme-morph.mjs --lang fr
# etc.
```

## Où utiliser

Voir `etsy-package/MARKETING-GUIDE.md` (en) pour la correspondance
slot-par-slot Etsy/Pinterest/YouTube/Instagram. Les recommandations
s'appliquent directement : échangez simplement `output/<fichier>` par
`output/fr/<fichier>` pour le listing francophone.

---

*Généré le 2026-04-20. Toute la chaîne est idempotente — relancez
`build-localized.mjs fr` quand vous changez l'app ou la config.*
