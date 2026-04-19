# micro:bit Playground — User Guide

> **micro:bit Playground** — A browser-based BLE control panel for the BBC micro:bit V2.
> Zero install, zero account, zero backend. Everything runs locally in Chrome or Edge.

---

## Quick Start (5 minutes)

1. Flash `makecode.ts` onto your **BBC micro:bit V2** from [makecode.microbit.org](https://makecode.microbit.org/) (paste into JavaScript mode → Download → drag `.hex` onto the MICROBIT drive).
2. When the board shows an **X** icon, it's broadcasting BLE.
3. Open `index.html` in **Chrome** or **Edge** (desktop or Chrome Android).
4. Click **🔗 Connect to micro:bit**, pick your board from the picker.
5. Status chip turns **green** → you're live. Try the 8 tabs.

Detailed walkthrough: [start.html](start.html). Buyer FAQ: [faq.html](faq.html).

---

## Requirements

- **BBC micro:bit V2** (V1 works but has no sound sensor).
- USB cable for flashing, batteries or USB for running.
- **Chrome** or **Edge** on desktop · **Chrome** on Android.
- Bluetooth 4.0+ (BLE) enabled on your computer.
- HTTPS or `file://` — double-clicking the HTML works fine.

### Browser compatibility

| Browser | Status |
|---|---|
| Chrome desktop | ✅ Recommended |
| Edge desktop | ✅ Full support |
| Chrome Android | ✅ Works well |
| Safari macOS | ⚠️ Experimental flag required |
| Firefox | ❌ No Web Bluetooth |
| Safari iOS / iPadOS | ❌ Not supported by Apple |

---

## The 8 Tabs

### 1 · 🎛 Controls
- **Text scroller** — type a message, scroll on the LED display.
- **LED matrix** — click/drag to paint a 5×5 pattern, send as hex (`LM:1F0E040000`).
- **Presets** — Heart ❤, Smile 😊, Tick ✔ (one click).
- **Commands** — HEART / SMILE / SAD / CLEAR / FIRE / arrows.
- **Buzzer** — frequency slider (20–20 000 Hz), duration, 4 presets.
- **Custom JSON** (Expert only) — send raw `JSON:{…}` payloads.

### 2 · 👀 Sensors
Live values + mini sparkline charts, refreshing every 100–200 ms:
- 🌡 Temperature (°C)
- 💡 Light (0–255)
- 🔊 Sound (V2 only, 0–255)
- 🏃 Accelerometer X / Y / Z (mg)
- 🧭 Compass heading (0–360°)
- 🔘 Buttons A & B
- ✋ Touch P0 / P1 / P2 + Logo

**Calibration panel** (all user-triggered, persisted in localStorage):

| Calibration | How |
|---|---|
| 🧭 Compass | Click Calibrate → tilt the board to fill the screen |
| ⚖️ Accel zero | Lay flat → Set Level |
| 🔊 Sound baseline | Quiet room → Set Ambient |
| 💡 Light baseline | Normal lighting → Set Ambient |
| 🔧 Servo trim (Expert) | Motors tab — slider −15° to +15° per servo |

### 3 · ⚙️ Motors
- **Servo 1** on P1 · **Servo 2** on P2.
- 0°–180° slider + numeric input + visual gauge.
- **OFF** button releases PWM and re-enables touch on that pin.
- Sending a servo angle auto-disables touch polling on its pin for safety.

### 4 · 🎮 GamePad
- ⬆⬇⬅➡ D-pad + 🔥 FIRE button.
- Sends `CMD:UP / DOWN / LEFT / RIGHT / FIRE` over UART.
- Great for driving robots or playing LED games.

### 5 · 📈 Graph
- **5 graph types** — Line · Bar · Scatter · Area · Realtime (oscilloscope).
- **Sensor checkboxes** — Accel X/Y/Z, Compass, Sound, Light, Temp, Touch P0/P1/P2.
- **Custom labels** — any `GRAPH:<label>:<value>` from the firmware auto-creates a colored line.
- **10 colorblind-friendly colors**.
- **Controls** — window size · Y-axis · line thickness · grid.
- **Actions** — Simulate · Pause · Clear · Fullscreen · Record · Replay · Save · Note · PNG · CSV.

### 6 · 🎲 3D Board
Three.js models driven by live sensor data. Drag to rotate, scroll to zoom:

| Model | Animates with |
|---|---|
| 🎲 micro:bit V2 | LEDs, tilt, buttons, pins, logo, temp tint |
| 🚗 Robot Buggy | Servo 1 (steering), Accel, LEDs, Light, Button A |
| 🦾 Robot Arm | Servo 1 (base), Servo 2 (lift), Buttons A/B (gripper) |
| 🎯 Balance Game | Accel X/Y (physics sim, ball on platform) |
| 🌦 Weather Station | Temp, Light, Sound, Compass |

Controls: model selector · Reset View · Auto Rotate · Live Sync.

### 7 · 🔧 Bench (Expert)
- Send raw `BENCH:PING / STATUS / RESET` commands.
- Firmware responses visible inline.
- Prototyping and debugging workspace.

### 8 · ✨ More
**Fun controls** (always visible): Button · Switch · Slider · Keypad · Joystick.
**Expert-only**: LED indicator · Level bar · Live Graph · Multi-Graph · Debug Console · Data Capture · Buzzer · Timer · Delay Action · Random · Mode selector · Numeric input · Dual range · Color picker · Presets · Global reset/clear · Theme · XY Pad · LED Matrix · Sensor simulators · Pin control · Servo · RGB Strip · File I/O.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Pause / Resume graph |
| `1`–`8` | Switch tabs (Controls · Sensors · Motors · GamePad · Graph · 3D · Bench · More) |
| `P` | Presets overlay |
| `F` | Fullscreen graph |
| `K` | Clear graph |
| `Esc` | Close overlay / exit fullscreen |

Full reference: [cheatsheet.html](cheatsheet.html).

---

## Themes

| Theme | Look |
|---|---|
| 🌙 **Stealth** (default) | Dark navy `#020617` with green accents |
| ⚡ **Neon** | Cyberpunk cyan glow, animated borders |
| ☁️ **Arctic** | Clean light theme — best for projectors |
| 🔥 **Blaze** | Warm amber light theme |

Switch from the header or the More tab. Selection saved in localStorage.

## Languages

EN 🇬🇧 · FR 🇫🇷 · AR 🇩🇿 (full RTL layout). 367+ keys, saved per device.

---

## BLE Protocol Cheat Sheet

### Incoming (micro:bit → browser)
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

### Outgoing (browser → micro:bit)
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

Full reference in the project `README.md`.

### Connection details
- Service UUID: `6e400001-b5a3-f393-e0a9-e50e24dcca9e` (Nordic UART)
- MTU payload: 20 bytes (auto-chunking)
- Auto-reconnect: 3 attempts, 2 s apart
- Device filter: name starts with `BBC micro:bit`

---

## Troubleshooting

### "Connect" button does nothing
You're on Safari, Firefox, or an iPhone. Switch to Chrome or Edge (desktop, or Chrome on Android).

### micro:bit doesn't appear in the pairing popup
1. Is the board showing an **X**? If not, re-flash `makecode.ts`.
2. Is Bluetooth ON in the OS (not just the browser)?
3. Is your Bluetooth dongle 4.0+ (BLE)? Older dongles only speak Classic.
4. Close `chrome://bluetooth-internals` if it's open — it can hold the scan.

### "Tilt to fill the screen" appears on boot
Old firmware. Re-flash the current `makecode.ts` from your download. The updated firmware only triggers compass calibration when you click **Calibrate** in the Sensors tab.

### Sound sensor reads 0
You have a V1. Upgrade to V2 or accept no sound (everything else still works).

### Disconnects after a few seconds
Move closer, replace batteries, or reflash. The app auto-reconnects 3 times.

### Servo makes touch readings go crazy
Expected — PWM on a pin makes touch unusable. Click **OFF** next to the servo to release the pin.

### 3D model is laggy
Close other tabs. Disable Auto Rotate. Try the lightweight micro:bit V2 model. Turn off Live Sync briefly.

### Graph fullscreen won't exit
Press **Esc**, or click the ⛶ icon again.

---

## Teacher Notes

### Workshop flow (45 minutes)
1. **0–10 min** — Everyone flashes firmware from MakeCode. Show an X on the LED display.
2. **10–20 min** — Pair over BLE. Try Tab 1 (Controls) and Tab 2 (Sensors).
3. **20–35 min** — Pick a project theme (buggy, weather station, balance game). Use Tab 6 (3D) to visualize.
4. **35–45 min** — Record a 1-minute graph session (Tab 5). Export CSV for a follow-up lesson.

### Classroom tips
- Use **Arctic** or **Blaze** theme for projector clarity.
- One micro:bit + one laptop per pair. BLE is paired per-browser-tab.
- Disable Auto Rotate in Tab 6 so students aren't distracted.
- The **Simulate** button in Tab 5 generates demo data with no sensors — useful when hardware is shared.
- Enable **Expert** mode only for older students — hides the raw-JSON footgun for beginners.

### Lesson ideas
- 🚗 **Robot buggy** — GamePad + Servos to drive a bot, watch the 3D Buggy mirror it.
- 🦾 **Robot arm** — control 2 servos, see the 3D Arm respond in real time.
- 🌡️ **Weather station** — graph temperature + light, animate the 3D Weather Station.
- 🎯 **Balance game** — tilt the board to roll a ball through targets.
- 🎵 **Sound meter** — monitor noise with annotations.
- 📊 **Data journalism** — record a session, export PNG + CSV.

### Safety notes
- Treat micro:bit servos as 5V-rated — external power recommended for high-torque loads.
- Buzzer is loud — start at 50% volume.
- BLE range ~10 m line-of-sight; walls and microwaves cut it hard.

---

## localStorage Keys

| Key | Purpose |
|---|---|
| `mb_theme` | Selected theme |
| `mb_active_tab` | Last active tab |
| `mb_graph_sensors` | Graph checkbox state |
| `mb_onboarded` | Onboarding dismissed |
| `mb_calibration` | Accel offset, sound/light baselines |
| `mb_servo1_trim` / `mb_servo2_trim` | Servo trim offsets |
| `mb_board3d_model` | Last-used 3D model |
| `mb_other_presets` | Saved Others-tab widget states |

---

## Further Reading

- [cheatsheet.html](cheatsheet.html) — keyboard shortcuts, BLE states, themes
- [faq.html](faq.html) — buyer FAQ
- [start.html](start.html) — first-run onboarding
- [../README.md](../README.md) — full technical reference
- [../CHANGELOG.md](../CHANGELOG.md) — version history
- [../SETUP.md](../SETUP.md) — 5-minute setup

---

*micro:bit Playground v1.2.0 — Connect · Explore · Create · Play.*
