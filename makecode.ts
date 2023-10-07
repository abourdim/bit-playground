/**
 * =========================================================
 *  micro:bit Playground - BLE Firmware (V6.0)
 * =========================================================
 *
 * UART over Bluetooth LE - full telemetry, control & 3D sync
 *
 * TELEMETRY (micro:bit -> browser):
 *   TEMP:<C>                           every 100ms (on change)
 *   LIGHT:<0-255>                      every 100ms (on change)
 *   SOUND:<0-255>                      every 100ms (on change)
 *   ACC:<x>,<y>,<z>                    every 100ms (on change)
 *   COMPASS:<0-360>                    every 200ms (on change)
 *   BTN:A:<0|1>  BTN:B:<0|1>          every 100ms (on change)
 *   BTN:P0/P1/P2:<0|1>                every 100ms (on change)
 *   BTN:LOGO:<0|1>                    every 100ms (on change)
 *   LEDS:<r0>,<r1>,<r2>,<r3>,<r4>     every 250ms (on change)
 *       each row 0-31 (5 bits), syncs with 3D board model
 *   SERVO1_POS:<angle>                 every 500ms
 *   SERVO2_POS:<angle>                 every 500ms
 *   GRAPH:<label>:<value>              simulate mode only
 *   SIMULATE:ACK:ON/OFF                simulate acknowledgement
 *   CAL:COMPASS:DONE                   after calibration complete
 *   INFO:CONNECTED / INFO:DISCONNECTED BLE state changes
 *   INFO:SERIAL:<id>                   device serial number
 *
 * COMMANDS (browser -> micro:bit):
 *   TEXT:<string>           Show scrolling text on LED
 *   LM:<hex10>             Set 5x5 LED matrix (hex encoded)
 *   CMD:HEART/SMILE/SAD/CLEAR/FIRE/UP/DOWN/LEFT/RIGHT
 *   SERVO1:<angle>         SERVO2:<angle>       (0-180)
 *   SERVO1:OFF             SERVO2:OFF
 *   BUZZ:<freq>,<ms>       BUZZ:OFF
 *   OTHER:LED/<row>,<col>,<0|1>
 *   OTHER:PIN/<D|A><n>:<val>
 *   OTHER:PWM/<pin>:<duty>,<period>
 *   OTHER:SERVO/<angle>,<speed>
 *   BENCH:<cmd>            (PING, STATUS, RESET)
 *   JSON:{...}             Parse JSON commands
 *   SIMULATE:ON/OFF        Start/stop graph demo data
 *   CAL:COMPASS            Trigger compass calibration game
 *   TAB:<name>             Notify firmware of active browser tab
 *   HELLO                  Sent on connect to confirm link
 *
 * PIN CONFLICT GUARDS:
 *   servo1Active  -> blocks touch P1 polling
 *   servo2Active  -> blocks touch P2 polling
 *   buzzerActive  -> blocks touch P0 polling
 *
 * 3D BOARD SYNC:
 *   LEDS: telemetry mirrors actual LED display on 3D model
 *   ACC:  tilts 3D board matching physical orientation
 *   BTN:  buttons depress + glow on 3D model
 *   Touch pins glow on 3D model
 *   TEMP: tints 3D PCB color (blue to red)
 * =========================================================
 */
