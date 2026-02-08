# Correction Changelog

All 15 fixes from the 3-phase correction plan, applied to the MicroBit Controller project.

---

## Phase 1 — Critical Fixes

### 1. ✅ Renamed `settings.ts` → `pxt.json`
File was JSON, not TypeScript. Renamed to match actual content.

### 2. ✅ Fixed servo race condition (`makecode.ts`)
- Added `servo1Cancel` / `servo2Cancel` flags
- `requestServoMove` now cancels any running background thread before starting a new one
- Removed conflicting immediate `pins.servoWritePin` calls in SERVO1/SERVO2 handlers — the background thread is now the sole controller

### 3. ✅ Removed French comment (`script.js`)
Replaced `// 👇 AJOUTER ÇA` with English `// Alias for sendLine (used by servo module)`

### 4. ✅ Added browser-side buzzer validation (`controls.js`)
Frequency validated: 20–20,000 Hz. Duration validated: 1–5,000 ms. Shows warning in activity feed on invalid input.

### 5. ✅ Added UART message chunking (`ble.js`)
`sendLine()` now splits messages exceeding the BLE MTU (~20 bytes) into sequential chunks. Short messages sent in a single write as before.

---

## Phase 2 — Structural Cleanup

### 6. ✅ Deduplicated CSS (`styles.css`)
Removed 61 lines of intermediate duplicate blocks (`.led-cell`, `@keyframes led-glow`) that were fully overridden by later sections. File reduced from 2,696 → 2,634 lines.

### 7. ✅ Replaced MutationObserver hack (`core.js` / `servos.js`)
- Added `connectionEvents` EventTarget in `core.js`
- `setConnectionStatus()` now calls `emitConnectionChange()`
- Servo module subscribes via `connectionEvents.addEventListener('change', ...)`
- Eliminated DOM text-watching MutationObserver

### 8. ✅ Added BLE reconnection logic (`ble.js`)
- Auto-retry up to 3 times on unexpected disconnect (2s delay between attempts)
- `userDisconnected` flag distinguishes manual disconnect from unexpected drop
- Activity feed shows reconnection progress
- Falls back to manual reconnect after max attempts

### 9. ✅ Scoped global variables in `makecode.ts`
- Removed 26 module-scope temp variables (`a`, `b`, `c`, `x`, `y`, `z`, `line`, `hex2`, `msg`, `raw`, `tab`, etc.)
- Added `let` declarations inside each function where variables are used
- Kept only true state variables at module scope (`btConnected`, `servo*Current/Target/Moving`, `currentTab`)

### 10. ✅ Reduced unnecessary tab notifications (`ble.js`)
Tab changes only send `TAB:` message when entering or leaving the "servos" tab (the only tab where the micro:bit changes behavior for pin conflict avoidance).

