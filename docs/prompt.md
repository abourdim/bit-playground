# micro:bit Playground — AI Helper Prompt

Paste this into Claude, ChatGPT, or another assistant so it has the right context when helping you extend, debug, or document this app.

---

## What the app is

**micro:bit Playground** is a browser-based Bluetooth Low Energy (BLE) control panel for the BBC micro:bit V2. It runs 100% in the browser — no backend, no account, no build step. Users flash a one-file MakeCode firmware (`makecode.ts`) once, then open `index.html` in Chrome or Edge to pair over Web Bluetooth and get 8 tabs of interactive tools.

**Target audience:** kids (8–16), teachers running STEM workshops, home-schooling families, robotics clubs, makers prototyping BLE projects.

**Current version:** v1.2.0 (April 2026).

---

## Design principles

- Kid-friendly but serious and educational.
- Privacy first — no cloud, no accounts, no tracking. `localStorage` only.
- Offline-capable PWA via `sw.js` + `manifest.json`.
- Zero dependencies except Chart.js and Three.js (both via CDN, both cached offline).
- Vanilla JS, no framework, no build step, no bundler.
- Trilingual: every new string needs EN + FR + AR (with RTL for Arabic).
- Four themes: Stealth (dark default), Neon (cyberpunk), Arctic (light), Blaze (warm light).
- Beginner mode vs Expert mode — power features (raw JSON, Bench tab, Expert-only widgets) hide behind a toggle.

---

## Architecture

```
micro:bit V2  ◄──── BLE UART 20-byte MTU ────►  Browser app
  makecode.ts                                    index.html + js/*.js + styles.css
  (sensors, LEDs, servos, buzzer, simulate)     (Chart.js + Three.js, 4 themes, 3 languages)
```

**Scripts, loaded in order (all deferred):**

1. `js/core.js` — DOM refs, event bus, toasts, keyboard shortcuts, logging.
2. `js/ble.js` — connect / disconnect / 3-retry auto-reconnect, UART chunking.
3. `js/sensors.js` — parse telemetry, update sensor UI, push data to graph + 3D.
4. `js/controls.js` — LED matrix, buzzer, tabs, Bench, theme picker, init.
5. `js/servos.js` — servo sliders, gauges, trim.
6. `js/others.js` — More tab: fun controls, joystick, timer, presets, debug, data capture.
7. `js/graph.js` — Chart.js, recording, fullscreen, annotations, export.
8. `js/models/*.js` — 5 Three.js models register on `window.board3dModels`.
9. `js/board3d.js` — engine, model loader, animation loop.

**Plus** `js/lang.js` for i18n (367+ keys, EN/FR/AR, `t()` + `data-i18n`).

---

## BLE Protocol

### Browser → micro:bit (commands)
```
TEXT:<string>               Scroll text on LED
LM:<hex10>                  5×5 LED matrix as hex
CMD:<icon>                  HEART, SMILE, SAD, CLEAR, FIRE, UP, DOWN, LEFT, RIGHT
SERVO1:<0-180> | SERVO1:OFF
SERVO2:<0-180> | SERVO2:OFF
BUZZ:<freq>,<ms> | BUZZ:OFF
CAL:COMPASS                 Trigger compass calibration game
SIMULATE:ON | SIMULATE:OFF  Firmware generates demo data
TAB:<name>                  Notify firmware of active tab
BENCH:<cmd>                 Raw bench commands (Expert)
JSON:{...}                  Raw JSON payload (Expert)
OTHER:*                     More-tab widgets (see README for full list)
```

### micro:bit → browser (telemetry)
```
TEMP:<°C>
LIGHT:<0-255>
SOUND:<0-255>               V2 only
ACC:<x>,<y>,<z>             mg
COMPASS:<0-360>
BTN:A:<0|1>                 Also B, P0, P1, P2, LOGO
LEDS:<r0>,<r1>,<r2>,<r3>,<r4>
GRAPH:<label>:<value>       Custom graph data — auto-creates a colored line
SIMULATE:ACK:ON
CAL:COMPASS:DONE
HELLO                       Sent once on connect
```

