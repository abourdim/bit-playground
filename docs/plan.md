# micro:bit Playground — Development Roadmap

## Vision

A **zero-install, privacy-first, kid-friendly BLE control panel** for the BBC micro:bit V2. One HTML file, paired over Web Bluetooth, unlocking 8 tabs of sensors, servos, live graphs, and 3D models. No backend, no tracking, no account.

Target audience: teachers running STEM workshops · home-schooling families · robotics clubs · makers prototyping BLE projects.

---

## Architecture

| Layer | Tech | Notes |
|-------|------|-------|
| UI | HTML5 + CSS3 | 3900+ lines of themed styles, 30+ custom properties, 4 themes |
| Scripting | Vanilla JS ES6+ | 9 modular files under `js/`, no build step |
| Charting | Chart.js + Annotation plugin | Loaded via CDN, cached offline |
| 3D | Three.js r128 | 5 models registered on `window.board3dModels` |
| BLE | Web Bluetooth API | Nordic UART service, 20-byte MTU, auto-chunking |
| Firmware | MakeCode TypeScript | `makecode.ts` — sensors, servos, buzzer, LED, simulate mode |
| Offline | Service Worker | Cache-first PWA, installable via `manifest.json` |
| Storage | localStorage | ~10 keys covering theme, tab, calibration, trim, presets |
| i18n | Custom `js/lang.js` | 367+ keys · EN / FR / AR with full RTL |
| Tests | `tests.html` | Inline unit test suite |

---

## ✅ Shipped

### V1.0.2 — 2026-04-18 *(current)*
- Major rewrite of `guide.html` — interactive, illustrated, trilingual.
- Architecture SVG · browser-compatibility grid · firmware storyboard · pin-out diagram · state machine · tab map.
- Interactive LED playground with live hex readout.
- Theme color swatches · illustrated keyboard with active shortcut highlighting.
- 12-card symptom picker · decision tree · icon gallery · hard-reset recipe.
- All new content in EN / FR / AR with RTL reflow.

### V1.0.1 — 2026-04-18
- New `LICENSE` tiers — personal / single-user · multi-teacher site use.
- Arabic distribution materials aligned with V8.2 RTL UI (no code changes).

### V1.0 — 2026-04-18
- First packaged release.
- `LICENSE` added (single-user, no redistribution).
- `SETUP.md` 5-minute quick-start.
- README split: quick-start callout + license section.

### V8.2 — Multi-language & SVG Flags
- `js/lang.js` — 367+ translation keys in EN / FR / AR.
- `t()` + `data-i18n` system for 200+ HTML elements.
- Full RTL for Arabic (direction, flex reversal, margin/padding swap).
- Inline SVG flags (UK · France · Algeria) — works on Windows where emoji flags fail.
- Boy-friendly palette: removed pink/magenta/rainbow, replaced with blues/cyans/ambers.
- Standalone `guide.html` with language toggle.

### V8.x and earlier highlights
- Four themes: Stealth · Neon · Arctic · Blaze.
- PWA manifest + service worker.
- 5 Three.js models with live sensor sync.
- Chart.js graph with Simulate / Record / Replay / PNG / CSV / Annotations / Fullscreen.
- Compass, accelerometer-zero, sound & light baseline calibrations.
- Servo trim (Expert).
- Pin conflict guards in firmware (servo1/servo2/buzzer flags).
- Onboarding overlay (shown once).
- Keyboard shortcuts: Space, 1–8, P, F, K, Esc.
- Toast notifications (success / error / warning / info).

---

## 🛣 Next milestones

### V1.1 — Polish pass
- [ ] Accessibility audit — ARIA roles, keyboard-only navigation, reduced-motion
- [ ] Color-contrast audit for Arctic and Blaze themes (AA target)
- [ ] Mobile-first rework of the Motors and Graph tabs (currently desktop-leaning)
- [ ] Onboarding overlay refresh — 4 steps illustrated with SVG
- [ ] Replace the hidden Bench tab with a proper "Developer Console" drawer
- [ ] Fix any remaining RTL quirks in 3D tab (slider direction in Arabic)

### V1.2 — Graphing & Data
- [ ] Multi-sensor graph overlay (drag sensors onto the same axis)
- [ ] Export to Google Sheets via paste-friendly TSV
- [ ] Session library — save N recordings in localStorage with thumbnails
- [ ] FFT / frequency-domain view for microphone
- [ ] Rolling window statistics (mean, std dev, min/max)

### V1.3 — Robotics focus
- [ ] Choreography mode — record/playback servo + GamePad sequences
- [ ] 4-servo support (add P8 / P12 for shoulder + elbow)
- [ ] New 3D model: Hexapod (6 servos)
- [ ] Robot-buggy physics simulator in Balance Game style
- [ ] Sensor fusion: derived "orientation" stream from accel + compass

### V1.4 — Classroom tools
- [ ] Teacher dashboard — 1 teacher, many micro:bits via paired browser tabs
- [ ] Shared session replay (drop a session JSON, scrub timeline)
- [ ] Printable lesson-plan generator
- [ ] Student worksheet builder (embed charts as images)
- [ ] Badge / XP system for workshop gamification

### V1.5 — Ecosystem
- [ ] MakeCode extension mirror of the UART protocol
- [ ] Python / CircuitPython-friendly firmware port
- [ ] Optional BBC micro:bit V1 fallback profile (sound disabled, warning shown)
- [ ] Radio-group mode — one board as relay, classroom mesh

### Nice-to-haves / open ideas
- [ ] Voice command → LED pattern ("show a heart")
- [ ] Keyboard-driven MIDI-style buzzer sequencer
- [ ] Webcam overlay pinned to the 3D Board tab (for photo-realistic robot demos)
- [ ] Custom firmware uploader via WebUSB (skip MakeCode entirely)
- [ ] Local-only cloud sync via File System Access API (point at a Dropbox folder)

---

## Technical principles

1. **Single-page, single file first** — one `index.html` + a small `js/` folder.
2. **Vanilla JS, no frameworks** — no build step, no bundler, zero dependencies except Chart.js and Three.js (both via CDN, both cached offline).
3. **Progressive enhancement** — 3D and graphs should fail gracefully if GPU / Chart.js aren't available.
4. **Privacy first** — no analytics, no logins, no cloud. `localStorage` is the only state store.
5. **Offline-first** — service worker caches everything on first load.
6. **Trilingual always** — every new string shipped needs EN + FR + AR.
7. **Beginner / Expert mode** — power features hide behind an Expert toggle to keep the UI friendly for kids.
8. **BLE protocol is the contract** — the browser and firmware talk UART text lines. Documented in the README. Add features without breaking existing parsers.

---

## Testing & CI

- `tests.html` — inline unit tests (LED matrix hex encoding, calibration math, protocol parsers).
- Manual test matrix: Chrome Windows · Chrome macOS · Chrome Android · Edge Windows. Plus one off-line reload after install.
- Per-release smoke test: flash firmware, pair, cycle through 8 tabs, record + replay, export CSV, switch themes, switch languages (all 3).

---

## Distribution

- Primary: Etsy digital download (ZIP of `index.html` + `makecode.ts` + `docs/` + `SETUP.md` + `LICENSE`).
- Lifetime updates via Etsy "listing updated" mechanism — buyers re-download from their Purchases page.
- Three license tiers: Single user · School Site (≤30 teachers) · District / OEM.
- No GitHub-public mirror — single-user license forbids redistribution.
