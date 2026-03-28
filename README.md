# 🎮 micro:bit Playground

### *Connect • Explore • Create • Play*

A **web-based control panel** for the **BBC micro:bit V2** over **Bluetooth Low Energy (BLE)**.
Built for learning, teaching, hacking, and having fun — from beginners 🐣 to experts 🧙‍♂️.

> Runs entirely in your browser. No install, no backend, no stress.

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔗 BLE Connection | One-click Bluetooth pairing with auto-reconnect (3 attempts) |
| 🎛️ LED Matrix | Draw on a 5×5 grid, presets (heart, smile, tick), send hex patterns |
| 📡 Live Sensors | Temperature, light, sound, accelerometer, compass, buttons, touch pins |
| ⚙️ Servo Control | 2 servos on P1/P2 with sliders, gauges, and OFF buttons |
| 🎮 GamePad | D-pad + Fire button for games and robots |
| 📈 Live Graph | Chart.js-powered real-time plotting with 5 graph types |
| 🎲 Simulate Mode | Firmware generates demo data (Sine, Random, Ramp) |
| ⏺ Session Recording | Record, replay, and export sessions as JSON |
| 🔲 Fullscreen Graph | Expand chart to fill the entire screen |
| 📝 Annotations | Add timestamped notes directly on the graph |
| 🎨 4 Themes | Stealth (dark), Neon (cyberpunk), Arctic (light), Blaze (warm light) |
| 📖 Code Snippets | MakeCode examples built into the Graph tab |
| ⌨️ Keyboard Shortcuts | Space, 1-8, P, F, K, Esc |
| 🔔 Toast Notifications | Pop-up alerts for connect/disconnect/errors |
| 🎯 Onboarding | First-visit welcome overlay |
| 🎲 3D Board | 5 interactive Three.js models: micro:bit, Buggy, Arm, Balance, Weather |
| 📱 PWA | Installable, offline-capable progressive web app |
| 📱 Mobile Responsive | Scrollable tabs, stacked layout on small screens |
| 👶/🧙 Dual Mode | Beginner (safe, clean) and Expert (raw JSON, bench) |

---

## 📁 Project Structure

```
📦 micro:bit Playground
├── index.html         🧱 Main app (all 8 tabs, overlays, onboarding)
├── styles.css         🎨 3900+ lines of themed styles & animations
├── manifest.json      📱 PWA manifest for install-to-homescreen
├── sw.js              📦 Service worker for offline caching
├── logo.svg           🖼️ Animated project logo
├── makecode.ts        🤖 micro:bit firmware (TypeScript for MakeCode)
├── pxt.json           ⚙️ MakeCode project config
├── tests.html         🧪 Unit test suite
├── CHANGELOG.md       📋 Version history
├── README.md          📘 This file
└── js/
    ├── core.js        🏗️ Event bus, DOM helpers, logging, toasts, keyboard shortcuts
    ├── ble.js         📡 Bluetooth connect/disconnect/reconnect, UART chunking
    ├── sensors.js     📊 UART parsing, sensor display, calibration, graph + 3D hooks
    ├── controls.js    🎛️ LED matrix, buzzer, tabs, bench, theme, init
    ├── servos.js      ⚙️ Servo sliders, gauges, trim, 3D hooks
    ├── graph.js       📈 Chart.js graph, fullscreen, recording, annotations
    ├── board3d.js     🎲 3D engine: scene, camera, orbit, model switcher
    ├── others.js      ✨ Extra controls, joystick, timer, presets, debug, data capture
    └── models/
        ├── microbit.js 🎲 micro:bit V2 board
        ├── buggy.js    🚗 Robot Buggy
        ├── arm.js      🦾 Robot Arm
        ├── balance.js  🎯 Balance Game
        └── weather.js  🌦️ Weather Station
```

---

## 🚀 Getting Started

### 1. Requirements

- **BBC micro:bit V2** (V1 lacks sound sensor)
- USB cable or battery pack
- **Chrome** or **Edge** browser (Web Bluetooth required)
- Bluetooth enabled on your computer/phone

### 2. Flash the Firmware