### Connection details
- Service UUID: `6e400001-b5a3-f393-e0a9-e50e24dcca9e` (Nordic UART).
- RX write characteristic: `…002…`. TX notify: `…003…`.
- MTU payload: 20 bytes, auto-chunking for longer messages.
- Device filter: name starts with `BBC micro:bit`.
- Auto-reconnect: 3 attempts, 2 s apart. User-initiated disconnect does NOT retry.

### Pin conflict guards (firmware)
- `servo1Active` skips touch P1 polling while servo 1 is on.
- `servo2Active` skips touch P2.
- `buzzerActive` skips touch P0.
- Sending `SERVO1:OFF` clears the flag and re-enables touch.

---

## localStorage keys

```
mb_theme              stealth | neon | arctic | blaze
mb_active_tab         last active tab name
mb_graph_sensors      JSON: graph sensor checkbox states
mb_onboarded          "1" after onboarding dismissed
mb_calibration        JSON: accel offset, sound/light baselines, compass status
mb_servo1_trim        -15 to +15 (Expert)
mb_servo2_trim        -15 to +15
mb_board3d_model      microbit | buggy | arm | balance | weather
mb_other_presets      JSON: saved widget states from More tab
```

---

## Style guide

```css
:root {
  --bg: #020617;         /* Stealth navy */
  --accent: #22c55e;     /* primary green */
  --accent2: #22d3ee;    /* Neon cyan */
  --text: #e2e8f0;
  --muted: #94a3b8;
  --card: #0b1226;
  --border: #1e293b;
}

/* Alt themes apply via [data-theme="neon" | "arctic" | "blaze"] */
```

- Fonts (Google Fonts): **Orbitron** for headings / tech, **Inter** for body, **JetBrains Mono** for code.
- 3D pill buttons with hover-lift, press-shrink, ripple-flash.
- Primary buttons pulse with a soft glow.
- Tab buttons: active tab has an animated underline.
- Toasts slide in from the top-right, auto-dismiss after 3 s.

---

## Common tasks

**Add a new sensor**
1. Parse the UART line in `js/sensors.js`.
2. Add a display card + sparkline in the Sensors tab HTML.
3. Emit an event on the bus for `graph.js` to pick up.
4. Wire a `data-i18n` key + add EN/FR/AR translations in `js/lang.js`.

**Add a new graph label**
Nothing to do on the browser side — any `GRAPH:<label>:<value>` line auto-creates a colored line. Just send it from `makecode.ts`.

**Add a new 3D model**
1. Create `js/models/<name>.js` registering on `window.board3dModels`.
2. Export `create()`, `update(ctx)`, `destroy()`.
3. Add it to the dropdown in the 3D tab HTML.
4. Store selection in `mb_board3d_model`.

**Add a new theme**
1. Add a `[data-theme="yourtheme"]` block overriding the 30+ CSS custom properties.
2. Add the theme to the header dropdown.
3. Update `mb_theme` allowed values.

**Add a new language**
1. Add a language block to `js/lang.js` with all 367+ keys.
2. Add the flag SVG to the header dropdown.
3. For RTL languages, flip `dir="rtl"` on `<html>` and verify flex reversal.

---

## Testing

- `tests.html` has inline unit tests (LED hex encoding, calibration math, parsers).
- Manual matrix: Chrome Win · Chrome macOS · Chrome Android · Edge Win. Offline reload once.
- Per-release smoke: flash firmware → pair → 8 tabs → record/replay → CSV export → all 4 themes → all 3 languages.

---

## What NOT to add

- ❌ Frameworks (React, Vue, Svelte, etc). Keep it vanilla.
- ❌ A build step (Webpack, Vite, esbuild). Keep it copy-paste-open.
- ❌ Analytics, telemetry, or any network call beyond CDN-cached Chart.js + Three.js.
- ❌ Logins or accounts. All state is `localStorage`.
- ❌ Backends. This is a static single-page app forever.
- ❌ Emojis in source code files unless the user explicitly asks for them — they already appear plenty in the UI.
- ❌ Features that break the BLE protocol contract documented in the README. Extend, don't replace.

---

## If you're building something new

Start by reading `README.md` (the full technical reference) and `CHANGELOG.md` (what's been done). Then pick a next milestone from `docs/plan.md`. Keep changes minimal, self-contained, and trilingual. Write to the BLE protocol by adding new verbs, not repurposing old ones.

Happy hacking. 🎮🤖