// Touch pin events using input.onPinPressed
input.onPinPressed(TouchPin.P0, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:TOUCH_P0_PRESSED")
    }
})
// P2 touch events removed: conflicts with servo2 on P2 (same as P1 above)
input.onPinReleased(TouchPin.P0, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:TOUCH_P0_RELEASED")
    }
})
bluetooth.onBluetoothConnected(function () {
    btConnected = true
    basic.showIcon(IconNames.Yes)
    bluetooth.uartWriteLine("INFO:CONNECTED")
})
bluetooth.onBluetoothDisconnected(function () {
    btConnected = false
    basic.showIcon(IconNames.No)
    bluetooth.uartWriteLine("INFO:DISCONNECTED")
})
input.onButtonPressed(Button.A, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:BUTTON_A_PRESSED")
    }
})
// (P2 pressed event removed — see P2 released comment above)
function handleLedMatrixHex(hex2: string) {
    if (hex2.length != 10) {
        bluetooth.uartWriteLine("LOG:LM_BAD_LENGTH:" + hex2.length)
        return
    }
    for (let row = 0; row <= 4; row++) {
        let pair = hex2.substr(row * 2, 2)
        let value = hexPairToByte(pair)
        for (let col = 0; col <= 4; col++) {
            const mask = 1 << col
            let on = (value & mask) != 0
            if (on) {
                led.plot(col, row)
            } else {
                led.unplot(col, row)
            }
        }
    }
    bluetooth.uartWriteLine("LOG:LM_OK:" + hex2)
}
// ---------- UART RX: commands from browser ----------
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    line = line.trim()
    // Echo back for debugging
    bluetooth.uartWriteLine("ECHO:" + line)
    if (line.substr(0, 5) == "TEXT:") {
        let msg = line.substr(5)
        if (msg.length > 0) {
            basic.showString(msg)
        }
        return
    }
    if (line.substr(0, 3) == "LM:") {
        let hex2 = line.substr(3)
        handleLedMatrixHex(hex2)
        return
    }
    // ======== TAB change from browser =========
    // Expect messages like: TAB:Controls, TAB:Senses, TAB:Servos, TAB:Others
    if (line.substr(0, 4) == "TAB:") {
        let tab = line.substr(4).toLowerCase()
        currentTab = tab  // Store for conditional pin polling
        // Acknowledge back to browser
        bluetooth.uartWriteLine("TAB:ACK:" + tab)
        // Simple visual feedback on micro:bit:
        // show first letter of the tab (C / S / S / O)
        if (tab.length > 0) {
            basic.showString(tab.charAt(0).toUpperCase())
        }
        return
    }
    // ======== SERVOS =========
    // Accept commands: SERVO1:<angle>, SERVO2:<angle>, SERVO1:OFF, SERVO2:OFF
    if (line == "SERVO1:OFF") {
        pins.analogWritePin(AnalogPin.P1, 0)
        servo1Target = 0
        servo1Current = 0
        servo1Active = false
        bluetooth.uartWriteLine("SERVO1:OFF:ACK")
        return
    }
    if (line == "SERVO2:OFF") {
        pins.analogWritePin(AnalogPin.P2, 0)
        servo2Target = 0
        servo2Current = 0
        servo2Active = false
        bluetooth.uartWriteLine("SERVO2:OFF:ACK")
        return
    }
    // Replace existing SERVO1: handling block with this
    if (line.substr(0, 7) == "SERVO1:") {
        let raw = line.substr(7)
        let b = parseFloat(raw)
        if (!(isNaN(b))) {
            let angle = clampAngle(b)
            servo1Active = true
            // Let requestServoMove handle the pin write to avoid race condition
            requestServoMove(1, angle)
            bluetooth.uartWriteLine("SERVO1:ACK:" + angle)
            bluetooth.uartWriteLine("DBG:SERVO1_RECV:" + raw)
        } else {
            bluetooth.uartWriteLine("SERVO1:NACK")
        }
        return
    }
    // Replace existing SERVO2: handling block with this
    if (line.substr(0, 7) == "SERVO2:") {
        let raw2 = line.substr(7)
        let c = parseFloat(raw2)
        if (!(isNaN(c))) {
            let angle2 = clampAngle(c)
            servo2Active = true
            requestServoMove(2, angle2)
            bluetooth.uartWriteLine("SERVO2:ACK:" + angle2)
            bluetooth.uartWriteLine("DBG:SERVO2_RECV:" + raw2)
        } else {
            bluetooth.uartWriteLine("SERVO2:NACK")
        }
        return
    }
    if (line == "CMD:HEART") {
        basic.showIcon(IconNames.Heart)
        return
    }
    if (line == "CMD:SMILE") {
        basic.showIcon(IconNames.Happy)
        return
    }
    if (line == "CMD:SAD") {
        basic.showIcon(IconNames.Sad)
        return
    }
    if (line == "CMD:CLEAR") {
        basic.clearScreen()
        return
    }
    if (line == "CMD:FIRE") {
        playExplosion()
        return
    }
    // ======== GAMEPAD D-PAD ========
    if (line == "CMD:UP") {
        basic.showArrow(ArrowNames.North)
        bluetooth.uartWriteLine("CMD:ACK:UP")
        return
    }
    if (line == "CMD:DOWN") {
        basic.showArrow(ArrowNames.South)
        bluetooth.uartWriteLine("CMD:ACK:DOWN")
        return
    }
    if (line == "CMD:LEFT") {
        basic.showArrow(ArrowNames.West)
        bluetooth.uartWriteLine("CMD:ACK:LEFT")
        return
    }
    if (line == "CMD:RIGHT") {
        basic.showArrow(ArrowNames.East)
        bluetooth.uartWriteLine("CMD:ACK:RIGHT")
        return
    }
    // ======== BENCH (echo + diagnostics) ========
    if (line.substr(0, 6) == "BENCH:") {
        const cmd = line.substr(6).trim()
        // Echo back for testing
        bluetooth.uartWriteLine("BENCH:ECHO:" + cmd)
        // Simple built-in commands
        if (cmd == "PING") {
            bluetooth.uartWriteLine("BENCH:PONG")
        } else if (cmd == "STATUS") {
            bluetooth.uartWriteLine("BENCH:TAB:" + currentTab)
            bluetooth.uartWriteLine("BENCH:S1:" + servo1Current)
            bluetooth.uartWriteLine("BENCH:S2:" + servo2Current)
        } else if (cmd == "RESET") {
            control.reset()
        }
        return
    }
    // ======== JSON (echo for debug) ========
    if (line.substr(0, 5) == "JSON:") {
        const payload = line.substr(5)
        bluetooth.uartWriteLine("JSON:ACK:" + payload.length + " chars")
        return
    }
    // ======== OTHERS TAB WIDGETS ========
    if (line.substr(0, 6) == "OTHER:") {
        const rest = line.substr(6)
        // Button press
        if (rest == "BTN:PRESS") {
            basic.showIcon(IconNames.SmallDiamond)
            basic.pause(100)
            basic.clearScreen()
            bluetooth.uartWriteLine("OTHER:ACK:BTN")
            return
        }
        // Switch
        if (rest.substr(0, 7) == "SWITCH:") {
            const state = rest.substr(7)
            if (state == "ON") {
                basic.showIcon(IconNames.Yes)
            } else {
                basic.showIcon(IconNames.No)
            }
            bluetooth.uartWriteLine("OTHER:ACK:SWITCH:" + state)
            return
        }
        // Slider
        if (rest.substr(0, 7) == "SLIDER:") {
            const val = parseInt(rest.substr(7))
            // Show as bar graph on LED
            led.plotBarGraph(val, 100)
            bluetooth.uartWriteLine("OTHER:ACK:SLIDER:" + val)
            return
        }
        // Joystick
        if (rest.substr(0, 4) == "JOY:") {
            const dir = rest.substr(4)
            if (dir == "UP") basic.showArrow(ArrowNames.North)
            else if (dir == "DOWN") basic.showArrow(ArrowNames.South)
            else if (dir == "LEFT") basic.showArrow(ArrowNames.West)
            else if (dir == "RIGHT") basic.showArrow(ArrowNames.East)
            bluetooth.uartWriteLine("OTHER:ACK:JOY:" + dir)
            return
        }
        // Text
        if (rest.substr(0, 5) == "TEXT:") {
            const txt = rest.substr(5)
            basic.showString(txt)
            bluetooth.uartWriteLine("OTHER:ACK:TEXT")
            return
        }
        // LED indicator
        if (rest.substr(0, 4) == "LED:") {
            const state = rest.substr(4)
            if (state == "ON") {
                led.plot(2, 2)
            } else {
                led.unplot(2, 2)
            }
            bluetooth.uartWriteLine("OTHER:ACK:LED:" + state)
            return
        }
        // Keypad
        if (rest.substr(0, 4) == "KEY:") {
            const key = rest.substr(4)
            basic.showString(key)
            bluetooth.uartWriteLine("OTHER:ACK:KEY:" + key)
            return
        }
        // Pin control (guard P1/P2 against active servos)
        if (rest.substr(0, 4) == "PIN:") {
            const parts2 = rest.substr(4).split(":")
            if (parts2.length == 2) {
                const pinName = parts2[0]  // D0, D1, D2, D8, D12, D16
                const pinVal = parseInt(parts2[1])
                // Block D1 if servo1 active, D2 if servo2 active
                if (pinName == "D1" && servo1Active) {
                    bluetooth.uartWriteLine("OTHER:NACK:PIN:D1:SERVO_ACTIVE")
                    return
                }
                if (pinName == "D2" && servo2Active) {
                    bluetooth.uartWriteLine("OTHER:NACK:PIN:D2:SERVO_ACTIVE")
                    return
                }
                // Map to actual pins
                if (pinName == "D0") pins.digitalWritePin(DigitalPin.P0, pinVal)
                else if (pinName == "D1") pins.digitalWritePin(DigitalPin.P1, pinVal)
                else if (pinName == "D2") pins.digitalWritePin(DigitalPin.P2, pinVal)
                else if (pinName == "D8") pins.digitalWritePin(DigitalPin.P8, pinVal)
                else if (pinName == "D12") pins.digitalWritePin(DigitalPin.P12, pinVal)
                else if (pinName == "D16") pins.digitalWritePin(DigitalPin.P16, pinVal)
                bluetooth.uartWriteLine("OTHER:ACK:PIN:" + pinName + ":" + pinVal)
            }
            return
        }
        // PWM
        if (rest.substr(0, 7) == "PWM:P0:") {
            const pwmVal = parseInt(rest.substr(7))
            pins.analogWritePin(AnalogPin.P0, pwmVal)
            bluetooth.uartWriteLine("OTHER:ACK:PWM:P0:" + pwmVal)
            return
        }
        // Servo from Others tab — use same safe path as Servos tab
        if (rest.substr(0, 6) == "SERVO:") {
            const parts3 = rest.substr(6).split(",")
            if (parts3.length == 2) {
                const sAngle = clampAngle(parseInt(parts3[0]))
                // speed is ignored for now, just move servo 1
                servo1Active = true
                requestServoMove(1, sAngle)
                bluetooth.uartWriteLine("OTHER:ACK:SERVO:" + sAngle)
            }
            return
        }
        // Strip LED (placeholder - would need neopixel extension)
        if (rest.substr(0, 6) == "STRIP:") {
            bluetooth.uartWriteLine("OTHER:ACK:STRIP")
            return
        }
        // Default ACK
        bluetooth.uartWriteLine("OTHER:ACK:" + rest)
        return
    }
    // ======== BUZZER CONTROL (non-blocking) ========
    if (line.substr(0, 5) == "BUZZ:") {
        const rest = line.substr(5);

        // OFF
        if (rest == "OFF") {
            music.stopAllSounds();
            pins.analogWritePin(AnalogPin.P0, 0);
            buzzerActive = false;
            bluetooth.uartWriteLine("BUZZ:ACK:OFF");
            return;
        }

        // Frequency + duration
        const parts = rest.split(",");
        if (parts.length == 2) {
            const freq = parseInt(parts[0]);
            const dur = parseInt(parts[1]);

            // Safety: prevent division by zero and invalid values
            if (freq < 20 || freq > 20000 || dur < 1 || dur > 5000) {
                bluetooth.uartWriteLine("BUZZ:NACK:INVALID");
                return;
            }

            buzzerActive = true;

            // Non-blocking: run in background to avoid BLE timeout
            control.inBackground(function () {
                // V2 built-in speaker (non-blocking with Background)
                music.playTone(freq, dur);
            });

            // External buzzer on P0 (also in background)
            control.inBackground(function () {
                pins.analogSetPeriod(AnalogPin.P0, 1000000 / freq);
                pins.analogWritePin(AnalogPin.P0, 512);
                basic.pause(dur);
                pins.analogWritePin(AnalogPin.P0, 0);
                buzzerActive = false;
            });

            bluetooth.uartWriteLine("BUZZ:ACK:" + rest);
        }
        return;
    }

    // Calibration: CAL:COMPASS
    if (line == "CAL:COMPASS") {
        input.calibrateCompass()
        bluetooth.uartWriteLine("CAL:COMPASS:DONE")
        return;
    }

    // Simulate graph data: SIMULATE:ON / SIMULATE:OFF
    if (line == "SIMULATE:ON") {
        simulateActive = true;
        bluetooth.uartWriteLine("SIMULATE:ACK:ON");
        return;
    }
    if (line == "SIMULATE:OFF") {
        simulateActive = false;
        bluetooth.uartWriteLine("SIMULATE:ACK:OFF");
        return;
    }

})
input.onButtonPressed(Button.AB, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:BUTTON_AB_PRESSED")
    }
})
function clampAngle(a: number) {
    if (a < 0) {
        return 0
    }
    if (a > 180) {
        return 180
    }
    return Math.floor(a)
}
input.onButtonPressed(Button.B, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:BUTTON_B_PRESSED")
    }
})
// ---------- Helpers for LM:hhhhhhhhhh ----------
function hexCharToNibble(ch: string) {
    const up = ch.toUpperCase()
    let digits = "0123456789ABCDEF"
    let idx = digits.indexOf(up)
    if (idx < 0) {
        return 0
    }
    return idx
}
// P1 touch events removed: input.onPinPressed(TouchPin.P1) configures P1 for
// capacitive touch sensing at the DAL level, which conflicts with servo PWM on P1.
// The polling loop (BTN:P1:) already handles touch data with servo1Active guard.
function hexPairToByte(s: string) {
    if (s.length < 2) {
        return 0
    }
    let hi = hexCharToNibble(s.charAt(0))
    let lo = hexCharToNibble(s.charAt(1))
    return hi * 16 + lo
}
// Cancel flags: set true to stop a running background move
let servo1Cancel = false
let servo2Cancel = false