1. Open [Microsoft MakeCode](https://makecode.microbit.org/)
2. Switch to **JavaScript** mode
3. Paste the contents of `makecode.ts`
4. Click **Download** and flash to your micro:bit
5. Power the micro:bit (USB or batteries)

The micro:bit will show an **X** icon — it's advertising BLE and waiting for a connection.

### 3. Open the App

1. Open `index.html` in Chrome or Edge
2. Click **🔗 Connect to micro:bit**
3. Select your device from the Bluetooth picker
4. The status chip turns **green** — you're connected! ✅

> **Tip**: First time? An onboarding overlay will guide you through the basics.

---

## 🧭 Tabs Guide

### 🎛️ Controls (Tab 1)
- **Text**: Type a message → scrolls on micro:bit LED display
- **LED Matrix**: Click to draw, drag to paint. Send pattern as hex.
- **Presets**: ❤️ Heart, 😊 Smile, ✔️ Tick — one-click icons
- **Commands**: HEART, SMILE, SAD, CLEAR, FIRE, arrows
- **Buzzer**: Frequency slider (20–20000 Hz), duration, presets (Low/Mid/High/Melody)
- **Custom JSON**: Send raw `JSON:{...}` commands (Expert mode only)

### 👀 Sensors (Tab 2)
Real-time sensor monitoring with mini sparkline charts:
- 🌡️ **Temperature** (°C)
- 💡 **Light** (0–255)
- 🔊 **Sound** (0–255)
- 🏃 **Accelerometer** X, Y, Z (mg)
- 🧭 **Compass** heading (0–360°)
- 🔘 **Buttons** A & B (pressed/released)
- ✋ **Touch** P0, P1, P2 + Logo

All values update every 100–200ms.

### ⚙️ Motors (Tab 3)
- **Servo 1** (P1) and **Servo 2** (P2)
- Slider 0°–180° + numeric input
- Visual gauge showing current angle
- **OFF** button to release PWM (frees pin for touch)

### 🎮 GamePad (Tab 4)
- ⬆⬇⬅➡ D-pad + 🔥 FIRE button
- Sends `CMD:UP`, `CMD:DOWN`, `CMD:LEFT`, `CMD:RIGHT`, `CMD:FIRE`
- Great for driving robots or playing games

### 📈 Graph (Tab 5)
- **5 graph types**: Line, Bar, Scatter, Area, Realtime (oscilloscope)
- **Sensor checkboxes**: Toggle Accel X/Y/Z, Compass, Sound, Light, Temp, Touch P0/P1/P2
- **Custom data**: Any `GRAPH:<label>:<value>` from firmware plots automatically
- **Options**: Window size (50/100/200/500), Y-axis (Auto or preset), line thickness, grid toggle
- **10 colorblind-friendly colors**: Red, Green, Blue, Amber, Purple, Yellow, Cyan, Pink, Orange, Teal
- **Actions**:
  - 🎲 **Simulate** — firmware generates Sine/Random/Ramp demo data
  - ⏸ **Pause/Resume** — freeze chart
  - 🗑 **Clear** — remove all data and custom datasets from legend
  - 🔲 **Fullscreen** — expand entire card to fill screen (Esc to exit)
  - ⏺ **Record** — capture all incoming data points
  - ▶ **Replay** — play back recorded session in real time
  - 💾 **Save Session** — export recording as JSON file
  - 📝 **Note** — add timestamped annotation on chart
  - 📷 **PNG** / 📄 **CSV** — export chart as image or spreadsheet data
- **Code Snippets**: Collapsible MakeCode examples
- Checkbox state persists across sessions via localStorage

### 🎲 3D Board (Tab 6)
Interactive Three.js models with live sensor data. Drag to rotate, scroll to zoom, touch pinch.

**5 Models** (dropdown selector, saved to localStorage):

| Model | What Animates | Data Used |
|-------|--------------|-----------|
| 🎲 **micro:bit V2** | LEDs, tilt, buttons, pins, logo, temp tint | All sensors |
| 🚗 **Robot Buggy** | Wheels spin, front steering, headlights, LED screen | Servo1, Accel, LEDs, Light, BtnA |
| 🦾 **Robot Arm** | Base rotates (Servo1), arm lifts (Servo2), gripper (BtnA/B) | Servo1, Servo2, BtnA, BtnB |
| 🎯 **Balance Game** | Ball rolls on tilting platform, targets to catch | Accel X/Y (physics sim) |
| 🌦️ **Weather Station** | Thermometer, sun/cloud/rain, wind vane, sound bars | Temp, Light, Sound, Compass |

**Architecture** (modular, 6 files):
- `board3d.js` (229 lines) — engine: scene, camera, orbit, model registry, animation loop
- `models/microbit.js` (208 lines) — V2 board with all components
- `models/buggy.js` (191 lines) — 4-wheel car with steering group
- `models/arm.js` (168 lines) — 2-joint arm with gripper
- `models/balance.js` (217 lines) — physics ball on platform
- `models/weather.js` (297 lines) — station with rain particles

Models register on `window.board3dModels` and expose `create()`, `update()`, `destroy()`.

**Controls:**
- 🎲 **Model selector** — dropdown to switch models instantly
- 🔄 **Reset View** — snap to model's default camera angle
- 🔁 **Auto Rotate** — continuous orbit
- 📡 **Live Sync** — toggle sensor-driven animations on/off
- Info pills: live accelerometer + temperature

### 🔧 Bench (Tab 7, Expert only)
- Send raw commands: `BENCH:PING`, `BENCH:STATUS`, `BENCH:RESET`
- View raw firmware responses
- Prototyping and debugging workspace

---

## ⚙️ Calibration System

All calibrations are **user-triggered only** (nothing happens at startup). Settings persist in `localStorage`.

### 🧭 Compass Calibration
- **Location**: Sensors tab → Calibration section
- **Action**: Click "Calibrate" → sends `CAL:COMPASS` to micro:bit
- **Firmware**: Triggers the built-in tilt-to-fill-screen calibration game
- **Response**: `CAL:COMPASS:DONE` → status shows "Calibrated ✅"
- **Requires**: BLE connection + firmware re-flash with updated `makecode.ts`

### ⚖️ Accelerometer Zero
- **Location**: Sensors tab → Calibration section
- **Action**: Place micro:bit flat → click "Set Level"
- **How it works**: Captures current X/Y/Z as offset, subtracts from all future readings
- **Display**: Shows offset values (e.g., `X:120 Y:-45 Z:-980`)
- **Reset**: Click "Reset" to clear offset
- **Storage**: Browser-side only, no firmware change needed

### 🔊 Sound / 💡 Light Baseline
- **Location**: Sensors tab → Calibration section
- **Action**: In quiet/normal conditions → click "Set Ambient"
- **How it works**: Captures current reading as baseline, subtracts from display and graph
- **Use case**: Show delta from ambient (e.g., "how much louder than background")
- **Reset**: Click "Reset" to clear baseline
- **Storage**: Browser-side only

### 🔧 Servo Trim (Expert mode)
- **Location**: Motors tab → below each servo's Move/Stop buttons
- **Action**: Adjust slider −15° to +15°
- **How it works**: Trim offset is added to angle before sending: `actual = requested + trim`
- **Display**: Activity log shows both requested and actual angle
- **Reset**: Click "Reset" to zero trim
- **Storage**: Saved per servo in `localStorage`

### ✨ More (Tab 8)

**Fun Controls** (always visible):
- 🔘 **Button** — press to trigger micro:bit LED flash
- ⏻ **Switch** — on/off toggle, shows tick/cross on micro:bit
- 🎚️ **Slider** — 0–100 value, plots as bar graph on micro:bit
- 🔢 **Keypad** — 3×3 number pad (1–9), shows pressed key on micro:bit
- 🕹️ **Joystick** — 5-button D-pad (up/down/left/right/center), shows arrows on micro:bit

**Indicators & Outputs** (Expert only):
- 💡 **LED indicator** — toggle on/off, plots center LED on micro:bit
- 📊 **Level bar** — progress bar display
- 📈 **Live Graph** — mini Chart.js single-line chart
- 📊 **Multi-Graph** — mini Chart.js multi-series chart
- 🧾 **Debug Console** — timestamped log with clear button
- 📄 **Data Capture** — sample table with CSV download

**Audio, Time & Random** (Expert only):
- 🎵 **Buzzer** — frequency slider + duration, sends `BUZZ:` to micro:bit
- ⏱️ **Timer** — start/stop/reset stopwatch (MM:SS.t format)
- ⏲️ **Delay Action** — schedule a delayed command (100–60000ms), triggers beep on micro:bit
- 🎲 **Random** — generate random 0–999, shows number on micro:bit LED

**Advanced Controls & Presets** (Expert only):
- 📂 **Mode selector** — idle/test1/test2/safe, shows mode initial on micro:bit
- 🔢 **Numeric input** — send any number (0–1000), shows on micro:bit LED
- 🏁 **Dual range** — min/max sliders (0–100), plots as bar graph on micro:bit
- 🎨 **Color picker** — send hex color, flashes diamond on micro:bit
- 💾 **Presets** — save/load widget states to localStorage
- 🧹 **Global reset** — reset all controls to defaults
- 🧹 **Global clear** — clear graphs and logs
- 🎭 **Theme** — switch themes from within the tab

**Simulators & Hardware** (Expert only):
- 📐 **XY Pad** — drag to send coordinates, plots dot on micro:bit 5×5 LED
- 🔲 **LED Matrix** — 5×5 mini grid, sends hex patterns
- 🌡️ **Sensor simulators** — temp/light/sound sliders for testing
- 🔌 **Pin control** — D0/D1/D2/D8/D12/D16 digital write + PWM P0
- ⚙️ **Servo** — angle + speed control with move/stop
- 💡 **RGB Strip** — 8-LED virtual strip, click to cycle colors (firmware placeholder)
- 📁 **File I/O** — file picker for data import

---

## 📡 BLE Protocol Reference

### Telemetry (micro:bit → browser)

| Message | Example | Description |
|---------|---------|-------------|
| `TEMP:<°C>` | `TEMP:23` | Temperature in Celsius |
| `LIGHT:<0-255>` | `LIGHT:142` | Ambient light level |
| `SOUND:<0-255>` | `SOUND:87` | Microphone sound level |
| `ACC:<x>,<y>,<z>` | `ACC:120,-45,-980` | Accelerometer (mg) |
| `COMPASS:<0-360>` | `COMPASS:274` | Compass heading (degrees) |
| `BTN:A:<0\|1>` | `BTN:A:1` | Button A state |
| `BTN:B:<0\|1>` | `BTN:B:0` | Button B state |
| `BTN:P0:<0\|1>` | `BTN:P0:1` | Touch pin P0 |
| `BTN:P1:<0\|1>` | `BTN:P1:0` | Touch pin P1 |
| `BTN:P2:<0\|1>` | `BTN:P2:1` | Touch pin P2 |
| `BTN:LOGO:<0\|1>` | `BTN:LOGO:0` | Logo touch (V2) |
| `LEDS:<r0>,<r1>,<r2>,<r3>,<r4>` | `LEDS:10,31,31,14,4` | Actual LED state (each row 0-31, for 3D sync) |
| `GRAPH:<label>:<value>` | `GRAPH:Distance:42` | Custom graph data |
| `SIMULATE:ACK:ON` | — | Simulation mode acknowledged |

### Commands (browser → micro:bit)

| Command | Example | Description |
|---------|---------|-------------|
| `TEXT:<string>` | `TEXT:Hello!` | Scroll text on LED |
| `LM:<hex10>` | `LM:1F0E040000` | Set 5×5 LED matrix (hex encoded) |
| `CMD:<icon>` | `CMD:HEART` | Show preset icon (HEART, SMILE, SAD, CLEAR, FIRE, UP, DOWN, LEFT, RIGHT) |
| `SERVO1:<angle>` | `SERVO1:90` | Set servo 1 angle (0–180) |
| `SERVO2:<angle>` | `SERVO2:45` | Set servo 2 angle (0–180) |
| `SERVO1:OFF` | — | Release servo 1 PWM |
| `SERVO2:OFF` | — | Release servo 2 PWM |
| `BUZZ:<freq>,<ms>` | `BUZZ:440,200` | Play tone at frequency for duration |
| `BUZZ:OFF` | — | Stop buzzer |
| `OTHER:BTN:PRESS` | — | Button press → LED flash |
| `OTHER:SWITCH:<ON\|OFF>` | `OTHER:SWITCH:ON` | Toggle → tick/cross on LED |
| `OTHER:SLIDER:<0-100>` | `OTHER:SLIDER:75` | Slider → bar graph on LED |
| `OTHER:JOY:<dir>` | `OTHER:JOY:UP` | Joystick → arrow on LED |
| `OTHER:KEY:<1-9>` | `OTHER:KEY:5` | Keypad → show digit on LED |
| `OTHER:LED:<ON\|OFF>` | `OTHER:LED:ON` | LED indicator → center LED |
| `OTHER:PIN:<pin>:<0\|1>` | `OTHER:PIN:D0:1` | Digital pin write |
| `OTHER:PWM:P0:<0-1023>` | `OTHER:PWM:P0:512` | PWM output on P0 |
| `OTHER:SERVO:<angle>,<speed>` | `OTHER:SERVO:90,5` | Servo via Others tab |
| `OTHER:MODE:<mode>` | `OTHER:MODE:TEST1` | Mode → show initial on LED |
| `OTHER:XY:<x>,<y>` | `OTHER:XY:0.50,0.25` | XY pad → dot on 5×5 LED |
| `OTHER:RANDOM:<n>` | `OTHER:RANDOM:42` | Random → show number on LED |
| `OTHER:NUMBER:<n>` | `OTHER:NUMBER:100` | Numeric → show number on LED |
| `OTHER:RANGE_MIN:<n>` | `OTHER:RANGE_MIN:20` | Range min → bar graph on LED |
| `OTHER:RANGE_MAX:<n>` | `OTHER:RANGE_MAX:80` | Range max → bar graph on LED |
| `OTHER:COLOR:<hex>` | `OTHER:COLOR:00ff00` | Color → diamond flash on LED |
| `OTHER:DELAYED_ACTION` | — | Delayed trigger → target icon + beep |
| `OTHER:STRIP:<i>:<hex>` | `OTHER:STRIP:0:ff0000` | RGB strip (firmware placeholder) |
| `BENCH:<cmd>` | `BENCH:PING` | Bench test command |
| `JSON:{...}` | `JSON:{"cmd":"test"}` | Raw JSON command |
| `SIMULATE:ON` | — | Start demo data generation |
| `SIMULATE:OFF` | — | Stop demo data generation |
| `CAL:COMPASS` | — | Trigger compass calibration game |
| `TAB:<name>` | `TAB:graph` | Notify firmware of active tab |
| `HELLO` | — | Sent on connect to confirm link |

### Pin Conflict Guards

The firmware prevents PWM/touch conflicts on shared pins:

| Flag | Pin | Effect |
|------|-----|--------|
| `servo1Active` | P1 | Skips touch P1 polling while servo is active |
| `servo2Active` | P2 | Skips touch P2 polling while servo is active |
| `buzzerActive` | P0 | Skips touch P0 polling while buzzer is active |

Sending `SERVO1:OFF` clears `servo1Active` and re-enables touch on P1.

### Simulate Mode

When the browser sends `SIMULATE:ON`, the firmware generates demo data every 200ms:

```
GRAPH:Sine:<0-100>       Smooth sine wave
GRAPH:Random:<0-100>     Random values
GRAPH:Ramp:<0-99>        Sawtooth ramp (resets at 100)
```

Firmware acknowledges with `SIMULATE:ACK:ON`. Send `SIMULATE:OFF` to stop.

---

## 🎨 Themes

| Theme | Style | CSS Approach |
|-------|-------|-------------|
| 🌙 **Stealth** | Dark, minimal, default | Base variables (no data-theme) |
| ⚡ **Neon** | Cyberpunk, glowing borders | `[data-theme="neon"]` overrides |
| ☁️ **Arctic** | Light, clean, high contrast | `[data-theme="arctic"]` overrides |
| 🔥 **Blaze** | Warm light, amber accents | `[data-theme="blaze"]` overrides |

Themes use **30+ CSS custom properties** (`--bg`, `--text`, `--accent`, `--card-bg`, etc.).
Chart colors, toast borders, overlay backgrounds all adapt automatically.
Theme selection saved to `localStorage`.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Connect / Disconnect |
| `1`–`8` | Switch tabs (Controls, Sensors, Motors, GamePad, Graph, 3D, Bench, More) |
| `P` | Pause / Resume graph |
| `F` | Fullscreen graph |
| `K` | Toggle shortcuts help overlay |
| `Esc` | Close overlays / exit fullscreen |

Press **K** anytime to see the shortcuts overlay in-app.

---

## 🔔 Toast Notifications

Pop-up alerts slide in from the top-right corner:

| Type | Color | Examples |
|------|-------|---------|
| ✅ Success | Green border | "Connected to micro:bit!" |
| ❌ Error | Red border | "Disconnected from micro:bit" |
| ⚠️ Warning | Amber border | "Reconnecting... (1/3)" |
| ℹ️ Info | Blue border | "Recording started", "Note added" |

Auto-dismiss after 3 seconds with slide-out animation.

---

## 🎯 Onboarding

First-time visitors see a welcome overlay with 4 steps:
1. Turn on your micro:bit V2
2. Click Connect and pick your device
3. Explore the tabs
4. Press K for keyboard shortcuts

Dismissed once → never shown again (stored in `localStorage`).

---

## 📱 PWA & Mobile

- **Installable**: Add to homescreen on Chrome/Edge via `manifest.json`
- **Offline**: Service worker (`sw.js`) caches all HTML, CSS, JS, assets, and CDN libraries (Chart.js, Three.js, annotation plugin)
- **Mobile responsive**:
  - Tabs scroll horizontally (no overflow/wrapping)
  - Header stacks vertically on narrow screens
  - Sensor grid switches to single column below 768px
  - Graph buttons and controls shrink at 480px
  - Touch-friendly button sizes throughout

---

## 🧪 Custom Graph Data from MakeCode

Send any value to the graph from your micro:bit firmware:

```typescript
// Plot a single value — creates a "Distance" line automatically
bluetooth.uartWriteLine("GRAPH:Distance:" + distance)

// Plot multiple values — each label gets its own colored line
bluetooth.uartWriteLine("GRAPH:Speed:" + speed)
bluetooth.uartWriteLine("GRAPH:Angle:" + angle)
bluetooth.uartWriteLine("GRAPH:Force:" + force)

// Binary signal — useful for event detection
if (input.soundLevel() > 150) {
    bluetooth.uartWriteLine("GRAPH:Loud:1")
} else {
    bluetooth.uartWriteLine("GRAPH:Loud:0")
}
```

The browser auto-creates a colored line for each unique label. No configuration needed.
Colors rotate through a palette of 10 colorblind-friendly colors.

---

## 🏗️ Architecture

```
┌──────────────┐     BLE UART      ┌────────────────────────┐
│  micro:bit   │ ◄──────────────► │   Browser App            │
│ (makecode.ts)│   20-byte chunks  │                          │
│  V6.0        │                   │  core.js    (bus, toasts)│
│              │                   │  ble.js     (connect)    │
│  Sensors ──────── TEMP:23 ──────►  sensors.js (parse)      │
│  LEDs    ◄──────  LM:1F0E... ───  controls.js (UI)        │
│  LEDs    ──────── LEDS:10,31.. ►  sensors.js → board3d    │
│  Servos  ◄──────  SERVO1:90 ────  servos.js  → board3d    │
│  Buzzer  ◄──────  BUZZ:440,200 ─  controls.js             │
│  Graph   ──────── GRAPH:X:42 ──►  graph.js   (chart)      │
│  Simulate ◄─────  SIMULATE:ON ──  graph.js                │
│  Calibrate ◄────  CAL:COMPASS ──  sensors.js              │
└──────────────┘                   └────────────────────────┘
                                          │
                                   board3d.js (3D engine)
                                   ┌──────┴──────┐
                                   │ model registry│
                                   ├──────────────┤
                                   │ microbit.js  │ ← LEDs, tilt, buttons, pins
                                   │ buggy.js     │ ← servo1, accel, light
                                   │ arm.js       │ ← servo1, servo2, btnA/B
                                   │ balance.js   │ ← accel X/Y (physics)
                                   │ weather.js   │ ← temp, light, sound, compass
                                   └──────────────┘
```

**Script load order** (all deferred):
1. `core.js` — DOM refs, event bus, toasts, keyboard shortcuts, logging
2. `ble.js` — BLE connect/disconnect/reconnect, UART chunking (20-byte MTU)
3. `sensors.js` — Parse incoming telemetry, update sensor UI, push data to graph + 3D
4. `controls.js` — LED matrix, buzzer, tabs, bench, theme picker, DOMContentLoaded init
5. `servos.js` — Servo sliders, gauges, trim, connection-aware enable/disable
6. `others.js` — Others tab: fun controls, joystick, timer, presets, debug console, data capture, XY pad
7. `graph.js` — Chart.js setup, datasets, recording, fullscreen, annotations, export
8. `models/*.js` — 5 model files register on `window.board3dModels`
9. `board3d.js` — 3D engine, loads saved model, starts animation loop

---

## 🔧 BLE Connection Details

| Property | Value |
|----------|-------|
| Service UUID | `6e400001-b5a3-f393-e0a9-e50e24dcca9e` (Nordic UART) |
| RX Characteristic (write) | `6e400002-b5a3-f393-e0a9-e50e24dcca9e` |
| TX Characteristic (notify) | `6e400003-b5a3-f393-e0a9-e50e24dcca9e` |
| MTU payload | 20 bytes (auto-chunking for longer messages) |
| Auto-reconnect | 3 attempts, 2s delay between each |
| Device filter | Name prefix `BBC micro:bit` |

User-initiated disconnect does **not** trigger auto-reconnect.

---

## 💾 localStorage Keys

| Key | Purpose |
|-----|---------|
| `mb_theme` | Selected theme name (stealth/neon/arctic/blaze) |
| `mb_active_tab` | Last active tab name |
| `mb_graph_sensors` | JSON of graph sensor checkbox states |
| `mb_onboarded` | "1" after onboarding dismissed |
| `mb_calibration` | JSON with accel offset, sound/light baselines, compass status |
| `mb_servo1_trim` | Servo 1 trim offset (-15 to +15) |
| `mb_servo2_trim` | Servo 2 trim offset (-15 to +15) |
| `mb_board3d_model` | 3D model name (microbit/buggy/arm/balance/weather) |
| `mb_other_presets` | JSON of saved Others tab widget presets |

---

## 🛠️ Technologies

| Tech | Usage |
|------|-------|
| HTML5 | Semantic markup, ARIA roles for accessibility |
| CSS3 | Custom properties, keyframe animations, 4-theme system, responsive media queries |
| JavaScript ES6+ | Vanilla, modular files, no build step needed |
| Chart.js + Annotation Plugin | Real-time charting with timestamped annotations (loaded via CDN, cached offline) |
| Three.js r128 | 3D model rendering: 5 interactive models (loaded via CDN) |
| Web Bluetooth API | BLE UART communication |
| Service Worker | Offline PWA caching |
| MakeCode TypeScript | micro:bit V2 firmware |

---

## ⚠️ Browser Compatibility

| Browser | BLE Support | Status |
|---------|-------------|--------|
| Chrome (desktop) | ✅ | Recommended |
| Edge (desktop) | ✅ | Full support |
| Chrome (Android) | ✅ | Works well |
| Safari (macOS) | ⚠️ | Experimental flag required |
| Firefox | ❌ | No Web Bluetooth |
| Safari (iOS) | ❌ | No Web Bluetooth |

> **Note**: HTTPS is required for Web Bluetooth (except `localhost`).

---

## 🎛️ Button Styling

All buttons feature fun, interactive styling:
- **3D pill shape** with inner highlight and shadow
- **Bounce hover** — buttons lift up and scale on hover
- **Press-down click** — shrinks on click for tactile feel
- **Ripple flash** on click
- **Primary buttons** pulse with a soft glow animation
- **Tab buttons** — active tab has a glowing animated underline
- **Graph action buttons** — each has its own color:
  - 🎲 Simulate: green (pulses when active)
  - ⏸ Pause: amber (glows when active)
  - ⏺ Record: red (pulses when recording)
  - 🗑 Clear: red flash on click
  - 🔲 Fullscreen: purple
  - ▶ Replay: green
  - 💾 Save: blue
  - 📝 Note: amber
  - 📷 PNG / 📄 CSV: blue

---

## 💡 Project Ideas

- 🚗 **Robot buggy** — GamePad + Servos to drive a bot, watch it move in the 3D Buggy model
- 🦾 **Robot arm** — Control 2 servos and see the 3D Arm respond in real time
- 🌡️ **Weather station** — Graph temperature and light, watch the 3D Weather Station animate
- 🎯 **Balance game** — Tilt the micro:bit and roll the ball to targets in 3D
- 🎵 **Sound meter** — Monitor noise levels with graph annotations
- 📐 **Motion tracker** — Record accelerometer sessions and export CSV
- 🎯 **Reaction game** — Buttons + buzzer + LED matrix
- 🏫 **Classroom dashboard** — Students connect and compare sensor data
- 🧪 **Science lab** — Export CSV data for spreadsheet analysis
- 📊 **Data journalism** — Record sessions, annotate, export PNG charts

---

## ❤️ Built For

- 👩‍🎓 Students learning electronics and coding
- 👨‍🏫 Teachers running STEM workshops
- 🧑‍💻 Makers prototyping BLE projects
- 🤖 Robot enthusiasts
- 🎉 Anyone curious about micro:bit

If you're smiling while using it — **mission accomplished** 😄

Happy hacking! 🚀🎮🤖