### 11. ✅ Chart.js offline note (`index.html`)
Added HTML comment suggesting local bundling for full offline support. (Actual download requires network access, which isn't available in this environment.)

---

## Phase 3 — Modularization & Polish

### 12. ✅ Split `script.js` into 6 modules
| File | Lines | Responsibility |
|------|-------|---------------|
| `js/core.js` | 160 | Event bus, $, DOM refs, logging, connection status, activity feed |
| `js/ble.js` | 240 | sendLine (chunking), connect, disconnect, reconnect, UART notify |
| `js/sensors.js` | 272 | Charts, handleUartLine (UART parsing), button pills |
| `js/controls.js` | 320 | LED matrix, buzzer, text, presets, bench, tabs, mode, init |
| `js/servos.js` | 108 | Servo IIFE + gauges |
| `js/others.js` | 246 | Others tab widget handlers |

`index.html` updated to load all 6 via `<script defer>` in dependency order. Original `script.js` preserved as `script.js.bak`.

### 13. ✅ Added ARIA & keyboard navigation
- **LED grid**: Each cell has `role="gridcell"`, `tabindex="0"`, `aria-label`, `aria-pressed`. Arrow keys navigate between cells; Enter/Space toggles.
- **LED container**: `role="grid"` with descriptive label
- **Gamepad buttons**: `aria-label` on all D-pad and Fire buttons
- **Servo sliders**: `aria-label` on range inputs
- **Joystick buttons** (Others tab): `role="button"`, `tabindex="0"`, Enter/Space activation

### 14. ✅ Added try/catch to UART parsing (`sensors.js`)
`handleUartLine()` wrapped in try/catch. Malformed messages log to console and activity log instead of crashing the app.

### 15. ✅ Added basic unit tests (`tests.html`)
Browser-based test suite covering:
- `ledStateToHex` — all-off, all-on, single LED, corners, heart preset
- `hexCharToNibble` — digits 0–F, lowercase, invalid chars
- `hexPairToByte` — 00, FF, 1F, 0A, short strings
- `clampAngle` — normal, boundary, negative, over-max, float rounding
- Hex round-trip (encode → decode produces identical pattern)
- UART chunking (short fits, long splits, reassembly matches)
- Buzzer validation (valid/invalid frequency and duration ranges)

Open `tests.html` in any browser to run.

## BLE Audit (post-review)

### ✅ Fixed `compassHeadingValueEl` wrong DOM ID (`sensors.js`)
Was `$('compassValue')`, corrected to `$('compassHeadingValue')` matching HTML `id="compassHeadingValue"`.

### ✅ Fixed sensor state element IDs (`sensors.js`)
Removed unnecessary `|| $('btnAPill')` fallbacks that masked ID mismatches. Now uses exact original IDs: `$('btnAState')`, `$('logoState')`, etc.

### ✅ Cleaned dead DOM refs from `core.js`
Removed unused `compassValueEl`, `btnAPill`, `btnADot`, `btnAText`, `logoPill` etc. These pointed to wrong/nonexistent IDs and were never referenced by any code.

### ✅ Added typeof guard for `updateServoGauge` in `sensors.js`
SERVO_POS telemetry handlers (new feature) reference `updateServoGauge` from `servos.js` — added `typeof` check for safety since sensors.js loads first.

### ✅ Fixed pre-existing pin conflict: touch polling vs servos (`makecode.ts`)
**Original bug:** Touch P1/P2 polling was guarded by `currentTab != "servos"` — if the user left the Servos tab while servos were active, `input.pinIsPressed(TouchPin.P1)` would reconfigure P1 as a digital input, breaking the servo.

**Fix:** Replaced all 3 tab-based guards with per-servo state flags:
- `servo1Active` / `servo2Active` set `true` on SERVO command, `false` on SERVO:OFF
- Touch P1 polling skipped when `servo1Active` (regardless of current tab)
- Touch P2 polling skipped when `servo2Active` (regardless of current tab)
- Per-pin granularity: servo1 on P1 doesn't block touch P2, and vice versa

### BLE integrity verified
- `sendLine` short path (≤20 bytes) is identical to original `writeValue` call
- `let` state variables (`btDevice`, `writeChar`, `isConnected`, etc.) in `core.js` are accessible across all `<script defer>` tags via shared global lexical scope
- `writeUART` alias in `core.js` correctly resolves `sendLine` from `ble.js` at runtime
- Reconnection logic is additive only — guarded by `userDisconnected` flag, never triggers on manual disconnect

## Deep Audit Fixes

### ✅ Removed duplicate TOUCH polling loop (`makecode.ts`)
Two 100ms loops both read `input.pinIsPressed(TouchPin.P0/P1/P2)`:
- Loop 1 sent `TOUCH:0,1,0` — browser **never parsed** this format
- Loop 2 sent `BTN:P0:1`, `BTN:P1:0` — browser **does parse** these
Removed Loop 1 and its 3 tracking variables (`lastTouchP*_Sense`).

### ✅ Removed P1/P2 `onPinPressed`/`onPinReleased` event handlers (`makecode.ts`)
`input.onPinPressed(TouchPin.P1)` configures P1 for capacitive touch at the DAL level. This conflicts with `pins.servoWritePin(AnalogPin.P1)` because the DAL's background tick handler continuously reads the pin for touch events, briefly reconfiguring it away from PWM mode. Same for P2/servo2.
- P1 pressed/released handlers removed (servo1 conflict)
- P2 pressed/released handlers removed (servo2 conflict)
- P0 handlers kept (no servo on P0, buzzer conflict handled separately)
- Browser only logged these events — no UI functionality lost

### ✅ Added buzzer pin guard (`makecode.ts`)
`buzzerActive` flag prevents `input.pinIsPressed(TouchPin.P0)` from reading P0 during buzzer output (which uses `pins.analogWritePin(AnalogPin.P0, 512)`). Without this, the touch poll would briefly reconfigure P0 as digital input, causing the tone to stutter.

### ✅ Added Others tab Servo OFF button (`index.html` + `others.js`)
The Others tab had a "Move Servo" button but no way to stop it. Added "Stop Servo" button that sends `SERVO1:OFF`, clearing `servo1Active` and releasing P1 for touch polling.

### ✅ Capped message log at 500 entries (`core.js`)
With telemetry at 100ms intervals, the log would grow unbounded in long sessions. Now auto-trims oldest entries beyond 500.

### ✅ Capped bench response window at 100 entries (`sensors.js`)
`benchResponse` div appended entries with no limit. Now capped at 100.

---

## Files

```
microbit-controller-fixed/
├── index.html          (updated: modular script loading, ARIA)
├── styles.css          (updated: deduped CSS)
├── js/
│   ├── core.js         (new)
│   ├── ble.js          (new)
│   ├── sensors.js      (new)
│   ├── controls.js     (new)
│   ├── servos.js       (new)
│   └── others.js       (new)
├── makecode.ts         (updated: race fix, scoped vars)
├── pxt.json            (renamed from settings.ts)
├── logo.svg            (unchanged)
├── README.md           (unchanged)
├── tests.html          (new)
└── script.js.bak       (original backup)
```