function requestServoMove(servoIndex: number, angle: number) {
    let a = clampAngle(angle)
    if (servoIndex == 1) {
        servo1Target = a
        // Cancel any running move before starting a new one
        if (servo1Moving) {
            servo1Cancel = true
            // Wait briefly for the old thread to exit
            basic.pause(30)
        }
        servo1Cancel = false
        servo1Moving = true
        control.inBackground(function () {
            while (servo1Current !== servo1Target && !servo1Cancel) {
                if (servo1Target > servo1Current) servo1Current++
                else if (servo1Target < servo1Current) servo1Current--
                pins.servoWritePin(AnalogPin.P1, servo1Current)
                basic.pause(18)
            }
            servo1Moving = false
        })
    } else {
        servo2Target = a
        if (servo2Moving) {
            servo2Cancel = true
            basic.pause(30)
        }
        servo2Cancel = false
        servo2Moving = true
        control.inBackground(function () {
            while (servo2Current !== servo2Target && !servo2Cancel) {
                if (servo2Target > servo2Current) servo2Current++
                else if (servo2Target < servo2Current) servo2Current--
                pins.servoWritePin(AnalogPin.P2, servo2Current)
                basic.pause(18)
            }
            servo2Moving = false
        })
    }
}
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:LOGO_PRESSED")
    }
})
input.onLogoEvent(TouchButtonEvent.Released, function () {
    if (btConnected) {
        bluetooth.uartWriteLine("EVENT:LOGO_RELEASED")
    }
})
// ---------- State variables (must be global) ----------
let btConnected = false
let servo2Current = 0
let servo1Current = 0
let servo2Target = 0
let servo1Target = 0
let servo2Moving = false
let servo1Moving = false
let currentTab = "controls"  // Track active tab for pin management
// Track whether each servo has been activated (survives tab changes)
let servo1Active = false
let servo2Active = false
let buzzerActive = false  // guards P0 from touch polling during buzz
let simulateActive = false
let simTick = 0

