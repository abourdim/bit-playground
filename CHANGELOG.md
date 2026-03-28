# 📋 Changelog

All notable changes to the **micro:bit Playground** project.

---

## V8.1 — Others Tab, Firmware Viewer & Bug Fixes *(current)*

### ✨ Others Tab — Full Widget Wiring
All 30+ widgets in the More tab now have working JavaScript handlers:
- **Fun Controls**: Button, Switch, Slider, Keypad, Joystick (new 5-button D-pad)
- **Indicators**: LED toggle, Level bar, Live Graph, Multi-Graph, Debug Console, Data Capture (CSV export)
- **Audio/Time**: Buzzer, Timer/Stopwatch, Delay Action, Random generator
- **Advanced**: Mode selector, Numeric input, Dual range, Color picker, Presets (save/load), Global reset/clear, Theme selector
- **Hardware**: XY Pad (pointer drag), LED Matrix, Sensor simulators, Pin control, Servo, RGB Strip

### 🤖 Firmware Viewer
- "micro:bit Firmware" button in the connection card
- Modal overlay with full makecode.ts code (embedded for file:// support)
- Copy Code button with clipboard API + fallback
- Open MakeCode link

### 🤖 Firmware Handlers (makecode.ts)
New handlers for: MODE (show initial on LED), XY (plot on 5x5), RANDOM/NUMBER (show on LED), RANGE_MIN/MAX (bar graph), COLOR (diamond flash), DELAYED_ACTION (target + beep)

### 📈 Graph Annotations
- Added chartjs-plugin-annotation CDN — annotations now render on the chart

### 📱 PWA Offline Fix
- Chart.js, Three.js, and annotation plugin CDN URLs added to service worker cache (v6)

### 🐛 Bug Fixes
- Fixed 3D micro:bit model crash: null guards for logo, buttonA, buttonB in update()
- Fixed Object.assign position errors (6 instances) — Three.js position is read-only
- Reset all mesh references in destroy() to prevent stale access
- Routed OTHER:ACK firmware responses to Others tab response area + debug console

---

## V7.0 — 3D Model System

### 🎲 5 Interactive 3D Models
Replaced the single micro:bit board + 8 style system with 5 distinct interactive models, each driven by different sensor data:

| Model | File | Lines | Driven By |
|-------|------|-------|-----------|
| 🎲 micro:bit V2 | `models/microbit.js` | 208 | LEDs, accel, buttons, pins, logo, temp |
| 🚗 Robot Buggy | `models/buggy.js` | 191 | Servo1 (wheels), accel (steering), light (headlights) |
| 🦾 Robot Arm | `models/arm.js` | 168 | Servo1 (rotate), servo2 (lift), btnA/B (gripper) |
| 🎯 Balance Game | `models/balance.js` | 217 | Accel X/Y (physics ball on tilting platform) |
| 🌦️ Weather Station | `models/weather.js` | 297 | Temp, light, sound, compass |

### 🏗️ Modular Architecture
- **Engine rewrite**: `board3d.js` (229 lines) — scene, camera, orbit, model registry, animation
- **Model protocol**: each model registers on `window.board3dModels` with `create()`, `update(D)`, `destroy()`
- **Hot-swap**: dropdown switches models instantly, no page reload
- **Persistence**: selected model saved to `localStorage` (`mb_board3d_model`)

### 📡 New Data Hooks
- `sensors.js`: added `board3dUpdate('light')` and `board3dUpdate('sound')` hooks
- `servos.js`: added `board3dUpdate('servo1')` and `board3dUpdate('servo2')` on send + OFF

### 🐛 LED Sync Fix (3 bugs)
1. **Polling invisible**: `ledState` was `let`-scoped, invisible inside board3d IIFE → changed to `window.ledState`
2. **Presets don't sync**: CMD:HEART/SMILE/SAD now update `window.ledState` + visual grid
3. **Drawing doesn't sync**: `setLed()` now writes both local + `window.ledState`

### Files Changed
- `board3d.js` — rewritten (861 → 229 lines, engine only)
- `controls.js` — `window.ledState`, CMD patterns update grid
- `sensors.js` — +2 hooks (light, sound)
- `servos.js` — +4 hooks (servo1/2 send + OFF)
- `index.html` — model dropdown, 5 model script tags
- `sw.js` — v4 cache with model files
- `README.md` — 5 models docs, architecture diagram
- **Added**: `js/models/` directory with 5 model files

---

## V6.0 — 3D Board, LED Firmware Sync, 8 Styles

### 🎲 3D Board Tab
- Full Three.js r128 scene with interactive micro:bit V2 model
- Manual orbit controls: drag rotate, scroll zoom, touch pinch
- Detailed geometry: PCB (rounded ExtrudeGeometry), 5×5 LED matrix, buttons A/B, USB, battery, 5 pin holes with gold torus rings, logo touch, processor chip, sensor chip, speaker grille, antenna
- Shadow-mapped lighting (ambient + directional + fill + rim)

### 📡 Live Data Sync (9 hooks)
- `board3dUpdate('accel')` → board tilts smoothly
- `board3dUpdate('temp')` → PCB color tints blue→red
- `board3dUpdate('btnA/btnB')` → buttons depress + green glow
- `board3dUpdate('touchP0/P1/P2')` → per-pin gold pulse
- `board3dUpdate('logo')` → logo glows
- `board3dUpdate('compass')` → heading stored
- `board3dUpdate('leds')` → full LED state from firmware

### 📡 Firmware LED Telemetry
- Firmware reads `led.point(col, row)` for all 25 LEDs every 250ms
- Encodes rows as 5-bit values: `LEDS:<r0>,<r1>,<r2>,<r3>,<r4>`
- Only sends on change; browser decodes and pushes to 3D
- Falls back to polling `window.ledState` for older firmware

### 🎨 8 Visual Styles *(removed in V7)*
Classic, Realistic, Cartoon, X-Ray, Blueprint, Neon, Crystal, Retro — each with unique PCB/LED/background materials.

### Files Changed
- **Added**: `js/board3d.js` (860 lines)
- `index.html` — new 3D tab, canvas, controls
- `styles.css` — `.board3d-container`, controls, info pills (~80 lines)
- `sensors.js` — `LEDS:` parser, 9 `board3dUpdate` calls
- `controls.js` — CMD preset click delegation for 3D
- `makecode.ts` — V6.0 header rewrite, LEDS: telemetry loop
- `sw.js` — v3 cache with board3d.js

---

## V5.0 — Calibration, Comprehensive Improvements

### 🎯 Calibration System (4 types)
- **Compass**: sends `CAL:COMPASS`, firmware triggers `input.calibrateCompass()`, responds `CAL:COMPASS:DONE`
- **Accelerometer Zero**: samples 10 readings, stores offset in localStorage
- **Sound / Light Baseline**: samples ambient levels as zero reference
- **Servo Trim** (Expert): ±15° offset per servo, persisted

### 🔔 Toast Notifications
- Non-blocking pop-ups for connect/disconnect/errors/actions
- Color-coded: green (success), blue (info), amber (warning), red (error)
- Auto-dismiss after 3s, stackable

### ⌨️ Keyboard Shortcuts
- `Space` → connect/disconnect
- `1-8` → switch tabs
- `P` → pause graph
- `F` → fullscreen graph
- `K` → code snippets
- `Esc` → exit fullscreen/close overlays

### 📱 PWA & Mobile
- Service worker with offline caching
- `manifest.json` for install-to-homescreen
- Mobile layout: scrollable tabs, stacked sensors, 350px 3D at 480px breakpoint

### 🎯 Onboarding
- First-visit welcome overlay with feature highlights
- Dismisses permanently (`mb_onboarded` in localStorage)

### 📖 Code Snippets
- Collapsible MakeCode examples in Graph tab
- Shows how to send custom `GRAPH:` data from firmware

### ⏺ Session Recording
- Record all incoming data points with timestamps
- Replay at original speed
- Export as JSON

---

## V4.0 — Graph Tab, Checkbox Sync, Fun Styling

### 📈 Graph Tab
- Chart.js real-time plotting with 5 graph types: Line, Bar, Scatter, Area, Realtime
- 10 sensor checkboxes: Accel X/Y/Z, Compass, Sound, Light, Temp, Touch P0/P1/P2
- Custom data via `GRAPH:<label>:<value>` from firmware
- Window size options: 50/100/200/500 points
- Y-axis: Auto or preset ranges
- `spanGaps: true` for continuous lines
- 10 colorblind-friendly colors

### Graph Actions
- 🎲 Simulate — firmware generates Sine/Random/Ramp demo data
- ⏸ Pause/Resume, 🗑 Clear (removes custom datasets too)
- 🔲 Fullscreen (targets whole card, Esc to exit)
- 📝 Annotations, 📷 PNG export, 📄 CSV export

### ✅ Checkbox Sync Fix
- Graph sensor checkboxes persist via localStorage (`mb_graph_sensors`)
- State restored on page load

### 🎨 Fun Button Styling
- 3D pill shape with inner highlight and shadow
- Bounce hover, press-down click, ripple flash
- Per-action colors (simulate=green, record=red, pause=amber, etc.)
- Active tab animated glowing underline

---

## V3.0 — Themes, Deep Audit

### 🎨 4 Themes
| Theme | Description |
|-------|-------------|
| 🌑 Stealth | Dark navy/purple (default) |
| 💜 Neon | Cyberpunk pink/purple glow |
| 🧊 Arctic | Clean white/blue |
| 🔥 Blaze | Warm amber/orange light |

Theme picker in Controls tab, persisted to localStorage (`mb_theme`).

### 🔍 Deep Audit Fixes
- Removed duplicate touch polling loop in firmware
- Removed P1/P2 `onPinPressed`/`onPinReleased` handlers (servo conflict)
- Added buzzer pin guard (`buzzerActive` flag)
- Added Others tab Servo OFF button
- Capped message log at 500 entries
- Capped bench responses at 100 entries

---

## V2.0 — BLE Audit, Pin Conflicts

### 🔌 BLE Audit (4 fixes)
- Fixed `compassHeadingValueEl` wrong DOM ID
- Fixed sensor state element IDs (removed wrong fallbacks)
- Cleaned dead DOM refs from `core.js`
- Added typeof guard for `updateServoGauge` in `sensors.js`

### 📌 Pin Conflict Fix
- Replaced tab-based touch guards with per-servo state flags
- `servo1Active`/`servo2Active`/`buzzerActive` guard touch polling
- Per-pin granularity: servo1 on P1 doesn't block touch P2

---

## V1.0 — Initial Fixes & Modularization

### Phase 1 — Critical (5 fixes)
1. Renamed `settings.ts` → `pxt.json`
2. Fixed servo race condition (cancel flags)
3. Removed French comment
4. Added browser-side buzzer validation
5. Added UART message chunking (20-byte MTU)

### Phase 2 — Structural (5 fixes)
6. Deduplicated CSS (61 lines removed)
7. Replaced MutationObserver with EventTarget
8. Added BLE auto-reconnect (3 attempts)
9. Scoped global variables in firmware
10. Reduced unnecessary tab notifications

### Phase 3 — Modularization (5 fixes)
11. Chart.js offline note
12. Split `script.js` into 6 modules (core, ble, sensors, controls, servos, others)
13. Added ARIA & keyboard navigation
14. Added try/catch to UART parsing
15. Added unit tests (`tests.html`)

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Total JS | ~3,860 lines across 12 files |
| HTML | ~1,715 lines |
| CSS | ~3,984 lines |
| Firmware | ~810 lines (TypeScript) |
| 3D Models | 5 (1,310 lines total) |
| Tabs | 8 (Controls, Sensors, Motors, GamePad, Graph, 3D, Bench, More) |
| Themes | 4 |
| Telemetry Types | 14 |
| Commands | 13 |
| localStorage Keys | 8 |
| Keyboard Shortcuts | 10 |
