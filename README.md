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
| ⌨️ Keyboard Shortcuts | Space, 1-7, P, F, K, Esc |
| 🔔 Toast Notifications | Pop-up alerts for connect/disconnect/errors |
| 🎯 Onboarding | First-visit welcome overlay |
| 📱 PWA | Installable, offline-capable progressive web app |
| 📱 Mobile Responsive | Scrollable tabs, stacked layout on small screens |
| 👶/🧙 Dual Mode | Beginner (safe, clean) and Expert (raw JSON, bench) |

---

## 📁 Project Structure

```
📦 micro:bit Playground
├── index.html         🧱 Main app (all 7 tabs, overlays, onboarding)
├── styles.css         🎨 3700+ lines of themed styles & animations
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
    ├── sensors.js     📊 UART parsing, sensor display, graph hooks
    ├── controls.js    🎛️ LED matrix, buzzer, tabs, bench, theme, init
    ├── servos.js      ⚙️ Servo sliders, gauges, angle sending
    ├── graph.js       📈 Chart.js graph, fullscreen, recording, annotations
    └── others.js      ✨ Extra controls (LED, pin, PWM, joystick, servo2)
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

### 🔧 Bench (Tab 6, Expert only)
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

### ✨ More (Tab 7)
Extra controls for advanced use:
- Individual LED on/off control
- Digital/analog pin read & write
- PWM output (duty cycle + period)
- Additional servo with speed control
- Joystick input
- Debug console and data capture

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
| `OTHER:LED/<r>,<c>,<0\|1>` | `OTHER:LED/2,3,1` | Set individual LED |
| `OTHER:PIN/<mode><n>:<val>` | `OTHER:PIN/D0:1` | Digital/analog pin write |
| `OTHER:PWM/<pin>:<duty>,<period>` | `OTHER:PWM/0:512,20000` | PWM output |
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
| `1`–`7` | Switch tabs (Controls, Sensors, Motors, GamePad, Graph, Bench, More) |
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
- **Offline**: Service worker (`sw.js`) caches all HTML, CSS, JS, and assets
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
┌──────────────┐     BLE UART      ┌──────────────────┐
│  micro:bit   │ ◄──────────────► │   Browser App     │
│ (makecode.ts)│   20-byte chunks  │                   │
│              │                   │  core.js    (bus)  │
│  Sensors ──────── TEMP:23 ──────►  sensors.js (parse)│
│  LEDs    ◄──────  LM:1F0E... ───  controls.js (UI)  │
│  Servos  ◄──────  SERVO1:90 ────  servos.js  (PWM)  │
│  Buzzer  ◄──────  BUZZ:440,200 ─  controls.js       │
│  Graph   ──────── GRAPH:X:42 ──►  graph.js  (chart) │
│  Simulate ◄─────  SIMULATE:ON ──  graph.js          │
└──────────────┘                   └──────────────────┘
```

**Script load order** (all deferred):
1. `core.js` — DOM refs, event bus, toasts, keyboard shortcuts, logging
2. `ble.js` — BLE connect/disconnect/reconnect, UART chunking (20-byte MTU)
3. `sensors.js` — Parse incoming telemetry, update sensor UI, push data to graph
4. `controls.js` — LED matrix, buzzer, tabs, bench, theme picker, DOMContentLoaded init
5. `servos.js` — Servo sliders, gauges, connection-aware enable/disable
6. `others.js` — Others tab controls (individual LED, pin, PWM, joystick)
7. `graph.js` — Chart.js setup, datasets, recording, fullscreen, annotations, export

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

---

## 🛠️ Technologies

| Tech | Usage |
|------|-------|
| HTML5 | Semantic markup, ARIA roles for accessibility |
| CSS3 | Custom properties, keyframe animations, 4-theme system, responsive media queries |
| JavaScript ES6+ | Vanilla, modular files, no build step needed |
| Chart.js | Real-time charting (loaded via CDN, cacheable offline) |
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

- 🤖 **Robot controller** — GamePad + Servos to drive a bot
- 🌡️ **Weather station** — graph temperature and light over time
- 🎵 **Sound meter** — monitor noise levels with graph annotations
- 📐 **Motion tracker** — record accelerometer sessions and export CSV
- 🎯 **Reaction game** — buttons + buzzer + LED matrix
- 🏫 **Classroom dashboard** — students connect and compare sensor data
- 🧪 **Science lab** — export CSV data for spreadsheet analysis
- 📊 **Data journalism** — record sessions, annotate, export PNG charts

---

## ❤️ Built For

- 👩‍🎓 Students learning electronics and coding
- 👨‍🏫 Teachers running STEM workshops
- 🧑‍💻 Makers prototyping BLE projects
- 🤖 Robot enthusiasts
- 🎉 Anyone curious about micro:bit

If you're smiling while using it — **mission accomplished** 😄

Happy hacking! 🚀🎮🤖