// Simulate graph data loop (sends GRAPH: messages when active)
loops.everyInterval(200, function () {
    if (!btConnected || !simulateActive) return;
    const sine = Math.round(50 + 50 * Math.sin(simTick * 0.1));
    const ramp = simTick % 100;
    const random = Math.randomRange(0, 100);
    bluetooth.uartWriteLine("GRAPH:Sine:" + sine);
    bluetooth.uartWriteLine("GRAPH:Random:" + random);
    bluetooth.uartWriteLine("GRAPH:Ramp:" + ramp);
    simTick++;
})
bluetooth.startUartService()
basic.showString("BT")
basic.pause(200)
basic.clearScreen()
// ---------- Servo state (minimal additions) ----------
servo1Target = 90
servo2Target = 90
servo1Current = 90
servo2Current = 90
// ---------- Telemetry: sensors ----------
let lastTemp = -1
let lastLight = -1
let lastSoundLevel = -1
let lastAccX = -1
let lastAccY = -1
let lastAccZ = -1
let LastServo1Current = -1
let LastServo2Current = -1
// ---------- Buttons & events ----------
let lastBtnA = -1
let lastBtnB = -1
let lastLogo = -1
let lastTouchP0 = -1
let lastTouchP1 = -1
let lastTouchP2 = -1
// report servo positions periodically (minimal telemetry)
loops.everyInterval(500, function () {
    if (!(btConnected)) {
        return
    }
    if (LastServo1Current == servo1Current && LastServo2Current == servo2Current) {
        return
    }
    LastServo1Current = servo1Current
    LastServo2Current = servo2Current
    bluetooth.uartWriteLine("SERVO1_POS:" + servo1Current)
    bluetooth.uartWriteLine("SERVO2_POS:" + servo2Current)
})
// Accelerometer (mg)
loops.everyInterval(300, function () {
    if (!(btConnected)) {
        return
    }
    let x = input.acceleration(Dimension.X)
    let y = input.acceleration(Dimension.Y)
    let z = input.acceleration(Dimension.Z)
    if (lastAccX == x && lastAccY == y && lastAccZ == z) {
        return
    }
    let diff_x = 0
    let diff_y = 0
    let diff_z = 0
    if (lastAccX > x) {
        diff_x = lastAccX - x
    } else {
        diff_x = x - lastAccX
    }
    if (lastAccY > y) {
        diff_y = lastAccY - y
    } else {
        diff_y = y - lastAccY
    }
    if (lastAccZ > z) {
        diff_z = lastAccZ - z
    } else {
        diff_z = z - lastAccZ
    }
    lastAccX = x
    lastAccY = y
    lastAccZ = z
    if (diff_x < 15 && diff_y < 15 && diff_z < 15) {
        return;
    }
    bluetooth.uartWriteLine("ACC:" + x + "," + y + "," + z)
})
// Light level
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    let l = input.lightLevel()
    if (lastLight == l) {
        return
    }
    lastLight = l
    bluetooth.uartWriteLine("LIGHT:" + l)
})
// Sound level (V2)
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    // On V2 we have soundLevel(), on V1 this stays 0
    let s = input.soundLevel()
    if (lastSoundLevel == s) {
        return
    }
    lastSoundLevel = s
    bluetooth.uartWriteLine("SOUND:" + s)
    // bluetooth.uartWriteLine("BENCH:" + s)
})
// Button/touch/logo polling (individual BTN:P0/P1/P2: messages for browser)
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    const aNow = input.buttonIsPressed(Button.A) ? 1 : 0
    const bNow = input.buttonIsPressed(Button.B) ? 1 : 0
    const logoNow = input.logoIsPressed() ? 1 : 0
    // Skip P0 touch read during buzzer (P0 is analog output for external buzzer)
    let touchP0Now = 0
    if (!buzzerActive) {
        touchP0Now = input.pinIsPressed(TouchPin.P0) ? 1 : 0
    }
    // Only poll P1/P2 if that servo is NOT active
    let touchP1Now = 0
    let touchP2Now = 0
    if (!servo1Active) {
        touchP1Now = input.pinIsPressed(TouchPin.P1) ? 1 : 0
    }
    if (!servo2Active) {
        touchP2Now = input.pinIsPressed(TouchPin.P2) ? 1 : 0
    }
    if (aNow != lastBtnA) {
        bluetooth.uartWriteLine("BTN:A:" + aNow)
        lastBtnA = aNow
    }
    if (bNow != lastBtnB) {
        bluetooth.uartWriteLine("BTN:B:" + bNow)
        lastBtnB = bNow
    }
    if (logoNow != lastLogo) {
        bluetooth.uartWriteLine("BTN:LOGO:" + logoNow)
        lastLogo = logoNow
    }
    if (!buzzerActive && touchP0Now != lastTouchP0) {
        bluetooth.uartWriteLine("BTN:P0:" + touchP0Now)
        lastTouchP0 = touchP0Now
    }
    // Only report P1/P2 changes if that servo is not active
    if (!servo1Active) {
        if (touchP1Now != lastTouchP1) {
            bluetooth.uartWriteLine("BTN:P1:" + touchP1Now)
            lastTouchP1 = touchP1Now
        }
    }
    if (!servo2Active) {
        if (touchP2Now != lastTouchP2) {
            bluetooth.uartWriteLine("BTN:P2:" + touchP2Now)
            lastTouchP2 = touchP2Now
        }
    }
})
// Temperature (°C)
loops.everyInterval(100, function () {
    if (!(btConnected)) {
        return
    }
    let t = input.temperature()
    if (lastTemp == t) {
        return
    }
    lastTemp = t
    bluetooth.uartWriteLine("TEMP:" + t)
})
// Compass heading (degrees)
let lastCompass = -1
loops.everyInterval(200, function () {
    if (!(btConnected)) {
        return
    }
    const heading = input.compassHeading()
    if (lastCompass == heading) {
        return
    }
    lastCompass = heading
    bluetooth.uartWriteLine("COMPASS:" + heading)
})

// LED state telemetry — reports actual 5x5 LED screen to browser
let lastLedStr = ""
loops.everyInterval(250, function () {
    if (!(btConnected)) {
        return
    }
    let vals: number[] = []
    for (let row = 0; row < 5; row++) {
        let bits = 0
        for (let col = 0; col < 5; col++) {
            if (led.point(col, row)) {
                bits |= (1 << (4 - col))
            }
        }
        vals.push(bits)
    }
    let s = "" + vals[0] + "," + vals[1] + "," + vals[2] + "," + vals[3] + "," + vals[4]
    if (s == lastLedStr) {
        return
    }
    lastLedStr = s
    bluetooth.uartWriteLine("LEDS:" + s)
})

function playExplosion() {
    // Clear screen first
    basic.clearScreen()

    // --- Stage 1: small center spark ---
    led.plot(2, 2)
    basic.pause(100)

    // --- Stage 2: cross burst ---
    basic.clearScreen()
    const cross = [
        [2, 1], [2, 2], [2, 3],
        [1, 2], [3, 2]
    ]
    for (let p of cross) led.plot(p[0], p[1])
    basic.pause(120)

    // --- Stage 3: big flash ---
    basic.clearScreen()
    const flash = [
        [0, 2], [4, 2],  // left/right
        [2, 0], [2, 4],  // top/bottom
        [1, 1], [3, 1], [1, 3], [3, 3], // corners of diamond
        [2, 2]  // center
    ]
    for (let p of flash) led.plot(p[0], p[1])
    basic.pause(150)

    // --- Stage 4: outer ring ---
    basic.clearScreen()
    const ring = [
        [0, 0], [4, 0],
        [0, 4], [4, 4],
        [1, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 3], [4, 3],
        [1, 4], [3, 4]
    ]
    for (let p of ring) led.plot(p[0], p[1])
    basic.pause(140)

    // --- Stage 5: fading spark ---
    basic.clearScreen()
    led.plot(2, 2)
    basic.pause(90)

    // --- End ---
    basic.clearScreen()
}
